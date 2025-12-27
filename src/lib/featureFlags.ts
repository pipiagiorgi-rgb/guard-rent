/**
 * Feature Flags
 * 
 * Centralized configuration for feature toggles.
 * These control early access features and can be flipped for monetization.
 */

// Related Contracts: Free during early access, pricing applies later
export const RELATED_CONTRACTS_EARLY_ACCESS = true

// When true, all users can access Related Contracts without purchase
// When false, requires €9 purchase via Stripe (existing flow)
