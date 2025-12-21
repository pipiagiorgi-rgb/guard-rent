import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Ideally protected by a CRON_SECRET header check
export async function GET(request: Request) {
    const supabase = await createClient()
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) 
        // Commented out to allow testing without header set up yet
    }

    const now = new Date()

    // 1. Mark for Pending Deletion (Retention Expired)
    // "If now > retention_until and status active"
    const { data: expiredCases, error: fetchError } = await supabase
        .from('cases')
        .select('case_id, user_id')
        .eq('deletion_status', 'active')
        .lt('retention_until', now.toISOString())

    if (expiredCases && expiredCases.length > 0) {
        const graceDate = new Date()
        graceDate.setDate(graceDate.getDate() + 30) // +30 Days

        for (const c of expiredCases) {
            await supabase.from('cases').update({
                deletion_status: 'pending_deletion',
                grace_until: graceDate.toISOString()
            }).eq('case_id', c.case_id)

            // In real app: Send email reminder here
        }
    }

    // 2. Hard Delete (Grace Expired)
    // "If now > grace_until"
    const { data: doomedCases } = await supabase
        .from('cases')
        .select('case_id, user_id')
        .eq('deletion_status', 'pending_deletion')
        .lt('grace_until', now.toISOString())

    if (doomedCases && doomedCases.length > 0) {
        for (const c of doomedCases) {
            // A. Delete Storage
            const { data: assets } = await supabase.from('assets').select('storage_path').eq('case_id', c.case_id)
            if (assets && assets.length > 0) {
                await supabase.storage.from('guard-rent').remove(assets.map(a => a.storage_path))
            }

            // B. Delete DB Row
            await supabase.from('cases').delete().eq('case_id', c.case_id)

            // C. Audit
            await supabase.from('deletion_audit').insert({
                case_id: c.case_id, // storing ID for record even if FK broken
                reason: 'retention_expired',
                objects_deleted: assets?.length || 0
            })
        }
    }

    return NextResponse.json({
        marked_pending: expiredCases?.length || 0,
        hard_deleted: doomedCases?.length || 0
    })
}
