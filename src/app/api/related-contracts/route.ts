import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

/**
 * GET /api/related-contracts?caseId=xxx
 * List all related contracts for a case
 */
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

    // Verify user owns the case
    const { data: rentalCase } = await supabase
        .from('cases')
        .select('case_id, user_id')
        .eq('case_id', caseId)
        .single()

    if (!rentalCase || rentalCase.user_id !== user.id) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check if user has purchased related contracts pack (or is admin)
    const isAdmin = isAdminEmail(user.email)
    if (!isAdmin) {
        const { data: purchase } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)
            .eq('pack_type', 'related_contracts')
            .single()

        if (!purchase) {
            return NextResponse.json({
                contracts: [],
                purchased: false,
                message: 'Related contracts tracking not purchased for this rental'
            })
        }
    }

    // Get contracts
    const { data: contracts, error } = await supabase
        .from('related_contracts')
        .select('*')
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching related contracts:', error)
        return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 })
    }

    return NextResponse.json({
        contracts: contracts || [],
        purchased: true
    })
}

/**
 * POST /api/related-contracts
 * Create a new related contract
 */
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { caseId, contractType, customType, providerName, startDate, endDate, noticePeriodDays, noticePeriodSource } = body

    if (!caseId || !contractType) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user owns the case
    const { data: rentalCase } = await supabase
        .from('cases')
        .select('case_id, user_id')
        .eq('case_id', caseId)
        .single()

    if (!rentalCase || rentalCase.user_id !== user.id) {
        return NextResponse.json({ error: 'Case not found' }, { status: 404 })
    }

    // Check purchase (or admin)
    const isAdmin = isAdminEmail(user.email)
    if (!isAdmin) {
        const { data: purchase } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)
            .eq('pack_type', 'related_contracts')
            .single()

        if (!purchase) {
            return NextResponse.json({ error: 'Related contracts not purchased' }, { status: 403 })
        }
    }

    // Create contract
    const { data: contract, error } = await supabase
        .from('related_contracts')
        .insert({
            case_id: caseId,
            user_id: user.id,
            contract_type: contractType,
            custom_type: customType || null,
            provider_name: providerName || null,
            start_date: startDate || null,
            end_date: endDate || null,
            notice_period_days: noticePeriodDays || null,
            notice_period_source: noticePeriodSource || null
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating related contract:', error)
        return NextResponse.json({ error: 'Failed to create contract' }, { status: 500 })
    }

    return NextResponse.json({ contract })
}
