import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.ai'),
    title: 'RentVault | Rental Records, Secured',
    description: 'A privacy-first vault for tenants to store contracts, photos, and key dates.',
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
};


export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Navbar />
                <main>{children}</main>
            </body>
        </html>
    );
}
