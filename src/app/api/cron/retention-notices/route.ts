import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendRetentionWarningEmail } from '@/lib/email'

/**
 * RETENTION NOTICES CRON JOB
 * 
 * Sends advance warning emails to users whose rental data is expiring within 30 days.
 * Users are notified once (tracked via expiry_notified_at column).
 * 
 * Schedule: Daily at 9:00 AM UTC
 * Vercel Cron: 0 9 * * *
 */

export async function GET(req: Request) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase admin client (has access to auth.users)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // Find cases expiring in 30 days that haven't been notified
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const today = new Date()

        // Query cases with user email from profiles table
        const { data: expiringCases, error } = await supabaseAdmin
            .from('cases')
            .select(`
                case_id,
                label,
                retention_until,
                user_id,
                expiry_notified_at,
                profiles!inner(email)
            `)
            .gt('retention_until', today.toISOString())
            .lt('retention_until', thirtyDaysFromNow.toISOString())
            .is('expiry_notified_at', null)

        if (error) {
            console.error('[Retention Notices] Error fetching expiring cases:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!expiringCases || expiringCases.length === 0) {
            return NextResponse.json({ message: 'No cases expiring soon', count: 0 })
        }

        let processedCount = 0
        let errorCount = 0

        for (const rentalCase of expiringCases) {
            const retentionDate = new Date(rentalCase.retention_until)
            const daysUntil = Math.ceil((retentionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

            // Get user email from the joined profiles data
            const userEmail = (rentalCase.profiles as any)?.email

            if (!userEmail) {
                console.error(`[Retention Notices] No email found for case ${rentalCase.case_id}`)
                errorCount++
                continue
            }

            // Send the retention warning email
            const result = await sendRetentionWarningEmail({
                to: userEmail,
                rentalLabel: rentalCase.label || 'Your rental',
                caseId: rentalCase.case_id,
                expiryDate: rentalCase.retention_until,
                daysUntil
            })

            if (result.success) {
                console.log(`[Retention Notices] Sent warning to ${userEmail} for case ${rentalCase.case_id} (expires in ${daysUntil} days)`)

                // Mark as notified
                await supabaseAdmin
                    .from('cases')
                    .update({ expiry_notified_at: new Date().toISOString() })
                    .eq('case_id', rentalCase.case_id)

                processedCount++
            } else {
                console.error(`[Retention Notices] Failed to send email to ${userEmail}:`, result.error)
                errorCount++
            }
        }

        return NextResponse.json({
            message: `Processed ${processedCount} expiring cases`,
            sent: processedCount,
            errors: errorCount
        })

    } catch (error: any) {
        console.error('[Retention Notices] Cron job error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
