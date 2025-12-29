import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        const body = await request.json()
        const { caseId, packType } = body // packType: 'checkin' | 'moveout' | 'bundle' | 'short_stay'

        if (!packType) {
            return NextResponse.json({ error: 'Missing pack type' }, { status: 400 })
        }

        // Price mapping (pack_type format for database)
        const packPricing: Record<string, { price: number, type: string, name: string, description: string }> = {
            'checkin': { price: 1900, type: 'checkin', name: 'Check-In Pack', description: 'Check-in documentation · Includes 1 year secure storage' },
            'moveout': { price: 2900, type: 'moveout', name: 'Handover Pack', description: 'Handover & deposit recovery · Includes 1 year secure storage' },
            'bundle': { price: 3900, type: 'bundle', name: 'Full Pack', description: 'Complete rental protection · Includes 1 year secure storage' },
            'short_stay': { price: 599, type: 'short_stay', name: 'Short-Stay Pack', description: 'Arrival & departure evidence · 30-day secure storage' }
        }

        const pack = packPricing[packType]
        if (!pack) {
            return NextResponse.json({ error: 'Invalid pack type' }, { status: 400 })
        }

        // Fetch case stay_type for metadata (required for webhook verification)
        let stayType: string = 'long_term'
        if (caseId) {
            const { data: caseData } = await supabase
                .from('cases')
                .select('stay_type')
                .eq('case_id', caseId)
                .single()
            stayType = caseData?.stay_type || 'long_term'
        }

        // Get site URL
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

        // Determine success/cancel URLs based on whether user has a case
        let successUrl: string
        let cancelUrl: string

        if (caseId) {
            // User is buying for an existing case - redirect to exports page for immediate access
            successUrl = `${origin}/vault/case/${caseId}/exports?purchase=success&pack=${encodeURIComponent(pack.type)}`
            cancelUrl = `${origin}/vault/case/${caseId}/exports?canceled=true`
        } else {
            // User is buying from pricing page (no account yet)
            successUrl = `${origin}/payment-success?pack=${encodeURIComponent(pack.name)}`
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
                            description: pack.description,
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
                stayType,  // Required for webhook verification
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
