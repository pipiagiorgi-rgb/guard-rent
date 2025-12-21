import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendPdfEmail } from '@/lib/email'

// ============================================================
// POST - Email a PDF to the user
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, packType, pdfUrl } = body

        if (!caseId || !packType || !pdfUrl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify case ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id, label, user_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // Verify the user has purchased this pack
        const { data: purchases } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)
            .eq('user_id', user.id)

        const purchasedPacks = purchases?.map(p => p.pack_type) || []
        const hasPack = purchasedPacks.includes(packType) ||
            purchasedPacks.includes('bundle') ||
            (packType === 'checkin_pack' && purchasedPacks.includes('checkin')) ||
            (packType === 'deposit_pack' && purchasedPacks.includes('moveout'))

        if (!hasPack) {
            return NextResponse.json({ error: 'Pack not purchased' }, { status: 403 })
        }

        // Format pack name for email
        const packName = packType === 'checkin_pack'
            ? 'Check-in Report'
            : 'Deposit Recovery Pack'

        // Send email using the centralized email utility
        const result = await sendPdfEmail({
            to: user.email!,
            rentalLabel: rentalCase.label,
            packName,
            downloadUrl: pdfUrl
        })

        if (!result.success) {
            return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully'
        })

    } catch (error: any) {
        console.error('Email PDF error:', error)
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
}
