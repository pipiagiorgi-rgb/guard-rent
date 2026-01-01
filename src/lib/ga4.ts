/**
 * GA4 Measurement Protocol Helper
 * 
 * Sends server-side events to Google Analytics 4 via Measurement Protocol v2.
 * Used for tracking conversions from Stripe webhooks (purchase events).
 * 
 * Required env vars:
 * - GA4_MEASUREMENT_ID: e.g., "G-XXXXXXXXXX"
 * - GA4_API_SECRET: from GA4 Admin → Data Streams → Measurement Protocol API secrets
 */

import crypto from 'crypto'

const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID
const GA4_API_SECRET = process.env.GA4_API_SECRET
const GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect'

interface GA4EventParams {
    name: string
    params: Record<string, string | number | undefined>
    userId?: string
    clientId?: string
}

/**
 * Generate stable client_id from user_id (fallback when no real client_id available)
 * GA4 requires client_id in format similar to "GA1.1.XXXXXXXXXX.XXXXXXXXXX"
 */
function generateClientId(userId?: string): string {
    if (!userId) {
        // No user_id available - generate random but still valid format
        return `server_${Date.now()}_${Math.random().toString(36).slice(2)}`
    }
    // Create deterministic hash from user_id for consistent tracking
    const hash = crypto.createHash('sha256').update(userId).digest('hex')
    return `GA1.1.${hash.slice(0, 10)}.${hash.slice(10, 20)}`
}

/**
 * Send event to GA4 via Measurement Protocol v2
 * 
 * Non-blocking — logs errors but doesn't throw.
 * GA4 failures should never break the payment flow.
 * 
 * @param name - Event name (e.g., "purchase", "begin_checkout")
 * @param params - Event parameters
 * @param userId - User ID for user-scoped reporting
 * @param clientId - Client ID (uses generated fallback if not provided)
 */
export async function sendGa4Event({ name, params, userId, clientId }: GA4EventParams): Promise<void> {
    // Skip if not configured
    if (!GA4_MEASUREMENT_ID || !GA4_API_SECRET) {
        console.warn('[GA4] Missing GA4_MEASUREMENT_ID or GA4_API_SECRET — skipping event')
        return
    }

    const cid = clientId || generateClientId(userId)

    // Filter out undefined values from params
    const cleanParams: Record<string, string | number> = {}
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
            cleanParams[key] = value
        }
    }

    const payload = {
        client_id: cid,
        user_id: userId,
        events: [{
            name,
            params: {
                ...cleanParams,
                // engagement_time_msec is required for events to appear in realtime reports
                engagement_time_msec: 1,
            }
        }]
    }

    try {
        const url = `${GA4_ENDPOINT}?measurement_id=${GA4_MEASUREMENT_ID}&api_secret=${GA4_API_SECRET}`

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        if (!response.ok) {
            console.error(`[GA4] Failed to send ${name} event: ${response.status} ${response.statusText}`)
        } else {
            console.log(`[GA4] Sent ${name} event: transaction_id=${params.transaction_id || 'N/A'}`)
        }
    } catch (error) {
        console.error('[GA4] Error sending event:', error)
        // Don't throw - GA4 failures shouldn't break payment flow
    }
}

/**
 * Send purchase event to GA4
 * Called from Stripe webhook after successful payment
 */
export async function sendPurchaseEvent({
    transactionId,
    value,
    currency,
    packType,
    stayType,
    caseId,
    userId
}: {
    transactionId: string
    value: number
    currency: string
    packType: string
    stayType: string
    caseId: string
    userId: string
}): Promise<void> {
    await sendGa4Event({
        name: 'purchase',
        params: {
            transaction_id: transactionId,
            value,
            currency,
            pack_type: packType,
            stay_type: stayType,
            case_id: caseId,
        },
        userId
    })
}

/**
 * Send begin_checkout event to GA4
 * Called from checkout API when Stripe session is created
 */
export async function sendBeginCheckoutEvent({
    packType,
    stayType,
    caseId,
    value,
    currency,
    userId
}: {
    packType: string
    stayType: string
    caseId?: string
    value: number
    currency: string
    userId?: string
}): Promise<void> {
    await sendGa4Event({
        name: 'begin_checkout',
        params: {
            pack_type: packType,
            stay_type: stayType,
            case_id: caseId || '',
            value,
            currency,
        },
        userId
    })
}
