import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAdminEmail } from '@/lib/admin'

/**
 * POST /api/admin/unlock-related-contracts
 * Admin-only endpoint to unlock Related Contracts for a case without payment
 */
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only
    if (!isAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 })
    }

    const { caseId } = await request.json()

    if (!caseId) {
        return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
    }

    // Check if already exists
    const { data: existing } = await supabase
        .from('purchases')
        .select('purchase_id')
        .eq('case_id', caseId)
        .eq('pack_type', 'related_contracts')
        .single()

    if (existing) {
        return NextResponse.json({ message: 'Already unlocked', alreadyExists: true })
    }

    // Insert admin unlock (no payment)
    const { error } = await supabase
        .from('purchases')
        .insert({
            case_id: caseId,
            user_id: user.id,
            pack_type: 'related_contracts',
            amount_cents: 0,
            currency: 'EUR',
            stripe_payment_id: `admin_unlock_${Date.now()}`
        })

    if (error) {
        console.error('Failed to unlock related contracts:', error)
        return NextResponse.json({ error: 'Failed to unlock' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Related contracts unlocked', success: true })
}
