import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { headers } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'
import { sendRelatedContractsPurchaseEmail, sendPackPurchaseEmail, sendAdminPaymentNotification } from '@/lib/email'

export async function POST(req: Request) {
    const body = await req.text()
    const headersList = await headers()
    const signature = headersList.get('Stripe-Signature') as string

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
                        last_activity_at: new Date().toISOString(),
                        // CRITICAL: Clear retention warning flags so new warnings are sent
                        expiry_notified_at: null,
                        final_expiry_notified_at: null
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

                        // Notify admin of payment
                        await sendAdminPaymentNotification({
                            userEmail,
                            packType: `storage_${yearsToAdd}`,
                            amount: session.amount_total || 0,
                            rentalLabel,
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
                // Idempotency check - prevent duplicate purchases on webhook retry
                const { data: existing } = await supabaseAdmin
                    .from('purchases')
                    .select('purchase_id')
                    .eq('case_id', caseId)
                    .eq('pack_type', 'related_contracts')
                    .single()

                if (existing) {
                    console.log(`Related contracts already purchased for case ${caseId} - skipping duplicate`)
                    return NextResponse.json({ received: true })
                }

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

                // Send confirmation email for real purchases
                try {
                    // Get rental label and user email for the email
                    const { data: rentalCase } = await supabaseAdmin
                        .from('cases')
                        .select('label, address')
                        .eq('case_id', caseId)
                        .single()

                    const { data: userData } = await supabaseAdmin
                        .from('profiles')
                        .select('email')
                        .eq('user_id', userId)
                        .single()

                    if (userData?.email) {
                        const rentalLabel = rentalCase?.label || rentalCase?.address || 'Your rental'
                        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'

                        await sendRelatedContractsPurchaseEmail({
                            to: userData.email,
                            rentalLabel,
                            dashboardUrl: `${siteUrl}/vault/case/${caseId}`
                        })

                        // Notify admin of payment
                        await sendAdminPaymentNotification({
                            userEmail: userData.email,
                            packType: 'related_contracts',
                            amount: amountCents,
                            rentalLabel,
                            caseId
                        })

                        console.log(`Sent related_contracts purchase email to ${userData.email}`)
                    }
                } catch (emailError) {
                    console.error('Failed to send related_contracts email (non-critical):', emailError)
                    // Don't fail the webhook for email errors
                }

                console.log(`Added related_contracts pack to case ${caseId}`)
            } else {
                // Standard evidence pack handling (checkin, moveout, bundle, short_stay)
                const { stayType } = session.metadata || {}

                // Idempotency check - prevent duplicate purchases on webhook retry
                const { data: existingPack } = await supabaseAdmin
                    .from('purchases')
                    .select('purchase_id')
                    .eq('case_id', caseId)
                    .eq('pack_type', packType)
                    .single()

                if (existingPack) {
                    console.log(`Pack ${packType} already purchased for case ${caseId} - skipping duplicate`)
                    return NextResponse.json({ received: true })
                }

                // Verify stay_type matches case (guard against misapplied packs)
                const { data: caseCheck } = await supabaseAdmin
                    .from('cases')
                    .select('stay_type, check_out_date')
                    .eq('case_id', caseId)
                    .single()

                const caseStayType = caseCheck?.stay_type || 'long_term'

                // Guard: short_stay pack can only be applied to short_stay cases
                if (packType === 'short_stay' && caseStayType !== 'short_stay') {
                    console.error(`Mismatch: short_stay pack attempted on long_term case ${caseId}`)
                    return NextResponse.json({ error: 'Pack type mismatch' }, { status: 400 })
                }

                // Guard: long-term packs can only be applied to long_term cases
                if (['checkin', 'moveout', 'bundle'].includes(packType) && caseStayType === 'short_stay') {
                    console.error(`Mismatch: long-term pack ${packType} attempted on short_stay case ${caseId}`)
                    return NextResponse.json({ error: 'Pack type mismatch' }, { status: 400 })
                }

                // Calculate Retention based on stay type
                const purchaseDate = new Date()
                let retentionDate: Date

                if (packType === 'short_stay') {
                    // Short-stay: 30 days after check_out_date (or purchase if no date)
                    if (caseCheck?.check_out_date) {
                        retentionDate = new Date(caseCheck.check_out_date)
                        retentionDate.setDate(retentionDate.getDate() + 30)
                    } else {
                        retentionDate = new Date(purchaseDate)
                        retentionDate.setDate(retentionDate.getDate() + 30)
                    }
                } else {
                    // Long-term: 12 months from purchase
                    retentionDate = new Date(purchaseDate)
                    retentionDate.setMonth(retentionDate.getMonth() + 12)
                }

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

                // 2. Get rental info for email
                const { data: rentalCase } = await supabaseAdmin
                    .from('cases')
                    .select('label, address')
                    .eq('case_id', caseId)
                    .single()

                // 3. Update Case in DB
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

                // 4. Send pack purchase confirmation email
                try {
                    const { data: userData } = await supabaseAdmin
                        .from('profiles')
                        .select('email')
                        .eq('user_id', userId)
                        .single()

                    if (userData?.email && (packType === 'checkin' || packType === 'moveout' || packType === 'bundle' || packType === 'short_stay')) {
                        const rentalLabel = rentalCase?.label || rentalCase?.address || 'Your rental'

                        await sendPackPurchaseEmail({
                            to: userData.email,
                            packType: packType as 'checkin' | 'moveout' | 'bundle' | 'short_stay',
                            rentalLabel,
                            retentionUntil: retentionDate.toISOString(),
                            caseId
                        })

                        // Notify admin of payment
                        await sendAdminPaymentNotification({
                            userEmail: userData.email,
                            packType,
                            amount: amountCents,
                            rentalLabel,
                            caseId
                        })

                        console.log(`Sent pack purchase confirmation email to ${userData.email}`)
                    }
                } catch (emailError) {
                    console.error('Failed to send pack purchase email (non-critical):', emailError)
                    // Don't fail the webhook for email errors
                }
            }
        }
    }

    return NextResponse.json({ received: true })
}
