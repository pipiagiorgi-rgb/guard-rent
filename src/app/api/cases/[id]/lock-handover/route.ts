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

        // 4. Send backup confirmation email
        if (user.email) {
            const emailRes = await sendEvidenceLockedEmail({
                to: user.email,
                rentalLabel: rentalCase.label || 'Your rental',
                lockType: 'handover',
                lockTimestamp: now,
                caseId,
                photoCount: photoCount || 0
            })

            if (emailRes.success) {
                await supabase.from('audit_logs').insert({
                    case_id: caseId,
                    user_id: user.id,
                    action: 'handover_lock_email_sent',
                    details: {
                        timestamp: new Date().toISOString(),
                        recipient: user.email
                    }
                })
            }
        }

        return NextResponse.json({ success: true, timestamp: now })

    } catch (err: any) {
        console.error('Lock Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
