/**
 * Client-side Google Analytics 4 + Google Ads conversion tracking
 * 
 * This module provides client-side event tracking that works with the
 * global gtag configured in layout.tsx.
 * 
 * For conversion tracking to work with Google Ads, events MUST fire client-side
 * so Google can link them to ad clicks via the gclid cookie.
 */

// Declare gtag as a global function (loaded via layout.tsx)
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void
        dataLayer?: unknown[]
    }
}

/**
 * Send an event to GA4 and Google Ads via gtag
 * Falls back gracefully if gtag is not loaded
 */
export function trackEvent(
    eventName: string,
    params?: Record<string, string | number | boolean | undefined>
) {
    if (typeof window === 'undefined') return

    // Wait for gtag to be available (it loads async)
    if (window.gtag) {
        window.gtag('event', eventName, params)
        console.log(`[Analytics] Tracked: ${eventName}`, params)
    } else {
        console.warn('[Analytics] gtag not available, event not tracked:', eventName)
    }
}

/**
 * Track when a user starts checkout (clicks Buy button)
 * Maps to GA4 'begin_checkout' standard event
 */
export function trackBeginCheckout({
    packType,
    stayType,
    value,
    currency = 'EUR',
    caseId
}: {
    packType: string
    stayType: string
    value: number
    currency?: string
    caseId?: string
}) {
    trackEvent('begin_checkout', {
        currency,
        value,
        items: [{
            item_name: `${stayType}_${packType}`,
            price: value,
            quantity: 1
        }],
        pack_type: packType,
        stay_type: stayType,
        case_id: caseId
    })
}

/**
 * Track successful purchase
 * Note: This should fire on the success/thank-you page after Stripe redirect
 * Maps to GA4 'purchase' standard event
 */
export function trackPurchase({
    transactionId,
    packType,
    stayType,
    value,
    currency = 'EUR',
    caseId
}: {
    transactionId: string
    packType: string
    stayType: string
    value: number
    currency?: string
    caseId?: string
}) {
    trackEvent('purchase', {
        transaction_id: transactionId,
        currency,
        value,
        items: [{
            item_name: `${stayType}_${packType}`,
            price: value,
            quantity: 1
        }],
        pack_type: packType,
        stay_type: stayType,
        case_id: caseId
    })
}

/**
 * Track sign-up (account creation)
 * Maps to GA4 'sign_up' standard event
 */
export function trackSignUp(method = 'email') {
    trackEvent('sign_up', { method })
}

/**
 * Track login
 * Maps to GA4 'login' standard event
 */
export function trackLogin(method = 'magic_link') {
    trackEvent('login', { method })
}

/**
 * Track case creation
 * Custom event for RentVault
 */
export function trackCaseCreated({
    stayType,
    caseId
}: {
    stayType: 'long_term' | 'short_stay'
    caseId: string
}) {
    trackEvent('case_created', {
        stay_type: stayType,
        case_id: caseId
    })
}

/**
 * Track CTA button clicks for funnel analysis
 */
export function trackCtaClick(ctaName: string, location: string) {
    trackEvent('cta_click', {
        cta_name: ctaName,
        location
    })
}
