import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo-schemas'

export const metadata: Metadata = {
    title: '5 Things to Do Before Moving into a New Rental | RentVault Blog',
    description: 'The first 24 hours in your new rental are crucial for protecting your deposit. Learn exactly what you should document before unpacking a single box.',
    keywords: 'move-in checklist, rental documentation, protect deposit, tenant tips, new rental',
    openGraph: {
        title: '5 Things to Do Before Moving into a New Rental',
        description: 'The first 24 hours are crucial for protecting your deposit. Here\'s what to document.',
        type: 'article',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog/protect-deposit-before-moving-in',
    },
}

export default function BlogPost() {
    return (
        <>
            <ArticleSchema
                headline="5 Things to Do Before Moving into a New Rental"
                description="The first 24 hours in your new rental are crucial for protecting your deposit."
                url="https://rentvault.ai/blog/protect-deposit-before-moving-in"
                datePublished="2024-12-20"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: '5 Things to Do Before Moving In', url: 'https://rentvault.ai/blog/protect-deposit-before-moving-in' },
                ]}
            />
            <main className="max-w-[700px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    {/* Back link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                                Deposit Protection
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            5 Things to Do Before Moving into a New Rental
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                20 Dec 2024
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                5 min read
                            </span>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            The first 24 hours in your new rental are the most important for protecting your deposit.
                            Before you unpack a single box, there are five critical things you need to do.
                        </p>

                        <h2>Why the First Day Matters</h2>
                        <p>
                            Most tenants who lose money on their deposit don't actually damage anything. They simply
                            can't prove the damage was already there when they moved in. Your landlord has every
                            incentive to forget about that scratched floor or marked wall, but you won't have
                            that luxury when you're trying to get your deposit back.
                        </p>

                        <h2>1. Take Photos of Everything</h2>
                        <p>
                            This is the single most important thing you can do. Before bringing in furniture,
                            photograph every room from multiple angles. Focus on:
                        </p>
                        <ul>
                            <li>Walls and floors (especially corners and edges)</li>
                            <li>Windows and doors</li>
                            <li>Kitchen appliances and countertops</li>
                            <li>Bathroom fixtures and tiles</li>
                            <li>Any existing damage, no matter how small</li>
                        </ul>
                        <p>
                            Pro tip: Email these photos to yourself immediately. This creates a third-party
                            timestamp that's almost impossible to dispute.
                        </p>

                        <h2>2. Record Meter Readings</h2>
                        <p>
                            Take photos of all utility meters (electricity, gas, water) on the day you get
                            the keys. This prevents disputes about energy bills and proves your starting point.
                        </p>

                        <h2>3. Test Everything That Works</h2>
                        <p>
                            Turn on every tap, flush every toilet, switch on every light. If something doesn't
                            work, document it immediately and notify your landlord in writing. You don't want
                            to be blamed for a broken boiler that was faulty when you arrived.
                        </p>

                        <h2>4. Read Your Lease Carefully</h2>
                        <p>
                            Now that you have the keys, sit down and read your lease word by word. Look for:
                        </p>
                        <ul>
                            <li>Notice period requirements</li>
                            <li>Cleaning expectations at move-out</li>
                            <li>Rules about modifications or decorating</li>
                            <li>How the deposit is protected</li>
                        </ul>

                        <h2>5. Store Everything in One Place</h2>
                        <p>
                            Create a single folder (digital or physical) for all your rental documents: lease,
                            photos, meter readings, correspondence with your landlord. In 12 months when you're
                            moving out, you'll thank yourself.
                        </p>

                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 my-8">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Check size={20} className="text-blue-600" />
                                Quick Checklist
                            </h3>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    Photos of every room (before furniture)
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    Close-ups of any existing damage
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    Meter readings photographed
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    All appliances tested
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    Lease read and key dates noted
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">□</span>
                                    Everything stored in one place
                                </li>
                            </ul>
                        </div>

                        <h2>The Bottom Line</h2>
                        <p>
                            Spending 30 minutes documenting your rental on day one can save you hundreds
                            (or thousands) when you move out. It's not about being paranoid; it's about
                            having evidence if you need it.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 p-6 bg-slate-900 text-white rounded-xl text-center">
                        <h3 className="text-xl font-bold mb-2">Need help organizing your rental documents?</h3>
                        <p className="text-slate-300 mb-4">
                            RentVault helps tenants keep contracts, photos, and key dates in one secure place.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Try it free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Related Posts */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                        <div className="space-y-3">
                            <Link
                                href="/blog/move-in-photo-checklist"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">The Complete Move-In Photo Checklist</span>
                                <span className="text-slate-500 text-sm block mt-1">A room-by-room guide to documenting your rental</span>
                            </Link>
                            <Link
                                href="/guides/deposit-protection"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">How to Protect Your Rental Deposit</span>
                                <span className="text-slate-500 text-sm block mt-1">Comprehensive guide to deposit protection</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
