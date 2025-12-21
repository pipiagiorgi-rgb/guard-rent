import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint should be called by a cron job (e.g., Vercel Cron)
// to send advance deletion notice emails

export async function GET(req: Request) {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase admin client inside the function (not at module level)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        // Find cases expiring in 30 days that haven't been notified
        const thirtyDaysFromNow = new Date()
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

        const today = new Date()

        const { data: expiringCases, error } = await supabaseAdmin
            .from('cases')
            .select(`
                case_id,
                label,
                retention_until,
                user_id,
                expiry_notified_at
            `)
            .gt('retention_until', today.toISOString())
            .lt('retention_until', thirtyDaysFromNow.toISOString())
            .is('expiry_notified_at', null)

        if (error) {
            console.error('Error fetching expiring cases:', error)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        if (!expiringCases || expiringCases.length === 0) {
            return NextResponse.json({ message: 'No cases expiring soon', count: 0 })
        }

        let processedCount = 0

        for (const rentalCase of expiringCases) {
            const retentionDate = new Date(rentalCase.retention_until)
            const formattedDate = retentionDate.toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            // Log the notification (in production, send email via Supabase Edge Functions or email provider)
            console.log(`[Retention Notice] Case ${rentalCase.case_id} (${rentalCase.label}) expires on ${formattedDate}`)

            // Mark as notified
            await supabaseAdmin
                .from('cases')
                .update({ expiry_notified_at: new Date().toISOString() })
                .eq('case_id', rentalCase.case_id)

            processedCount++
        }

        return NextResponse.json({
            message: `Processed ${processedCount} expiring cases`,
            count: processedCount
        })

    } catch (error: any) {
        console.error('Cron job error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
