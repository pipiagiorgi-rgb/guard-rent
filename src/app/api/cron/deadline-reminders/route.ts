import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendDeadlineReminderEmail } from '@/lib/email'

/**
 * DEADLINE REMINDERS CRON JOB
 * 
 * This endpoint should be called daily by Vercel Cron.
 * It checks all active deadlines and sends reminder emails
 * based on user-configured notification preferences (offsets).
 * 
 * Schedule: Daily at 8:00 AM UTC
 * Vercel Cron: 0 8 * * *
 */

export async function GET(req: Request) {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let emailsSent = 0
    let errorsCount = 0

    try {
        // Fetch all deadlines with their case and user info
        const { data: deadlines, error } = await supabaseAdmin
            .from('deadlines')
            .select(`
                deadline_id,
                case_id,
                type,
                date,
                preferences,
                last_notification_sent_at,
                cases!inner (
                    case_id,
                    label,
                    user_id,
                    purchase_type,
                    profiles!inner (
                        user_id,
                        email
                    )
                )
            `)

        if (error) {
            console.error('Error fetching deadlines:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!deadlines || deadlines.length === 0) {
            return NextResponse.json({ message: 'No deadlines found', emailsSent: 0 })
        }

        for (const deadline of deadlines) {
            try {
                const deadlineDate = new Date(deadline.date)
                deadlineDate.setHours(0, 0, 0, 0)

                // Calculate days until deadline
                const daysUntil = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

                // Skip if deadline has passed
                if (daysUntil < 0) continue

                // Get configured offsets (days before to notify)
                const offsets: number[] = deadline.preferences?.offsets || [7, 1, 0]

                // Check if today matches any notification offset
                if (!offsets.includes(daysUntil)) continue

                // Get case and user info
                const caseInfo = (deadline.cases as any)
                if (!caseInfo) continue

                // Only send reminders for PAID rentals (activated)
                const purchaseType = caseInfo.purchase_type
                const isPaid = purchaseType === 'checkin' || purchaseType === 'bundle' || purchaseType === 'moveout'

                if (!isPaid) {
                    console.log(`[Deadline Reminder] Skipping preview rental ${caseInfo.case_id}`)
                    continue
                }

                // Get user email
                const userProfile = caseInfo.profiles
                if (!userProfile?.email) continue

                // Check if we already sent a notification for this offset today
                const lastSent = deadline.last_notification_sent_at
                if (lastSent) {
                    const lastSentDate = new Date(lastSent)
                    lastSentDate.setHours(0, 0, 0, 0)
                    if (lastSentDate.getTime() === today.getTime()) {
                        console.log(`[Deadline Reminder] Already notified today for deadline ${deadline.deadline_id}`)
                        continue
                    }
                }

                // Get notice method if applicable
                const noticeMethod = deadline.preferences?.noticeMethod || undefined

                // Send the reminder email
                console.log(`[Deadline Reminder] Sending ${deadline.type} reminder to ${userProfile.email} (${daysUntil} days)`)

                const result = await sendDeadlineReminderEmail({
                    to: userProfile.email,
                    type: deadline.type as 'termination_notice' | 'rent_payment',
                    rentalLabel: caseInfo.label,
                    date: deadline.date,
                    daysUntil,
                    noticeMethod
                })

                if (result.success) {
                    emailsSent++

                    // Update last notification sent timestamp
                    await supabaseAdmin
                        .from('deadlines')
                        .update({ last_notification_sent_at: new Date().toISOString() })
                        .eq('deadline_id', deadline.deadline_id)
                } else {
                    console.error(`[Deadline Reminder] Failed to send email: ${result.error}`)
                    errorsCount++
                }

            } catch (err) {
                console.error(`[Deadline Reminder] Error processing deadline ${deadline.deadline_id}:`, err)
                errorsCount++
            }
        }

        return NextResponse.json({
            message: `Deadline reminders processed`,
            emailsSent,
            errors: errorsCount,
            timestamp: new Date().toISOString()
        })

    } catch (error: any) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
