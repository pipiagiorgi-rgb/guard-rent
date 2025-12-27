import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEvidenceLockedEmail } from '@/lib/email'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { id: caseId } = await params

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify ownership and current status
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('user_id, handover_completed_at, label')
            .eq('case_id', caseId)
            .single()

        if (!rentalCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        if (rentalCase.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        if (rentalCase.handover_completed_at) return NextResponse.json({ error: 'Already locked' }, { status: 400 })

        const now = new Date().toISOString()

        // 1. Lock the handover
        const { error: updateError } = await supabase
            .from('cases')
            .update({ handover_completed_at: now })
            .eq('case_id', caseId)

        if (updateError) throw updateError

        // 2. Count handover photos for email
        const { count: photoCount } = await supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', caseId)
            .in('type', ['handover_photo'])

        // 3. Audit Log
        await supabase.from('audit_logs').insert({
            case_id: caseId,
            user_id: user.id,
            action: 'handover_locked',
            details: {
                timestamp: now,
                reason: 'user_completed_handover'
            }
        })

        // 4. Generate PDF and get 7-day signed download URL
        let pdfDownloadUrl: string | undefined
        try {
            console.log('[Lock Handover] Generating Move-Out PDF...')

            // Get the origin for internal API call
            const origin = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'

            // Call Deposit Pack PDF API with auth cookie forwarded
            const pdfResponse = await fetch(`${origin}/api/pdf/deposit-pack`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Cookie': request.headers.get('cookie') || ''
                },
                body: JSON.stringify({ caseId, forPreview: false })
            })

            if (pdfResponse.ok) {
                const pdfData = await pdfResponse.json()
                if (pdfData.url) {
                    // Create a new 7-day signed URL from the stored PDF
                    const { data: latestOutput } = await supabase
                        .from('outputs')
                        .select('storage_path')
                        .eq('case_id', caseId)
                        .eq('type', 'deposit_pack')
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single()

                    if (latestOutput?.storage_path) {
                        const { data: signedData } = await supabase
                            .storage
                            .from('guard-rent')
                            .createSignedUrl(latestOutput.storage_path, 60 * 60 * 24 * 7, {
                                download: `RentVault_Move-Out_${caseId.slice(0, 8)}.pdf`
                            })
                        pdfDownloadUrl = signedData?.signedUrl
                    }
                }
                console.log('[Lock Handover] PDF generated successfully')
            } else {
                console.error('[Lock Handover] PDF generation failed:', await pdfResponse.text())
            }
        } catch (pdfErr) {
            // PDF generation failure should not block the lock flow
            console.error('[Lock Handover] PDF generation error (non-blocking):', pdfErr)
        }

        // 5. Send backup confirmation email (with PDF link if available)
        if (user.email) {
            console.log('[Lock Handover] Sending confirmation email to:', user.email)
            const emailRes = await sendEvidenceLockedEmail({
                to: user.email,
                rentalLabel: rentalCase.label || 'Your rental',
                lockType: 'handover',
                lockTimestamp: now,
                caseId,
                photoCount: photoCount || 0,
                pdfDownloadUrl
            })

            if (emailRes.success) {
                await supabase.from('audit_logs').insert({
                    case_id: caseId,
                    user_id: user.id,
                    action: 'handover_lock_email_sent',
                    details: {
                        timestamp: new Date().toISOString(),
                        recipient: user.email,
                        hasPdfLink: !!pdfDownloadUrl
                    }
                })
                console.log('[Lock Handover] Confirmation email sent successfully')
            } else {
                console.error('[Lock Handover] Email failed:', emailRes.error)
                // Log failure to audit
                await supabase.from('audit_logs').insert({
                    case_id: caseId,
                    user_id: user.id,
                    action: 'handover_lock_email_failed',
                    details: {
                        timestamp: new Date().toISOString(),
                        error: emailRes.error
                    }
                })
            }
        } else {
            console.warn('[Lock Handover] No user email available for confirmation')
        }

        return NextResponse.json({ success: true, timestamp: now })

    } catch (err: any) {
        console.error('Lock Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
