import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendStorageReminderEmail } from '@/lib/email'

// Cron job to manage data retention and send expiry reminders
// Runs daily
export async function GET(request: Request) {
    const supabase = await createClient()

    // Authorization check
    const authHeader = request.headers.get('authorization')
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const results = {
        reminders_sent: 0,
        marked_pending: 0,
        hard_deleted: 0,
        errors: [] as string[]
    }

    // ============================================================
    // 1. SEND REMINDER EMAILS (60, 30, 7 days before retention_until)
    // ============================================================
    // We check for cases where retention_until is in the future but approaching
    // AND we haven't sent the reminder for that level yet.

    try {
        const { data: activeCases } = await supabase
            .from('cases')
            .select('case_id, user_id, label, retention_until, retention_reminder_level, stay_type')
            .eq('deletion_status', 'active')
            .not('retention_until', 'is', null)
        // Filter in JS for complex date math or use a custom query range if dataset is huge.
        // For now, fetching active cases and checking dates in code is safer for logic correctness.
        // Optimization: Add .gt('retention_until', now.toISOString())

        if (activeCases) {
            for (const c of activeCases) {
                if (!c.retention_until) continue

                const retentionDate = new Date(c.retention_until)
                const diffTime = retentionDate.getTime() - now.getTime()
                const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

                let targetLevel = 0
                if (daysRemaining <= 60 && daysRemaining > 30) targetLevel = 1
                else if (daysRemaining <= 30 && daysRemaining > 7) targetLevel = 2
                else if (daysRemaining <= 7 && daysRemaining > 0) targetLevel = 3

                // Only send if we reached a new urgency level
                if (targetLevel > c.retention_reminder_level) {
                    // Fetch user email
                    const { data: userData } = await supabase.auth.admin.getUserById(c.user_id)
                    const email = userData.user?.email

                    if (email) {
                        try {
                            const renewalLink = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'}/vault/case/${c.case_id}/settings`

                            await sendStorageReminderEmail({
                                to: email,
                                daysRemaining,
                                caseLabel: c.label || 'Rental Case',
                                renewalLink,
                                stayType: c.stay_type as 'long_term' | 'short_stay' | undefined
                            })

                            // Update reminder level
                            await supabase
                                .from('cases')
                                .update({ retention_reminder_level: targetLevel })
                                .eq('case_id', c.case_id)

                            results.reminders_sent++
                        } catch (err: any) {
                            console.error(`Failed to send reminder for case ${c.case_id}:`, err)
                            results.errors.push(`Reminder error ${c.case_id}: ${err.message}`)
                        }
                    }
                }
            }
        }
    } catch (err: any) {
        console.error('Error in reminder phase:', err)
        results.errors.push(`Reminder phase error: ${err.message}`)
    }

    // ============================================================
    // 2. MARK FOR PENDING DELETION (Retention Policy Expiry)
    // ============================================================
    // If retention_until < NOW, we move to 'pending_deletion' and set grace_until = NOW + 30 days

    try {
        const { data: expiredCases } = await supabase
            .from('cases')
            .select('case_id')
            .eq('deletion_status', 'active')
            .lt('retention_until', now.toISOString())

        if (expiredCases && expiredCases.length > 0) {
            const graceDate = new Date()
            graceDate.setDate(graceDate.getDate() + 30) // 30-day grace period

            for (const c of expiredCases) {
                await supabase.from('cases').update({
                    deletion_status: 'pending_deletion',
                    grace_until: graceDate.toISOString()
                }).eq('case_id', c.case_id)

                results.marked_pending++
            }
        }
    } catch (err: any) {
        console.error('Error in marking pending deletion:', err)
        results.errors.push(`Marking error: ${err.message}`)
    }

    // ============================================================
    // 3. HARD DELETE (Grace Period Expired)
    // ============================================================
    // If grace_until < NOW, we nuke everything.

    try {
        const { data: doomedCases } = await supabase
            .from('cases')
            .select('case_id')
            .eq('deletion_status', 'pending_deletion')
            .lt('grace_until', now.toISOString())

        if (doomedCases && doomedCases.length > 0) {
            for (const c of doomedCases) {
                // A. List all assets
                const { data: assets } = await supabase
                    .from('assets')
                    .select('storage_path')
                    .eq('case_id', c.case_id)

                // B. Delete from Storage Bucket
                if (assets && assets.length > 0) {
                    const paths = assets.map(a => a.storage_path)
                    // Delete in batches of 100 if needed, but here simple
                    const { error: storageError } = await supabase.storage
                        .from('guard-rent')
                        .remove(paths)

                    if (storageError) console.error('Storage delete error:', storageError)
                }

                // C. Delete Database Row (Cascades to assets, deadline, purchases, etc. if foreign keys set correctly)
                // If cascade not set on assets, we might need manual delete, but usually assets table references cases on delete cascade.
                // Assuming standard cascade setup.
                await supabase.from('cases').delete().eq('case_id', c.case_id)

                results.hard_deleted++

                // Log deletion audit for traceability (non-blocking)
                try {
                    await supabase.from('deletion_audit').insert({
                        case_id: c.case_id,
                        reason: 'retention_expired',
                        deleted_at: new Date().toISOString()
                    })
                } catch (auditErr) {
                    console.error('Deletion audit error:', auditErr)
                }
            }
        }
    } catch (err: any) {
        console.error('Error in hard delete:', err)
        results.errors.push(`Hard delete error: ${err.message}`)
    }

    return NextResponse.json(results)
}
