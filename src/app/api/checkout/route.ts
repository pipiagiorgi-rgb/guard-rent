import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { caseId, packType } = body // packType: 'checkin' | 'moveout' | 'bundle'

        if (!caseId || !packType) {
            return NextResponse.json({ error: 'Missing Required Fields' }, { status: 400 })
        }

        // Spec pricing maps
        const prices: Record<string, number> = {
            'checkin_pack': 1900, // €19.00
            'deposit_pack': 2900, // €29.00
            'bundle_pack': 3900   // €39.00
        }

        const priceAmount = prices[packType]
        if (!priceAmount) {
            return NextResponse.json({ error: 'Invalid Pack Type' }, { status: 400 })
        }

        // Get site URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Guard Rent: ${packType.toUpperCase()} Pack`,
                            description: `License for case ${caseId}`,
                        },
                        unit_amount: priceAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/app/case/${caseId}?success=true`,
            cancel_url: `${origin}/app/case/${caseId}?canceled=true`,
            metadata: {
                caseId: caseId,
                userId: user.id,
                packType: packType
            },
        })

        return NextResponse.json({ url: session.url })

    } catch (err: any) {
        console.error('Stripe Checkout Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
