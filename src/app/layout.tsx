import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.ai'),
    title: 'RentVault',
    description: 'A privacy-first vault for tenants to store rental documents, photos, and key dates — securely in one place.',
    icons: {
        icon: '/icon.svg',
    },
    openGraph: {
        title: 'RentVault',
        description: 'Protect your rental deposit. Never miss an important deadline.',
        url: 'https://rentvault.ai',
        siteName: 'rentvault.ai',
        images: [
            {
                url: 'https://rentvault.ai/og-image.png',
                width: 1200,
                height: 630,
                alt: 'RentVault — A privacy-first vault for tenants',
            },
        ],
        locale: 'en_GB',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentVault',
        description: 'Protect your rental deposit. Never miss an important deadline.',
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
