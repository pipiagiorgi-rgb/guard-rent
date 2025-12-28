import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Storage extension prices (with progressive discount)
const STORAGE_PRICES: Record<number, number> = {
    1: 900,   // €9.00
    2: 1600,  // €16.00 (save €2)
    3: 2100   // €21.00 (save €6)
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { caseId, years } = await request.json()

        if (!caseId || !years || !STORAGE_PRICES[years]) {
            return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
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

        const rentalLabel = rentalCase.label || rentalCase.address || 'Rental'
        const priceInCents = STORAGE_PRICES[years]
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Storage Extension: ${years} Year${years > 1 ? 's' : ''}`,
                            description: `Extended storage for "${rentalLabel}"`,
                            metadata: {
                                type: 'storage_extension',
                                years: years.toString()
                            }
                        },
                        unit_amount: priceInCents
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${siteUrl}/payment-success?case=${caseId}&pack=Storage%20Extension`,
            cancel_url: `${siteUrl}/vault/case/${caseId}/storage?cancelled=true`,
            customer_email: user.email,
            metadata: {
                type: 'storage_extension',
                caseId,
                userId: user.id,
                years: years.toString()
            }
        })

        return NextResponse.json({ url: session.url })

    } catch (error: any) {
        console.error('Storage checkout error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
