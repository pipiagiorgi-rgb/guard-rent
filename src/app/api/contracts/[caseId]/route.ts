import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    context: { params: Promise<{ caseId: string }> }
) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            console.error('Auth error:', authError.message)
            return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { caseId } = await context.params
        console.log('Fetching contract for case:', caseId, 'user:', user.id)

        // Verify ownership and get contract
        const { data: rentalCase, error } = await supabase
            .from('cases')
            .select('case_id, contract_analysis')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (error) {
            console.log('Supabase query error:', error.code, error.message)

            // PGRST116 = "no rows" - this is fine, just no contract yet
            if (error.code === 'PGRST116') {
                return NextResponse.json({ contract: null, contractApplied: false })
            }

            // Other errors that aren't server issues
            if (error.code === 'PGRST301') { // RLS policy violation
                return NextResponse.json({ contract: null, contractApplied: false })
            }

            // Log unexpected errors for debugging
            console.error('Unexpected DB error:', error)
            return NextResponse.json({ contract: null, contractApplied: false })
        }

        if (!rentalCase) {
            console.log('No rental case found')
            return NextResponse.json({ contract: null, contractApplied: false })
        }

        // Return contract data if exists
        if (rentalCase.contract_analysis) {
            // Get applied status from inside the JSON
            const isApplied = rentalCase.contract_analysis.applied || false
            console.log('Contract analysis found, applied:', isApplied)
            return NextResponse.json({
                contract: rentalCase.contract_analysis,
                contractApplied: isApplied
            })
        }

        console.log('No contract analysis for case:', caseId)
        return NextResponse.json({ contract: null, contractApplied: false })

    } catch (err: any) {
        console.error('Contract route error:', err)
        // Even on errors, return a valid response so the UI can continue
        return NextResponse.json({ contract: null, contractApplied: false })
    }
}
