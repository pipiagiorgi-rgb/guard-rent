import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        const body = await request.json()
        const { caseId, packType } = body // packType: 'checkin' | 'moveout' | 'bundle'

        if (!packType) {
            return NextResponse.json({ error: 'Missing pack type' }, { status: 400 })
        }

        // Price mapping (pack_type format for database)
        const packPricing: Record<string, { price: number, type: string, name: string }> = {
            'checkin': { price: 1900, type: 'checkin', name: 'Check-In Pack' },
            'moveout': { price: 2900, type: 'moveout', name: 'Move-Out Pack' },
            'bundle': { price: 3900, type: 'bundle', name: 'Full Bundle' }
        }

        const pack = packPricing[packType]
        if (!pack) {
            return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })
        }

        // Get site URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        // Determine success/cancel URLs based on whether user has a case
        let successUrl: string
        let cancelUrl: string

        if (caseId) {
            // User is buying for an existing case
            successUrl = `${origin}/vault/case/${caseId}?success=true`
            cancelUrl = `${origin}/vault/case/${caseId}?canceled=true`
        } else {
            // User is buying from pricing page (no account yet)
            successUrl = `${origin}/login?purchased=${packType}`
            cancelUrl = `${origin}/pricing`
        }

        // Create Stripe checkout session
        const sessionConfig: any = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `RentVault: ${pack.name}`,
                            description: caseId ? `For rental ${caseId}` : 'New rental protection',
                        },
                        unit_amount: pack.price,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                packType: pack.type,
                ...(caseId && { caseId }),
                ...(user?.id && { userId: user.id }),
            },
        }

        // If user is logged in, associate email
        if (user?.email) {
            sessionConfig.customer_email = user.email
        }

        const session = await stripe.checkout.sessions.create(sessionConfig)

        return NextResponse.json({ url: session.url })

    } catch (err: any) {
        console.error('Stripe Checkout Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
