import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import { OrganizationSchema, WebsiteSchema } from '@/lib/seo-schemas';
import { ScrollToTop } from '@/components/ui/ScrollToTop';

export const metadata: Metadata = {
    metadataBase: new URL('https://rentvault.co'),
    title: 'RentVault | Rental Records, Secured',
    description: 'A privacy-first vault for tenants to store contracts, photos, and key dates. Protect your rental deposit with timestamped evidence.',
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
        description: 'A privacy-first vault for tenants to store contracts, photos, and key dates. Protect your rental deposit with timestamped evidence.',
        url: 'https://rentvault.co',
        siteName: 'RentVault',
        images: [
            {
                url: 'https://rentvault.co/og-image.png',
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
        description: 'A privacy-first vault for tenants to store contracts, photos, and key dates. Protect your rental deposit with timestamped evidence.',
        images: ['https://rentvault.co/og-image.png'],
    },
    alternates: {
        canonical: 'https://rentvault.co',
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
            <head>
                {/* Google Analytics */}
                <script async src="https://www.googletagmanager.com/gtag/js?id=G-NLMWG37QBM"></script>
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.dataLayer = window.dataLayer || [];
                            function gtag(){dataLayer.push(arguments);}
                            gtag('js', new Date());
                            gtag('config', 'G-NLMWG37QBM');
                        `,
                    }}
                />
            </head>
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

