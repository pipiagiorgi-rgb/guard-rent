import Script from 'next/script'

interface OrganizationSchemaProps {
    name?: string
    description?: string
    url?: string
    logo?: string
}

interface WebsiteSchemaProps {
    name?: string
    url?: string
    description?: string
}

interface ArticleSchemaProps {
    headline: string
    description: string
    datePublished?: string
    dateModified?: string
    author?: string
    url: string
}

interface SoftwareApplicationSchemaProps {
    name?: string
    description?: string
    applicationCategory?: string
    operatingSystem?: string
    url?: string
}

interface FAQSchemaProps {
    questions: Array<{
        question: string
        answer: string
    }>
}

// Organization Schema - for brand recognition in search
export function OrganizationSchema({
    name = 'RentVault',
    description = 'A secure, private vault for tenants to organise rental documents, move-in photos, and key notice dates.',
    url = 'https://rentvault.co',
    logo = 'https://rentvault.co/og-image.png'
}: OrganizationSchemaProps = {}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name,
        description,
        url,
        logo,
        sameAs: [],
        contactPoint: {
            '@type': 'ContactPoint',
            email: 'support@rentvault.co',
            contactType: 'customer service'
        }
    }

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Website Schema - for sitelinks search box
export function WebsiteSchema({
    name = 'RentVault',
    url = 'https://rentvault.co',
    description = 'Protect your rental deposit with organised documentation'
}: WebsiteSchemaProps = {}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        description,
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: `${url}/guides?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
        }
    }

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Software Application Schema - for app-like search results
export function SoftwareApplicationSchema({
    name = 'RentVault',
    description = 'A secure vault for tenants to store rental documents, photos, and track important dates',
    applicationCategory = 'FinanceApplication',
    operatingSystem = 'Web',
    url = 'https://rentvault.co'
}: SoftwareApplicationSchemaProps = {}) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name,
        description,
        applicationCategory,
        operatingSystem,
        url,
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            description: 'Free to start, pay only for premium features'
        },
        featureList: [
            'Rental document storage',
            'Move-in and move-out photo organisation',
            'Contract scanning with AI',
            'Deadline reminders',
            'PDF evidence reports'
        ]
    }

    return (
        <Script
            id="software-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Article Schema - for guide pages
export function ArticleSchema({
    headline,
    description,
    datePublished = '2024-12-01',
    dateModified = new Date().toISOString().split('T')[0],
    author = 'RentVault Team',
    url
}: ArticleSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline,
        description,
        datePublished,
        dateModified,
        author: {
            '@type': 'Organization',
            name: author,
            url: 'https://rentvault.co'
        },
        publisher: {
            '@type': 'Organization',
            name: 'RentVault',
            url: 'https://rentvault.co',
            logo: {
                '@type': 'ImageObject',
                url: 'https://rentvault.co/og-image.png'
            }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': url
        }
    }

    return (
        <Script
            id="article-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// FAQ Schema - for FAQ sections to appear as rich results
export function FAQSchema({ questions }: FAQSchemaProps) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: answer
            }
        }))
    }

    return (
        <Script
            id="faq-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

// Breadcrumb Schema - for navigation breadcrumbs in search results
export function BreadcrumbSchema({ items }: { items: Array<{ name: string; url: string }> }) {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    }

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
