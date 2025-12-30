import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendRetentionWarningEmail, sendShortStayExpiryReminderEmail } from '@/lib/email'

/**
 * RETENTION NOTICES CRON JOB
 * 
 * Sends warning emails to users whose rental data is expiring:
 * - First warning: 30 days before (tracked via expiry_notified_at)
 * - Final warning: 1 day before (tracked via final_expiry_notified_at)
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

    const today = new Date()
    let totalSent = 0
    let totalErrors = 0

    try {
        // ============================================
        // 1. FIRST WARNING: 30 days before expiry
        // ============================================
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const { data: expiringCases30, error: error30 } = await supabaseAdmin
            .from('cases')
            .select(`
                case_id,
                label,
                retention_until,
                user_id,
                stay_type,
                profiles!inner(email)
            `)
            .gt('retention_until', today.toISOString())
            .lt('retention_until', thirtyDaysFromNow.toISOString())
            .is('expiry_notified_at', null)

        if (error30) {
            console.error('[Retention Notices] Error fetching 30-day cases:', error30)
        }

        if (expiringCases30 && expiringCases30.length > 0) {
            for (const rentalCase of expiringCases30) {
                const result = await sendWarningEmail(supabaseAdmin, rentalCase, today, 'expiry_notified_at')
                if (result.success) totalSent++
                else totalErrors++
            }
        }

        // ============================================
        // 2. FINAL WARNING: 1 day before expiry
        // ============================================
        const oneDayFromNow = new Date()
        oneDayFromNow.setDate(oneDayFromNow.getDate() + 1)
        const twoDaysFromNow = new Date()
        twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2)

        const { data: expiringCases1, error: error1 } = await supabaseAdmin
            .from('cases')
            .select(`
                case_id,
                label,
                retention_until,
                user_id,
                stay_type,
                profiles!inner(email)
            `)
            .gt('retention_until', oneDayFromNow.toISOString())
            .lt('retention_until', twoDaysFromNow.toISOString())
            .is('final_expiry_notified_at', null)

        if (error1) {
            console.error('[Retention Notices] Error fetching 1-day cases:', error1)
        }

        if (expiringCases1 && expiringCases1.length > 0) {
            for (const rentalCase of expiringCases1) {
                const result = await sendWarningEmail(supabaseAdmin, rentalCase, today, 'final_expiry_notified_at')
                if (result.success) totalSent++
                else totalErrors++
            }
        }

        return NextResponse.json({
            message: `Sent ${totalSent} retention warnings`,
            sent: totalSent,
            errors: totalErrors
        })

    } catch (error: any) {
        console.error('[Retention Notices] Cron job error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

// Helper function to send warning email and update database
async function sendWarningEmail(
    supabaseAdmin: any,
    rentalCase: any,
    today: Date,
    notifiedColumn: 'expiry_notified_at' | 'final_expiry_notified_at'
): Promise<{ success: boolean }> {
    const retentionDate = new Date(rentalCase.retention_until)
    const daysUntil = Math.ceil((retentionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const userEmail = (rentalCase.profiles as any)?.email

    if (!userEmail) {
        console.error(`[Retention Notices] No email found for case ${rentalCase.case_id}`)
        return { success: false }
    }

    // Branch based on stay type
    let result
    if (rentalCase.stay_type === 'short_stay') {
        // Short-stay: Use specific email with 30-day language
        result = await sendShortStayExpiryReminderEmail({
            to: userEmail,
            propertyName: rentalCase.label || 'Your rental',
            expiryDate: new Date(rentalCase.retention_until).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            }),
            daysUntil,
            caseId: rentalCase.case_id
        })
    } else {
        // Long-term: Use standard retention email with 12-month language
        result = await sendRetentionWarningEmail({
            to: userEmail,
            rentalLabel: rentalCase.label || 'Your rental',
            caseId: rentalCase.case_id,
            expiryDate: rentalCase.retention_until,
            daysUntil
        })
    }

    if (result.success) {
        const warningType = notifiedColumn === 'final_expiry_notified_at' ? 'FINAL' : '30-day'
        console.log(`[Retention Notices] Sent ${warningType} warning to ${userEmail} for case ${rentalCase.case_id}`)

        await supabaseAdmin
            .from('cases')
            .update({ [notifiedColumn]: new Date().toISOString() })
            .eq('case_id', rentalCase.case_id)

        return { success: true }
    } else {
        console.error(`[Retention Notices] Failed to send email to ${userEmail}:`, result.error)
        return { success: false }
    }
}
