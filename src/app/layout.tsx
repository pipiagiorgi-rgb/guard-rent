import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { OrganizationSchema, WebsiteSchema } from '@/lib/seo-schemas';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.ai'),
    title: 'RentVault | Rental Records, Secured',
    description: 'A privacy-first vault for tenants to store contracts, photos, and key dates.',
    keywords: 'rental deposit, tenant protection, move-in photos, rental documents, lease organiser, rent evidence, deposit dispute, tenant rights',
    icons: {
        icon: [
            { url: '/favicon.ico', sizes: '32x32' },
            { url: '/favicon.png', sizes: '192x192' },
        ],
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A privacy-first vault for tenants to store contracts, photos, and key dates.',
        url: 'https://rentvault.ai',
        siteName: 'RentVault',
        images: [
            {
                url: 'https://rentvault.ai/og-image.png',
                width: 1200,
                height: 630,
                alt: 'RentVault — Protect your rental deposit. Never miss an important deadline.',
            },
        ],
        locale: 'en_GB',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A privacy-first vault for tenants to store contracts, photos, and key dates.',
        images: ['https://rentvault.ai/og-image.png'],
    },
    alternates: {
        canonical: 'https://rentvault.ai',
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <OrganizationSchema />
                <WebsiteSchema />
                <Navbar />
                <main>{children}</main>
                <ScrollToTop />
            </body>
        </html>
    );
}

