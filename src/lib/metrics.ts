import { createClient } from '@supabase/supabase-js'

/**
 * Track a metrics event (admin-only table, uses service role)
 * This bypasses RLS to insert into the metrics table which blocks user access.
 */
export async function trackMetric(event: {
    event: 'pdf_downloaded' | 'video_downloaded'
    case_id: string | null
    user_id: string
    stay_type?: 'long_term' | 'short_stay'
    pack_type?: string
    pdf_type?: string
    asset_type?: string
    phase?: string
    is_admin?: boolean
    is_preview?: boolean
}) {
    try {
        // Use service role client to bypass RLS
        const supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { error } = await supabaseAdmin.from('metrics').insert({
            event: event.event,
            case_id: event.case_id,
            user_id: event.user_id,
            stay_type: event.stay_type || null,
            pack_type: event.pack_type || null,
            pdf_type: event.pdf_type || null,
            asset_type: event.asset_type || null,
            phase: event.phase || null,
            is_admin: event.is_admin || false,
            is_preview: event.is_preview || false,
        })

        if (error) {
            console.error('Failed to track metric:', error)
        }
    } catch (err) {
        // Never fail the main request due to metrics
        console.error('Metrics tracking error:', err)
    }
}
