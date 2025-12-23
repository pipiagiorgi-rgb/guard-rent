import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight, Sparkles } from 'lucide-react'

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
        excerpt: 'The first 24 hours in your new rental are crucial for protecting your deposit. Here\'s exactly what you should document before unpacking.',
        date: '2025-01-20',
        readTime: '5 min',
        category: 'Deposit Protection',
        categoryColor: 'blue',
        featured: true,
    },
    {
        slug: 'rental-notice-period-mistakes',
        title: 'The 3 Most Expensive Notice Period Mistakes',
        excerpt: 'Missing your notice deadline by just one day can cost you thousands. Learn from these common mistakes.',
        date: '2025-01-15',
        readTime: '4 min',
        category: 'Legal',
        categoryColor: 'amber',
    },
    {
        slug: 'move-in-photo-checklist',
        title: 'The Complete Move-In Photo Checklist',
        excerpt: 'A room-by-room guide to documenting your rental property. Print this checklist and use it on your first day.',
        date: '2025-01-10',
        readTime: '6 min',
        category: 'Documentation',
        categoryColor: 'green',
    },
    {
        slug: 'landlord-refuses-deposit-return',
        title: 'What to Do When Your Landlord Won\'t Return Your Deposit',
        excerpt: 'Your tenancy has ended but your landlord is holding onto your deposit. Here\'s how to get it back.',
        date: '2025-01-05',
        readTime: '7 min',
        category: 'Disputes',
        categoryColor: 'red',
    },
]

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

const categoryStyles: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    amber: 'bg-amber-50 text-amber-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
}

export default function BlogPage() {
    const featuredPost = blogPosts.find(post => post.featured)
    const regularPosts = blogPosts.filter(post => !post.featured)

    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            {/* Header */}
            <header className="mb-14 text-center">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">Blog</h1>
                <p className="text-lg text-slate-500 max-w-lg mx-auto">
                    Practical tips and guides to help tenants protect deposits and navigate renting.
                </p>
            </header>

            {/* Featured Post */}
            {featuredPost && (
                <section className="mb-14">
                    <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="block group"
                    >
                        <article className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 md:p-10 text-white relative overflow-hidden">
                            {/* Decorative element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-500/10 to-transparent rounded-full -translate-y-32 translate-x-32"></div>

                            <div className="relative">
                                <div className="flex items-center gap-3 mb-5">
                                    <span className="px-3 py-1.5 bg-white/10 text-white/90 text-xs font-semibold rounded-full flex items-center gap-1.5">
                                        <Sparkles size={12} />
                                        Featured
                                    </span>
                                    <span className="text-sm text-white/60">{featuredPost.category}</span>
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold mb-4 group-hover:text-blue-300 transition-colors">
                                    {featuredPost.title}
                                </h2>
                                <p className="text-slate-300 text-lg mb-6 leading-relaxed max-w-xl">
                                    {featuredPost.excerpt}
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14} />
                                            {formatDate(featuredPost.date)}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {featuredPost.readTime}
                                        </span>
                                    </div>
                                    <span className="flex items-center gap-2 text-sm font-medium text-blue-300 group-hover:gap-3 transition-all">
                                        Read article
                                        <ArrowRight size={16} />
                                    </span>
                                </div>
                            </div>
                        </article>
                    </Link>
                </section>
            )}

            {/* All Posts */}
            <section>
                <h2 className="text-xl font-bold mb-6 text-slate-900">All Articles</h2>
                <div className="space-y-4">
                    {regularPosts.map((post) => (
                        <Link
                            key={post.slug}
                            href={`/blog/${post.slug}`}
                            className="block group"
                        >
                            <article className="p-6 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-md transition-all">
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryStyles[post.categoryColor]}`}>
                                                {post.category}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed mb-4">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center gap-4 text-xs text-slate-400">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={12} />
                                                {formatDate(post.date)}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Clock size={12} />
                                                {post.readTime}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                        <ArrowRight size={18} />
                                    </div>
                                </div>
                            </article>
                        </Link>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="mt-16 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl p-8 md:p-10 text-center">
                <h2 className="text-2xl font-bold mb-3 text-slate-900">Ready to protect your deposit?</h2>
                <p className="text-slate-500 mb-6 max-w-md mx-auto">
                    Start documenting your rental today. Free to use, no credit card required.
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors"
                >
                    Get started for free
                    <ArrowRight size={18} />
                </Link>
            </section>
        </main>
    )
}
