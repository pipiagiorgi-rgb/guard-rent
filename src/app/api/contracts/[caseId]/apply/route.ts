import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Apply extracted contract details to the rental record
export async function POST(
    request: Request,
    context: { params: Promise<{ caseId: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        console.log('Apply contract: No user')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { caseId } = await context.params
    const body = await request.json()
    const { analysis, reset } = body

    if (reset) {
        console.log('Resetting contract for case:', caseId)
        const { error } = await supabase
            .from('cases')
            .update({
                contract_analysis: null,
                contract_applied: false,
                contract_applied_at: null,
                lease_start: null,
                lease_end: null,
                termination_details: null,
                rent_amount: null
            })
            .eq('case_id', caseId)
            .eq('user_id', user.id)

        if (error) return NextResponse.json({ error: error.message }, { status: 500 })
        return NextResponse.json({ success: true, reset: true })
    }

    if (!analysis) {
        console.log('Apply contract: No analysis data')
        return NextResponse.json({ error: 'No analysis data provided' }, { status: 400 })
    }

    console.log('=== APPLY CONTRACT DETAILS ===')
    console.log('caseId:', caseId)
    console.log('userId:', user.id)

    // Parse dates from the analysis
    let leaseStart: string | null = null
    let leaseEnd: string | null = null

    // Try to parse lease_start_date (DD/MM/YYYY format)
    if (analysis.lease_start_date?.value && analysis.lease_start_date.value !== 'not found') {
        const startValue = analysis.lease_start_date.value
        const ddmmMatch = startValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (ddmmMatch) {
            leaseStart = `${ddmmMatch[3]}-${ddmmMatch[2].padStart(2, '0')}-${ddmmMatch[1].padStart(2, '0')}`
        }
    }

    // Try to parse lease_end_date
    if (analysis.lease_end_date?.value && analysis.lease_end_date.value !== 'not found') {
        const endValue = analysis.lease_end_date.value
        const ddmmMatch = endValue.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
        if (ddmmMatch) {
            leaseEnd = `${ddmmMatch[3]}-${ddmmMatch[2].padStart(2, '0')}-${ddmmMatch[1].padStart(2, '0')}`
        }
    }

    // Verify ownership and get existing analysis to preserve fileName/text
    const { data: existingCase } = await supabase
        .from('cases')
        .select('contract_analysis')
        .eq('case_id', caseId)
        .eq('user_id', user.id)
        .single()

    const contractAnalysis = existingCase?.contract_analysis || {}

    // Update the rental record
    const updateData: Record<string, any> = {
        contract_applied: true,
        contract_applied_at: new Date().toISOString(),
        last_activity_at: new Date().toISOString(),
        // Save the possibly edited analysis back to the JSONB field
        contract_analysis: {
            ...contractAnalysis,
            analysis: analysis,
            appliedAt: new Date().toISOString()
        }
    }

    if (leaseStart) updateData.lease_start = leaseStart
    if (leaseEnd) updateData.lease_end = leaseEnd

    // Store termination details
    if (analysis.notice_period || analysis.notice_condition || analysis.earliest_termination_date) {
        updateData.termination_details = {
            notice_period: analysis.notice_period?.value,
            notice_condition: analysis.notice_condition?.value,
            notice_method: analysis.notice_method?.value,
            earliest_termination_date: analysis.earliest_termination_date?.value
        }
    }

    // Store rent info
    if (analysis.rent_amount?.value && analysis.rent_amount.value !== 'not found') {
        updateData.rent_amount = analysis.rent_amount.value
    }

    console.log('Update payload:', JSON.stringify(updateData, null, 2))

    // === CRITICAL: Use .select().single() and check response ===
    const { data, error, count } = await supabase
        .from('cases')
        .update(updateData)
        .eq('case_id', caseId)
        .eq('user_id', user.id)
        .select()
        .single()

    // Log EVERYTHING for debugging
    console.log('=== SUPABASE RESPONSE ===')
    console.log('data:', data ? 'exists' : 'null')
    console.log('error:', error?.message || 'none')
    console.log('count:', count)
    console.log('=========================')

    // Check for errors
    if (error) {
        console.error('Supabase update error:', error.code, error.message, error.details)
        return NextResponse.json({
            error: 'Failed to save details',
            details: error.message
        }, { status: 500 })
    }

    // Check if any row was actually updated
    if (!data) {
        console.error('No row updated - check case_id or RLS')
        console.error('Attempted update for case_id:', caseId, 'user_id:', user.id)
        return NextResponse.json({
            error: 'No case found to update. Please refresh and try again.',
            debug: { caseId, userId: user.id }
        }, { status: 404 })
    }

    console.log('✅ Contract details applied successfully')
    console.log('Updated case_id:', data.case_id)

    return NextResponse.json({
        success: true,
        caseId: data.case_id,
        applied: {
            leaseStart,
            leaseEnd,
            hasTerminationDetails: !!updateData.termination_details,
            contractApplied: data.contract_applied
        }
    })
}
