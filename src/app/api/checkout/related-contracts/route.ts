import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

const RELATED_CONTRACTS_PRICE = 900 // €9.00

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { caseId } = await request.json()

        if (!caseId) {
            return NextResponse.json({ error: 'Missing case ID' }, { status: 400 })
        }

        // Verify user owns the case
        const { data: rentalCase, error: caseError } = await supabase
            .from('cases')
            .select('case_id, label, address, user_id')
            .eq('case_id', caseId)
            .single()

        if (caseError || !rentalCase || rentalCase.user_id !== user.id) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // Check if already purchased
        const { data: existingPurchase } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)
            .eq('pack_type', 'related_contracts')
            .single()

        if (existingPurchase) {
            return NextResponse.json({ error: 'Already purchased' }, { status: 400 })
        }

        const rentalLabel = rentalCase.label || rentalCase.address || 'Rental'
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.ai'

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: 'Related Contracts Tracking',
                            description: `Track utility contracts for "${rentalLabel}" — reference only, not evidence`,
                        },
                        unit_amount: RELATED_CONTRACTS_PRICE
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${siteUrl}/vault/case/${caseId}?related_contracts=success`,
            cancel_url: `${siteUrl}/vault/case/${caseId}?related_contracts=cancelled`,
            customer_email: user.email,
            metadata: {
                type: 'related_contracts',
                packType: 'related_contracts',
                caseId,
                userId: user.id
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Related contracts checkout error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
