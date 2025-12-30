import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin'
import { sendShortStayReportReadyEmail } from '@/lib/email'

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
            .select('case_id, user_id, stay_type, label, check_in_date, check_out_date, checkin_completed_at, handover_completed_at, retention_until')
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

        // Guard: Arrival must be sealed first
        if (!rentalCase.checkin_completed_at) {
            return NextResponse.json({ error: 'Seal arrival evidence first' }, { status: 400 })
        }

        // Guard: Already sealed
        if (rentalCase.handover_completed_at) {
            return NextResponse.json({ error: 'Departure already sealed' }, { status: 400 })
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

        // Seal departure
        const sealedAt = new Date().toISOString()
        const { error: updateError } = await supabase
            .from('cases')
            .update({ handover_completed_at: sealedAt })
            .eq('case_id', caseId)

        if (updateError) {
            throw updateError
        }

        // Send report ready email
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('email')
                .eq('user_id', user.id)
                .single()

            if (profile?.email) {
                // Calculate retention date (30 days after check-out for short-stay)
                const retentionDate = rentalCase.retention_until || (() => {
                    const checkOut = rentalCase.check_out_date ? new Date(rentalCase.check_out_date) : new Date()
                    checkOut.setDate(checkOut.getDate() + 30)
                    return checkOut.toISOString()
                })()

                await sendShortStayReportReadyEmail({
                    to: profile.email,
                    propertyName: rentalCase.label || 'Your property',
                    checkInDate: rentalCase.check_in_date || 'Not specified',
                    checkOutDate: rentalCase.check_out_date || 'Not specified',
                    retentionUntil: retentionDate,
                    caseId
                })
            }
        } catch (emailError) {
            console.error('Failed to send report ready email (non-critical):', emailError)
            // Don't fail the request for email errors
        }

        return NextResponse.json({
            success: true,
            sealedAt,
            message: 'Departure evidence sealed — Your short-stay evidence package is ready.'
        })

    } catch (err: any) {
        console.error('Seal departure error:', err)
        return NextResponse.json({ error: err.message || 'Failed to seal departure' }, { status: 500 })
    }
}
