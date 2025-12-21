import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.ai'),
    title: 'RentVault | Rental Documentation & Protection',
    description: 'A privacy-first vault for tenants to analyse and translate rental contracts, document apartment condition, and track key dates in one secure place.',
    icons: {
        icon: '/icon.svg',
    },
    openGraph: {
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A privacy-first vault for tenants to analyse and translate rental contracts, document apartment condition, and track key dates.',
        url: 'https://rentvault.ai',
        siteName: 'RentVault',
        images: [
            {
                url: 'https://rentvault.ai/og-image.png',
                width: 1200,
                height: 630,
                alt: 'RentVault - Protect your rental deposit',
            },
        ],
        locale: 'en_GB',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A privacy-first vault for tenants to analyse and translate rental contracts, document apartment condition, and track key dates.',
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
