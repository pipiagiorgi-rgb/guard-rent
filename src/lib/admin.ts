// Server-side admin check utility
// This file should NEVER be imported in client components

// Admin emails - can also be set via environment variable
const ADMIN_EMAILS = [
    'pipia.giorgi@gmail.com',
    // Add more admin emails here
]

// Also check environment variable for additional admins
const ENV_ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(e => e.trim()) || []

const ALL_ADMIN_EMAILS = Array.from(new Set([...ADMIN_EMAILS, ...ENV_ADMIN_EMAILS]))

export function isAdminEmail(email: string | undefined | null): boolean {
    if (!email) return false
    return ALL_ADMIN_EMAILS.includes(email.toLowerCase())
}

// Admin users get these benefits:
export const ADMIN_BENEFITS = {
    // All packs are considered purchased
    allPacksUnlocked: true,
    // Retention extended 10 years
    retentionYears: 10,
    // Skip payment for all features
    bypassPayment: true,
    // Enable all premium features
    premiumFeatures: ['pdf_generation', 'deposit_pack', 'extended_retention', 'sms_reminders']
} as const

// Calculate admin retention date (10 years from now)
export function getAdminRetentionDate(): string {
    const date = new Date()
    date.setFullYear(date.getFullYear() + ADMIN_BENEFITS.retentionYears)
    return date.toISOString()
}
