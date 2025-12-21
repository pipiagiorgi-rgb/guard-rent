import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get('Stripe-Signature') as string

    let event: Stripe.Event

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        console.error(`Webhook signature verification failed.`, error.message)
        return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Create Supabase admin client inside function (not at module level)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session
        const { caseId, packType, type, userId } = session.metadata || {}

        // Handle storage extension purchase
        if (type === 'storage_extension' && caseId) {
            // Get current retention_until
            const { data: currentCase } = await supabaseAdmin
                .from('cases')
                .select('retention_until, extension_count')
                .eq('case_id', caseId)
                .single()

            if (currentCase) {
                // Calculate new retention: current + 12 months (additive)
                const currentRetention = currentCase.retention_until
                    ? new Date(currentCase.retention_until)
                    : new Date()

                const newRetention = new Date(currentRetention)
                newRetention.setMonth(newRetention.getMonth() + 12)

                const { error } = await supabaseAdmin
                    .from('cases')
                    .update({
                        retention_until: newRetention.toISOString(),
                        extension_count: (currentCase.extension_count || 0) + 1,
                        last_activity_at: new Date().toISOString()
                    })
                    .eq('case_id', caseId)

                if (error) {
                    console.error('Failed to extend retention:', error)
                    return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 })
                }

                console.log(`Extended retention for case ${caseId} until ${newRetention.toISOString()}`)
            }
        }
        // Handle pack purchases (checkin_pack, deposit_pack, bundle_pack)
        else if (caseId && packType && userId) {
            // Calculate Retention: Now + 12 months
            const purchaseDate = new Date()
            const retentionDate = new Date(purchaseDate)
            retentionDate.setMonth(retentionDate.getMonth() + 12)

            // Get amount from session
            const amountCents = session.amount_total || 0

            // 1. Insert into purchases table
            const { error: purchaseError } = await supabaseAdmin
                .from('purchases')
                .insert({
                    case_id: caseId,
                    user_id: userId,
                    pack_type: packType,
                    amount_cents: amountCents,
                    currency: session.currency?.toUpperCase() || 'EUR',
                    stripe_payment_id: session.payment_intent as string
                })

            if (purchaseError) {
                console.error('Failed to insert purchase record:', purchaseError)
                // Continue anyway - case update is more critical
            }

            // 2. Update Case in DB
            const { error } = await supabaseAdmin
                .from('cases')
                .update({
                    purchase_type: packType,
                    purchase_at: purchaseDate.toISOString(),
                    retention_until: retentionDate.toISOString(),
                    last_activity_at: purchaseDate.toISOString()
                })
                .eq('case_id', caseId)

            if (error) {
                console.error('Failed to update case after payment:', error)
                return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 })
            }

            console.log(`Updated case ${caseId} with pack ${packType}, retention until ${retentionDate.toISOString()}`)
        }
    }

    return NextResponse.json({ received: true })
}
