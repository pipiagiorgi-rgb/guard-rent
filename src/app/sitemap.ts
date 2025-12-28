import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://rentvault.co'

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
        '/guides/mid-tenancy-issues',
        '/guides/notice-periods',
        '/guides/renting-abroad',
    ]

    return staticPages.map((path) => ({
        url: `${baseUrl}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1 : path === '/pricing' ? 0.9 : 0.7,
    }))
}
