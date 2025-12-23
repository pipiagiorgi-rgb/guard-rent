import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pricing | RentVault — Simple, One-Time Payments',
    description: 'RentVault pricing: Check-In Pack €19, Move-Out Pack €29, Full Bundle €39. No subscriptions. Evidence records, timestamped photos, and dispute-ready PDFs for tenants.',
    keywords: 'rentvault pricing, rental deposit protection cost, tenant evidence pack, move-in documentation cost',
    icons: {
        icon: '/favicon.png',
        apple: '/apple-icon.png',
    },
    alternates: {
        canonical: 'https://rentvault.ai/pricing'
    },
    openGraph: {
        title: 'Pricing | RentVault',
        description: 'Simple, one-time payments. No subscriptions. Pay only when you need official exports or extended retention.',
        url: 'https://rentvault.ai/pricing',
        siteName: 'RentVault',
        type: 'website',
    },
}

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
