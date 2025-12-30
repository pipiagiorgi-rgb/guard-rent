import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin'
import { sendShortStayArrivalSealedEmail } from '@/lib/email'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = isAdminEmail(user.email)

    try {
        const { caseId } = await request.json()

        if (!caseId) {
            return NextResponse.json({ error: 'Missing caseId' }, { status: 400 })
        }

        // Verify ownership and stay_type
        const { data: rentalCase, error: caseError } = await supabase
            .from('cases')
            .select('case_id, user_id, stay_type, label, check_in_date, checkin_completed_at')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (caseError || !rentalCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // Guard: Only short_stay cases
        if (rentalCase.stay_type !== 'short_stay') {
            return NextResponse.json({ error: 'This endpoint is for short-stay cases only' }, { status: 400 })
        }

        // Guard: Already sealed
        if (rentalCase.checkin_completed_at) {
            return NextResponse.json({ error: 'Arrival already sealed' }, { status: 400 })
        }

        // Check entitlement: admin OR purchased short_stay pack
        if (!isAdmin) {
            const { data: purchases } = await supabase
                .from('purchases')
                .select('pack_type')
                .eq('case_id', caseId)

            const hasShortStayPack = purchases?.some(p => p.pack_type === 'short_stay')
            if (!hasShortStayPack) {
                return NextResponse.json({ error: 'Short-stay pack required' }, { status: 403 })
            }
        }

        // Seal arrival
        const sealedAt = new Date().toISOString()
        const { error: updateError } = await supabase
            .from('cases')
            .update({ checkin_completed_at: sealedAt })
            .eq('case_id', caseId)

        if (updateError) {
            throw updateError
        }

        // Send confirmation email
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('user_id', user.id)
                .single()

            if (profile?.email) {
                await sendShortStayArrivalSealedEmail({
                    to: profile.email,
                    propertyName: rentalCase.label || 'Your property',
                    checkInDate: rentalCase.check_in_date || 'Not specified',
                    caseId
                })
            }
        } catch (emailError) {
            console.error('Failed to send arrival sealed email (non-critical):', emailError)
            // Don't fail the request for email errors
        }

        return NextResponse.json({
            success: true,
            sealedAt,
            message: 'Arrival evidence sealed — Photos are now timestamped and locked.'
        })

    } catch (err: any) {
        console.error('Seal arrival error:', err)
        return NextResponse.json({ error: err.message || 'Failed to seal arrival' }, { status: 500 })
    }
}
