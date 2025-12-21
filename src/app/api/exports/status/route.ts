import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail, getAdminRetentionDate } from '@/lib/admin'

// GET /api/exports/status?caseId=xxx
// Returns the user's entitlement status for exports
// Admin users get all packs unlocked
export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const caseId = searchParams.get('caseId')

    if (!caseId) {
        return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
    }

    try {
        // Check if user is admin
        const isAdmin = isAdminEmail(user.email)

        // Fetch case data
        const { data: caseData, error: caseError } = await supabase
            .from('cases')
            .select('case_id, retention_until, handover_completed_at')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (caseError || !caseData) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // Get purchased packs from database
        const { data: purchases } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)

        const purchasedPacks = purchases?.map(p => p.pack_type) || []

        // Admin users get all packs unlocked
        if (isAdmin) {
            return NextResponse.json({
                isAdmin: true,
                purchasedPacks: ['checkin_pack', 'deposit_pack', 'bundle_pack'],
                retentionUntil: getAdminRetentionDate(),
                allFeaturesUnlocked: true
            })
        }

        // Regular users - return actual status
        return NextResponse.json({
            isAdmin: false,
            purchasedPacks,
            retentionUntil: caseData.retention_until,
            allFeaturesUnlocked: false
        })

    } catch (err: any) {
        console.error('Exports status error:', err)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}
