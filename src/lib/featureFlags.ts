/**
 * Feature Flags
 * 
 * Centralized configuration for feature toggles.
 * These control early access features and can be flipped for monetization.
 */

// Document Vault: Free during early access, pricing applies later
export const DOCUMENT_VAULT_FREE = true

// When true, all users can access Document Vault without purchase
// When false, requires €9 purchase via Stripe (existing flow)

