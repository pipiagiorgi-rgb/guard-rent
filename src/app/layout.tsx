import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.ai'),
    title: 'RentVault',
    description: 'A privacy-first vault for tenants to store rental documents, photos, and key dates — securely in one place.',
    icons: {
        icon: '/favicon.png',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'RentVault | Rental Documentation & Protection',
        description: 'A privacy-first vault for tenants to store rental documents, photos, and key dates.',
        url: 'https://rentvault.ai',
        siteName: 'RentVault',
        images: [
            {
                url: 'https://rentvault.ai/og-image.jpg',
                width: 1200,
                height: 630,
                alt: 'RentVault — Protect your rental deposit',
            },
        ],
        locale: 'en_GB',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentVault | Rental Documentation & Protection',
        description: 'A privacy-first vault for tenants to store rental documents, photos, and key dates.',
        images: ['https://rentvault.ai/og-image.jpg'],
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
