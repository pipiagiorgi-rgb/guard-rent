import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, FileText } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Blog | RentVault - Rental Tips, Updates & Tenant Advice',
    description: 'Expert advice for tenants on protecting deposits, understanding rental rights, and staying organised. News, tips, and updates from RentVault.',
    keywords: 'rental blog, tenant advice, deposit protection tips, rental news, tenant rights updates',
    openGraph: {
        title: 'Blog | RentVault',
        description: 'Expert advice for tenants on protecting deposits and understanding rental rights.',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog',
    },
}

// Blog post data - in a real app this would come from a CMS or database
const blogPosts = [
    {
        slug: 'protect-deposit-before-moving-in',
        title: '5 Things to Do Before Moving into a New Rental',
        excerpt: 'The first 24 hours in your new rental are crucial for protecting your deposit. Here\'s exactly what you should document before unpacking a single box.',
        date: '2024-12-20',
        readTime: '5 min read',
        category: 'Deposit Protection',
        featured: true,
    },
    {
        slug: 'rental-notice-period-mistakes',
        title: 'The 3 Most Expensive Notice Period Mistakes Tenants Make',
        excerpt: 'Missing your notice deadline by just one day can cost you thousands. Learn from these common mistakes before they cost you money.',
        date: '2024-12-15',
        readTime: '4 min read',
        category: 'Legal',
    },
    {
        slug: 'move-in-photo-checklist',
        title: 'The Complete Move-In Photo Checklist',
        excerpt: 'A room-by-room guide to documenting your rental property. Print this checklist and use it on your first day.',
        date: '2024-12-10',
        readTime: '6 min read',
        category: 'Documentation',
    },
    {
        slug: 'landlord-refuses-deposit-return',
        title: 'What to Do When Your Landlord Won\'t Return Your Deposit',
        excerpt: 'Your tenancy has ended but your landlord is holding onto your deposit. Here\'s a step-by-step guide to getting your money back.',
        date: '2024-12-05',
        readTime: '7 min read',
        category: 'Disputes',
    },
]

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function BlogPage() {
    const featuredPost = blogPosts.find(post => post.featured)
    const regularPosts = blogPosts.filter(post => !post.featured)

    return (
        <main className="max-w-[900px] mx-auto px-4 md:px-6 py-12 md:py-16">
            {/* Header */}
            <header className="mb-12">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Blog</h1>
                <p className="text-lg text-slate-600 max-w-2xl">
                    Tips, guides, and updates to help tenants protect their deposits and navigate the rental process.
                </p>
            </header>

            {/* Featured Post */}
            {featuredPost && (
                <section className="mb-12">
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="block group"
                    >
                        <article className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                    Featured
                                </span>
                                <span className="text-sm text-slate-500">{featuredPost.category}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-4">
                                {featuredPost.title}
                            </h2>
                            <p className="text-slate-600 text-lg mb-6 leading-relaxed">
                                {featuredPost.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Calendar size={14} />
                                    {formatDate(featuredPost.date)}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock size={14} />
                                    {featuredPost.readTime}
                                </span>
                            </div>
                        </article>
                    </Link>
                </section>
            )}

            {/* All Posts */}
            <section>
                <h2 className="text-xl font-semibold mb-6 text-slate-900">Recent Articles</h2>
                <div className="space-y-6">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block group"
                        >
                            <article className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                                {post.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-sm text-slate-600 line-clamp-2">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={12} />
                                                {formatDate(post.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={12} />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="mt-16 bg-slate-900 text-white rounded-2xl p-8 md:p-10 text-center">
                <FileText className="mx-auto mb-4 text-slate-400" size={32} />
                <h2 className="text-2xl font-bold mb-3">Ready to protect your deposit?</h2>
                <p className="text-slate-300 mb-6 max-w-md mx-auto">
                    Start documenting your rental today. Free to use, no credit card required.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                >
                    Get started for free
                    <ArrowRight size={18} />
                </Link>
            </section>
        </main>
    )
}
