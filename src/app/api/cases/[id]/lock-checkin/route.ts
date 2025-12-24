import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEvidenceLockedEmail } from '@/lib/email'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
    const { id: caseId } = await context.params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id, checkin_completed_at, label')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        if (rentalCase.checkin_completed_at) {
            return NextResponse.json({ error: 'Check-in is already locked' }, { status: 400 })
        }

        const now = new Date().toISOString()

        // 1. Lock the check-in
        const { error: updateError } = await supabase
            .from('cases')
            .update({ checkin_completed_at: now })
            .eq('case_id', caseId)

        if (updateError) throw updateError

        // 2. Count photos for email
        const { count: photoCount } = await supabase
            .from('assets')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', caseId)
            .in('type', ['photo', 'checkin_photo'])

        // 3. Log to Audit (Evidence Integrity)
        await supabase.from('audit_logs').insert({
            case_id: caseId,
            user_id: user.id,
            action: 'checkin_locked',
            details: {
                timestamp: now,
                reason: 'user_action'
            }
        })

        // 4. Send backup confirmation email
        if (user.email) {
            const emailRes = await sendEvidenceLockedEmail({
                to: user.email,
                rentalLabel: rentalCase.label || 'Your rental',
                lockType: 'check-in',
                lockTimestamp: now,
                caseId,
                photoCount: photoCount || 0
            })

            if (emailRes.success) {
                await supabase.from('audit_logs').insert({
                    case_id: caseId,
                    user_id: user.id,
                    action: 'checkin_lock_email_sent',
                    details: {
                        timestamp: new Date().toISOString(),
                        recipient: user.email
                    }
                })
            }
        }

        return NextResponse.json({ success: true, lockedAt: now })
    } catch (err: any) {
        console.error('Lock Check-in Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
