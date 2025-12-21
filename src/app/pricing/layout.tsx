import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Pricing | RentVault',
    description: 'Simple, transparent pricing for RentVault. No subscriptions — pay only when you need protection. €19-€39 one-time payments with 12 months secure storage.',
    alternates: {
        canonical: 'https://rentvault.ai/pricing'
    }
}

export default function PricingLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
