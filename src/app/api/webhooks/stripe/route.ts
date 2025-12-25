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
            const yearsToAdd = parseInt(session.metadata?.years || '1', 10)

            // Get current storage info and user email
            const { data: currentCase } = await supabaseAdmin
                .from('cases')
                .select('storage_expires_at, storage_years_purchased, retention_until, label, address, user_id')
                .eq('case_id', caseId)
                .single()

            if (currentCase) {
                // Calculate new expiry: current expiry + years (or from now if no expiry)
                const currentExpiry = currentCase.storage_expires_at || currentCase.retention_until
                    ? new Date(currentCase.storage_expires_at || currentCase.retention_until)
                    : new Date()

                const newExpiry = new Date(currentExpiry)
                newExpiry.setFullYear(newExpiry.getFullYear() + yearsToAdd)

                const newYearsTotal = (currentCase.storage_years_purchased || 1) + yearsToAdd

                const { error } = await supabaseAdmin
                    .from('cases')
                    .update({
                        storage_expires_at: newExpiry.toISOString(),
                        storage_years_purchased: newYearsTotal,
                        storage_extended_at: new Date().toISOString(),
                        retention_until: newExpiry.toISOString(), // Keep in sync
                        last_activity_at: new Date().toISOString()
                    })
                    .eq('case_id', caseId)

                if (error) {
                    console.error('Failed to extend storage:', error)
                    return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 })
                }

                console.log(`Extended storage for case ${caseId}: +${yearsToAdd}yr, total ${newYearsTotal}yr, expires ${newExpiry.toISOString()}`)

                // Send confirmation email
                if (currentCase.user_id) {
                    const { data: userData } = await supabaseAdmin
                        .from('users')
                        .select('email')
                        .eq('id', currentCase.user_id)
                        .single()

                    // Fallback to auth.users if users table doesn't have email
                    const userEmail = userData?.email || session.customer_email

                    if (userEmail) {
                        const { sendStorageExtensionEmail } = await import('@/lib/email')
                        const rentalLabel = currentCase.label || currentCase.address || 'Your rental'

                        await sendStorageExtensionEmail({
                            to: userEmail,
                            rentalLabel,
                            yearsAdded: yearsToAdd,
                            totalYears: newYearsTotal,
                            newExpiryDate: newExpiry.toISOString(),
                            caseId
                        })

                        console.log(`Sent storage extension email to ${userEmail}`)
                    }
                }
            }
        }
        // Handle pack purchases (checkin_pack, deposit_pack, bundle_pack)
        else if (caseId && packType && userId) {
            // Special handling for related_contracts (reference only, no retention update)
            if (packType === 'related_contracts') {
                const amountCents = session.amount_total || 0

                const { error: purchaseError } = await supabaseAdmin
                    .from('purchases')
                    .insert({
                        case_id: caseId,
                        user_id: userId,
                        pack_type: 'related_contracts',
                        amount_cents: amountCents,
                        currency: session.currency?.toUpperCase() || 'EUR',
                        stripe_payment_id: session.payment_intent as string
                    })

                if (purchaseError) {
                    console.error('Failed to insert related_contracts purchase:', purchaseError)
                    return NextResponse.json({ error: 'DB Insert Failed' }, { status: 500 })
                }

                console.log(`Added related_contracts pack to case ${caseId}`)
            } else {
                // Standard evidence pack handling
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
    }

    return NextResponse.json({ received: true })
}
