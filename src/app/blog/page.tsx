import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Guides for Tenants | RentVault - Deposit Protection & Rental Advice',
    description: 'Practical guides to help tenants protect deposits, document rental condition, and understand key deadlines.',
    keywords: 'tenant guides, deposit protection, rental documentation, notice periods, rental advice',
    openGraph: {
        title: 'Guides for Tenants | RentVault',
        description: 'Practical guides to help tenants protect deposits and understand key deadlines.',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog',
    },
}

// Guide data organized by theme
const guides = {
    'Deposits & disputes': [
        {
            slug: 'protect-deposit-before-moving-in',
            title: '5 Things to Do Before Moving into a New Rental',
            excerpt: 'The first 24 hours in your new rental are crucial for protecting your deposit.',
            date: '2025-01-20',
            readTime: '5 min',
        },
        {
            slug: 'landlord-refuses-deposit-return',
            title: 'What to Do When Your Landlord Won\'t Return Your Deposit',
            excerpt: 'Your tenancy has ended but your landlord is holding onto your deposit.',
            date: '2025-01-05',
            readTime: '7 min',
        },
    ],
    'Move-in & move-out': [
        {
            slug: 'move-in-photo-checklist',
            title: 'The Complete Move-In Photo Checklist',
            excerpt: 'A room-by-room guide to documenting your rental property.',
            date: '2025-01-10',
            readTime: '6 min',
        },
    ],
    'Notice periods': [
        {
            slug: 'rental-notice-period-mistakes',
            title: 'The 3 Most Expensive Notice Period Mistakes',
            excerpt: 'Missing your notice deadline can cost you. Learn from these common mistakes.',
            date: '2025-01-15',
            readTime: '4 min',
        },
    ],
}

function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })
}

export default function GuidesPage() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            {/* Header */}
            <header className="mb-12">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
                    Guides for tenants
                </h1>
                <p className="text-lg text-slate-600 mb-4">
                    Practical guides to help tenants protect deposits, document rental condition, and understand key deadlines.
                </p>
                <p className="text-slate-500 leading-relaxed">
                    These guides explain how deposits, condition records, and notice periods work in practice — and why clear documentation can matter when questions arise.
                </p>
            </header>

            {/* Guides by theme */}
            <div className="space-y-12">
                {Object.entries(guides).map(([theme, posts]) => (
                    <section key={theme}>
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 pb-2 border-b border-slate-200">
                            {theme}
                        </h2>
                        <div className="space-y-3">
                            {posts.map((post) => (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className="block group"
                                >
                                    <article className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:shadow-sm transition-all">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors mb-1">
                                                    {post.title}
                                                </h3>
                                                <p className="text-slate-500 text-sm leading-relaxed mb-3">
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
                                            <div className="flex-shrink-0 w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            {/* Simple CTA - below the fold */}
            <section className="mt-16 pt-8 border-t border-slate-200">
                <p className="text-slate-600 text-center">
                    <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Create a free account
                    </Link>
                    {' '}to start documenting your rental.
                </p>
            </section>
        </main>
    )
}
