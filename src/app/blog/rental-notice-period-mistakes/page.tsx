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
                datePublished="2024-12-15"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: 'Notice Period Mistakes', url: 'https://rentvault.ai/blog/rental-notice-period-mistakes' },
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
                            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                Legal
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            The 3 Most Expensive Notice Period Mistakes Tenants Make
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                15 Dec 2024
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                4 min read
                            </span>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Every year, thousands of tenants pay extra months of rent simply because they didn't
                            understand their notice period. These aren't careless people; they just didn't know
                            the rules. Here are the three most expensive mistakes to avoid.
                        </p>

                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 my-8">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="text-amber-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-amber-900 mb-1">The Real Cost</h3>
                                    <p className="text-amber-800 text-sm m-0">
                                        Missing a 3-month notice deadline by just one day can legally require you
                                        to pay rent for 3 more months. At €1,500/month, that's €4,500 you didn't budget for.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2>Mistake #1: Assuming "3 Months" Means What You Think</h2>
                        <p>
                            When your lease says "3 months notice," it rarely means exactly 90 days from when you
                            send notice. In most countries, notice periods work on calendar months, ending at the
                            end of a month.
                        </p>
                        <p>
                            <strong>Example:</strong> If you give notice on March 15th with a 3-month notice period,
                            you probably can't leave until June 30th, not June 15th. That's two extra weeks of rent.
                        </p>
                        <p>
                            <strong>How to avoid it:</strong> Check your lease for the exact wording. It might say
                            "three calendar months" or "the end of the third month following notice." Ask your
                            landlord to confirm your exact leave date in writing before you commit to anything.
                        </p>

                        <h2>Mistake #2: Verbal Notice</h2>
                        <p>
                            "I told my landlord in person." This is one of the most expensive sentences in rental disputes.
                        </p>
                        <p>
                            Verbal notice is almost impossible to prove. If your landlord denies you ever mentioned
                            moving out, you have no evidence. You could end up paying rent for months while arguing
                            about when you actually gave notice.
                        </p>
                        <p>
                            <strong>How to avoid it:</strong> Always give notice in writing. Email is fine, but
                            registered mail is better. This gives you proof of the exact date your notice was received.
                        </p>

                        <h2>Mistake #3: Waiting Until You Find a New Place</h2>
                        <p>
                            The instinct makes sense: find somewhere new before committing to leave. But if you have
                            a 3-month notice period and you wait until you've signed a new lease, you might end up
                            paying double rent for months.
                        </p>
                        <p>
                            <strong>The math:</strong> You find a new flat on April 1st that's available immediately.
                            But your current lease requires 3 months notice. You're now paying rent on two properties
                            until July 1st.
                        </p>
                        <p>
                            <strong>How to avoid it:</strong> Set a reminder 4+ months before your lease ends (or
                            before you want to move). This gives you time to decide, give notice, and then search
                            for a new place during your notice period.
                        </p>

                        <h2>The Simple Fix</h2>
                        <p>
                            Most notice period problems come from one thing: not knowing your deadline. The solution
                            is equally simple:
                        </p>
                        <ol>
                            <li>Check your lease for the exact notice period and how it's calculated</li>
                            <li>Set a calendar reminder 4 months before you might want to move</li>
                            <li>When you give notice, do it in writing and keep proof</li>
                            <li>Get written confirmation of your leave date from your landlord</li>
                        </ol>

                        <p>
                            None of this is complicated. It just requires a few minutes of attention now instead of
                            thousands of euros later.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 p-6 bg-slate-900 text-white rounded-xl text-center">
                        <h3 className="text-xl font-bold mb-2">Never miss a rental deadline</h3>
                        <p className="text-slate-300 mb-4">
                            RentVault extracts key dates from your lease and sends reminders before deadlines.
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
                                href="/guides/notice-periods"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">Understanding Rental Notice Periods</span>
                                <span className="text-slate-500 text-sm block mt-1">Complete guide to notice periods and deadlines</span>
                            </Link>
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1">Protect your deposit from day one</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
