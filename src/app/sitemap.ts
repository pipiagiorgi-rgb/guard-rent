import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://rentvault.ai'

    // Static pages
    const staticPages = [
        '',
        '/pricing',
        '/privacy',
        '/terms',
        '/login',
        '/guides',
        '/guides/deposit-protection',
        '/guides/move-in-photos',
        '/guides/notice-periods',
        '/guides/renting-abroad',
        '/blog',
        '/blog/protect-deposit-before-moving-in',
        '/blog/rental-notice-period-mistakes',
        '/blog/move-in-photo-checklist',
        '/blog/landlord-refuses-deposit-return',
    ]

    return staticPages.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : path.startsWith('/blog') ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : path === '/pricing' ? 0.9 : path === '/blog' ? 0.8 : 0.7,
    }))
}

