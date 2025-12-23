import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, Shield, AlertCircle } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo-schemas'

export const metadata: Metadata = {
    title: 'What to Do When Your Landlord Won\'t Return Your Deposit | RentVault Blog',
    description: 'Your tenancy has ended but your landlord is holding onto your deposit. Here\'s a step-by-step guide to getting your money back.',
    keywords: 'deposit not returned, landlord dispute, get deposit back, tenant rights, deposit recovery',
    openGraph: {
        title: 'What to Do When Your Landlord Won\'t Return Your Deposit',
        description: 'Step-by-step guide to getting your deposit back when your landlord refuses.',
        type: 'article',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog/landlord-refuses-deposit-return',
    },
}

export default function BlogPost() {
    return (
        <>
            <ArticleSchema
                headline="What to Do When Your Landlord Won't Return Your Deposit"
                description="Step-by-step guide to recovering your deposit when your landlord refuses to return it."
                url="https://rentvault.ai/blog/landlord-refuses-deposit-return"
                datePublished="2024-12-05"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: 'Landlord Refuses Deposit', url: 'https://rentvault.ai/blog/landlord-refuses-deposit-return' },
                ]}
            />
            <main className="max-w-[700px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                                Disputes
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            What to Do When Your Landlord Won't Return Your Deposit
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                5 Dec 2024
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                7 min read
                            </span>
                        </div>
                    </header>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            You've moved out, cleaned the property, and returned the keys. But weeks later,
                            your deposit hasn't appeared. Here's exactly what to do.
                        </p>

                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 my-8">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-red-900 mb-1">Know Your Rights</h3>
                                    <p className="text-red-800 text-sm m-0">
                                        In most countries, landlords must return deposits within a specific timeframe
                                        (often 10-30 days) or provide a detailed breakdown of deductions. Check
                                        your local laws for exact requirements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2>Step 1: Check the Timeline</h2>
                        <p>
                            Before assuming the worst, check how long your landlord legally has to return
                            your deposit:
                        </p>
                        <ul>
                            <li><strong>UK:</strong> 10 days is common, but not legally mandated</li>
                            <li><strong>Germany:</strong> Up to 6 months (Kautionsrückzahlung)</li>
                            <li><strong>France:</strong> 2 months maximum</li>
                            <li><strong>US:</strong> Varies by state (14-60 days typical)</li>
                        </ul>
                        <p>
                            If the deadline hasn't passed, wait. If it has, move to step 2.
                        </p>

                        <h2>Step 2: Send a Formal Written Request</h2>
                        <p>
                            Send your landlord a polite but firm letter or email requesting:
                        </p>
                        <ul>
                            <li>Return of your full deposit within 14 days</li>
                            <li>A detailed breakdown if any deductions are being made</li>
                            <li>Receipts or quotes for any claimed damage</li>
                        </ul>
                        <p>
                            Keep a copy of everything. If possible, send by recorded delivery or email
                            with read receipt.
                        </p>

                        <h2>Step 3: Gather Your Evidence</h2>
                        <p>
                            If your landlord claims damage, you'll need to disprove it. Collect:
                        </p>
                        <ul>
                            <li>Move-in photos and videos with timestamps</li>
                            <li>Move-out photos and videos</li>
                            <li>Your original inventory or condition report</li>
                            <li>Any written communication about property condition</li>
                            <li>Proof of professional cleaning if applicable</li>
                        </ul>
                        <p>
                            The more organized your evidence, the stronger your position.
                        </p>

                        <h2>Step 4: Challenge Unfair Deductions</h2>
                        <p>
                            Landlords cannot deduct for:
                        </p>
                        <ul>
                            <li>Normal wear and tear (faded paint, worn carpets)</li>
                            <li>Damage that existed before you moved in</li>
                            <li>Problems outside your control (plumbing issues, appliance age)</li>
                            <li>Improvements you made (unless specified in lease)</li>
                        </ul>
                        <p>
                            Respond in writing, explaining why each deduction is unfair and providing
                            your evidence.
                        </p>

                        <h2>Step 5: Use Official Dispute Resolution</h2>
                        <p>
                            If your landlord won't budge, escalate to official channels:
                        </p>
                        <ul>
                            <li><strong>UK:</strong> Deposit protection scheme's free dispute resolution</li>
                            <li><strong>Germany:</strong> Mieterverein (tenants' association) or small claims</li>
                            <li><strong>France:</strong> Commission départementale de conciliation</li>
                            <li><strong>US:</strong> Small claims court (usually for disputes under $5,000-10,000)</li>
                        </ul>

                        <h2>Step 6: Small Claims Court</h2>
                        <p>
                            As a last resort, you can take your landlord to small claims court. This is:
                        </p>
                        <ul>
                            <li>Usually inexpensive (€30-100 filing fee)</li>
                            <li>No lawyer required</li>
                            <li>Decided within a few weeks to months</li>
                        </ul>
                        <p>
                            Bring all your evidence, be calm and factual, and let the documentation speak for itself.
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 my-8">
                            <div className="flex items-start gap-3">
                                <Shield className="text-blue-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Prevention is Better</h3>
                                    <p className="text-blue-800 text-sm m-0">
                                        The best way to avoid deposit disputes is to document everything from
                                        day one. Take dated photos, keep all communication, and do a proper
                                        move-out walkthrough with your landlord.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2>Key Takeaways</h2>
                        <ol>
                            <li>Know your local deposit return timeline</li>
                            <li>Always communicate in writing</li>
                            <li>Keep organized evidence of property condition</li>
                            <li>Challenge unfair deductions with documentation</li>
                            <li>Use free dispute resolution before court</li>
                        </ol>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 p-6 bg-slate-900 text-white rounded-xl text-center">
                        <h3 className="text-xl font-bold mb-2">Document your next rental properly</h3>
                        <p className="text-slate-300 mb-4">
                            RentVault helps you keep evidence organized so you never lose a deposit dispute.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Get started free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                        <div className="space-y-3">
                            <Link
                                href="/guides/deposit-protection"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">How to Protect Your Rental Deposit</span>
                                <span className="text-slate-500 text-sm block mt-1">Comprehensive protection guide</span>
                            </Link>
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1">Start protection from day one</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
