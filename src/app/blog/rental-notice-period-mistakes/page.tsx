import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo-schemas'

export const metadata: Metadata = {
    title: 'The 3 Most Expensive Notice Period Mistakes | RentVault Blog',
    description: 'Missing your notice deadline by just one day can cost you thousands. Learn from these common mistakes before they cost you money.',
    keywords: 'notice period mistakes, rental termination, lease ending, tenant notice, avoid extra rent',
    openGraph: {
        title: 'The 3 Most Expensive Notice Period Mistakes Tenants Make',
        description: 'Missing your notice deadline can cost you months of extra rent. Learn from these mistakes.',
        type: 'article',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog/rental-notice-period-mistakes',
    },
}

export default function BlogPost() {
    return (
        <>
            <ArticleSchema
                headline="The 3 Most Expensive Notice Period Mistakes Tenants Make"
                description="Missing your notice deadline by just one day can cost you thousands."
                url="https://rentvault.ai/blog/rental-notice-period-mistakes"
                datePublished="2025-01-15"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: 'Notice Period Mistakes', url: 'https://rentvault.ai/blog/rental-notice-period-mistakes' },
                ]}
            />
            <main className="max-w-[680px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    {/* Back link */}
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    {/* Header */}
                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="px-3 py-1.5 bg-amber-50 text-amber-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                Legal
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-[1.2] text-slate-900">
                            The 3 Most Expensive Notice Period Mistakes Tenants Make
                        </h1>
                        <div className="flex items-center gap-5 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <Calendar size={15} className="text-slate-400" />
                                15 Jan 2025
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={15} className="text-slate-400" />
                                4 min read
                            </span>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="space-y-8">
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            Every year, countless tenants pay extra months of rent simply because they didn't
                            understand their notice period. These aren't careless people; they just didn't know
                            the rules. Here are the three most expensive mistakes to avoid.
                        </p>

                        {/* Warning Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="text-amber-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-amber-900 mb-2">The Real Cost</h3>
                                    <p className="text-amber-800 text-sm leading-relaxed">
                                        Missing your notice deadline can cause your contract to roll over for another year,
                                        leaving you facing a hefty fine or locked into the lease.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Mistake 1 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">
                                Mistake #1: Assuming "3 Months" Means What You Think
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                When your lease says "3 months notice," it rarely means exactly 90 days from when you
                                send notice. In most countries, notice periods work on calendar months, ending at the
                                end of a month.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    <strong className="text-slate-900">Example:</strong> If you give notice on March 15th with a 3-month notice period,
                                    you probably can't leave until June 30th, not June 15th. That's two extra weeks of rent.
                                </p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <p className="text-green-800 text-sm">
                                    <strong>How to avoid it:</strong> Check your lease for the exact wording.
                                    <Link href="/login" className="text-green-700 underline hover:text-green-800">RentVault</Link> can
                                    scan your contract and calculate your exact leave date based on the notice rules.
                                </p>
                            </div>
                        </section>

                        {/* Mistake 2 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">
                                Mistake #2: Verbal Notice
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                "I told my landlord in person." This is one of the most expensive sentences in rental disputes.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Verbal notice is almost impossible to prove. If your landlord denies you ever mentioned
                                moving out, you have no evidence. You could end up paying rent for months while arguing
                                about when you actually gave notice.
                            </p>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <p className="text-green-800 text-sm">
                                    <strong>How to avoid it:</strong> Always give notice in writing. Email is fine, but
                                    registered mail is better. This gives you proof of the exact date your notice was received.
                                </p>
                            </div>
                        </section>

                        {/* Mistake 3 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">
                                Mistake #3: Waiting Until You Find a New Place
                            </h2>
                            <p className="text-slate-600 leading-relaxed">
                                The instinct makes sense: find somewhere new before committing to leave. But if you have
                                a 3-month notice period and you wait until you've signed a new lease, you might end up
                                paying double rent for months.
                            </p>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    <strong className="text-slate-900">The math:</strong> You find a new flat on April 1st that's available immediately.
                                    But your current lease requires 3 months notice. You're now paying rent on two properties
                                    until July 1st.
                                </p>
                            </div>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                                <p className="text-green-800 text-sm">
                                    <strong>How to avoid it:</strong> <Link href="/login" className="text-green-700 underline hover:text-green-800">RentVault</Link> automatically
                                    sets reminders 90 days before your notice deadline. You'll get email alerts so you never
                                    miss the window to give notice.
                                </p>
                            </div>
                        </section>

                        {/* Summary */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">The Simple Fix</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Most notice period problems come from one thing: not knowing your deadline. The solution
                                is equally simple:
                            </p>
                            <ol className="space-y-3 pl-1">
                                {[
                                    'Check your lease for the exact notice period and how it\'s calculated',
                                    'Set a calendar reminder 4 months before you might want to move',
                                    'When you give notice, do it in writing and keep proof',
                                    'Get written confirmation of your leave date from your landlord'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600">
                                        <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ol>
                            <p className="text-slate-600 leading-relaxed pt-2">
                                <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault</Link> handles
                                all of this automatically. Just upload your lease and we'll extract the deadlines, calculate
                                your leave date, and send you reminders.
                            </p>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-14 p-8 bg-slate-900 text-white rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-3">Never miss a rental deadline</h3>
                        <p className="text-slate-300 mb-5 max-w-md mx-auto">
                            RentVault extracts key dates from your lease and sends reminders before deadlines.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Try it free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Related Posts */}
                    <div className="mt-14 pt-10 border-t border-slate-200">
                        <h3 className="text-lg font-bold mb-5 text-slate-900">Related Articles</h3>
                        <div className="space-y-4">
                            <Link
                                href="/guides/notice-periods"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">Understanding Rental Notice Periods</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Complete guide to notice periods and deadlines</span>
                            </Link>
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Protect your deposit from day one</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
