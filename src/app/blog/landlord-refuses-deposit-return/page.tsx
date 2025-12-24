import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, Shield, AlertCircle, CheckCircle } from 'lucide-react'
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

const Step = ({ number, title, children }: { number: number; title: string; children: React.ReactNode }) => (
    <section className="space-y-4">
        <div className="flex items-center gap-3">
            <span className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {number}
            </span>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
        </div>
        <div className="pl-11 space-y-4">
            {children}
        </div>
    </section>
)

export default function BlogPost() {
    return (
        <>
            <ArticleSchema
                headline="What to Do When Your Landlord Won't Return Your Deposit"
                description="Step-by-step guide to recovering your deposit when your landlord refuses to return it."
                url="https://rentvault.ai/blog/landlord-refuses-deposit-return"
                datePublished="2025-01-05"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: 'Landlord Refuses Deposit', url: 'https://rentvault.ai/blog/landlord-refuses-deposit-return' },
                ]}
            />
            <main className="max-w-[680px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                Disputes
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-[1.2] text-slate-900">
                            What to Do When Your Landlord Won't Return Your Deposit
                        </h1>
                        <div className="flex items-center gap-5 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <Calendar size={15} className="text-slate-400" />
                                5 Jan 2025
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={15} className="text-slate-400" />
                                7 min read
                            </span>
                        </div>
                    </header>

                    <div className="space-y-8">
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            You've moved out, cleaned the property, and returned the keys. But weeks later,
                            your deposit hasn't appeared. Here's exactly what to do.
                        </p>

                        {/* Warning Box */}
                        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="text-red-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-900 mb-2">Know Your Rights</h3>
                                    <p className="text-red-800 text-sm leading-relaxed">
                                        In most countries, landlords must return deposits within a specific timeframe
                                        (often 10-30 days) or provide a detailed breakdown of deductions. Check
                                        your local laws for exact requirements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="space-y-10 pt-4">
                            <Step number={1} title="Check the Timeline">
                                <p className="text-slate-600 leading-relaxed">
                                    Before assuming the worst, check how long your landlord legally has to return
                                    your deposit:
                                </p>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { country: '🇬🇧 UK', info: '10 days after deductions are agreed or dispute is resolved' },
                                        { country: '🇫🇷 France', info: '1–2 months, depending on the condition report' },
                                        { country: '🇩🇪 Germany', info: 'Several months (often up to 6)' },
                                        { country: '🇺🇸 US', info: '14–60 days, depending on the state' },
                                    ].map((item, i) => (
                                        <div key={i} className="bg-slate-50 rounded-lg p-3">
                                            <span className="font-semibold text-slate-900 text-sm">{item.country}:</span>
                                            <span className="text-slate-600 text-sm ml-2">{item.info}</span>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    If the deadline hasn't passed, wait. If it has, move to step 2.
                                </p>
                            </Step>

                            <Step number={2} title="Send a Formal Written Request">
                                <p className="text-slate-600 leading-relaxed">
                                    Send your landlord a polite but firm letter or email requesting:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Return of your full deposit within 14 days',
                                        'A detailed breakdown if any deductions are being made',
                                        'Receipts or quotes for any claimed damage'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600">
                                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 flex-shrink-0"></span>
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <p className="text-blue-800 text-sm">
                                        Keep a copy of everything. If possible, send by recorded delivery or email
                                        with read receipt.
                                    </p>
                                </div>
                            </Step>

                            <Step number={3} title="Gather Your Evidence">
                                <p className="text-slate-600 leading-relaxed">
                                    If your landlord claims damage, you'll need to disprove it. You should have:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Move-in photos and videos with timestamps',
                                        'Move-out photos and videos',
                                        'Your original inventory or condition report',
                                        'Any written communication about property condition'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600">
                                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                    <p className="text-blue-800 text-sm">
                                        💡 <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault</Link> organizes
                                        all your evidence by phase (check-in, handover) and can generate a PDF Deposit Recovery Pack
                                        with timestamped photos ready for dispute resolution.
                                    </p>
                                </div>
                            </Step>

                            <Step number={4} title="Challenge Unfair Deductions">
                                <p className="text-slate-600 leading-relaxed">
                                    Landlords <strong>cannot</strong> deduct for:
                                </p>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <ul className="space-y-2">
                                        {[
                                            'Normal wear and tear (faded paint, worn carpets)',
                                            'Damage that existed before you moved in',
                                            'Problems outside your control (plumbing issues, appliance age)',
                                            'Improvements you made (unless specified in lease)'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-700 text-sm">
                                                <span className="text-red-500">✕</span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </Step>

                            <Step number={5} title="Use Official Dispute Resolution">
                                <p className="text-slate-600 leading-relaxed">
                                    If your landlord won't budge, escalate to official channels:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        { prefix: '🇬🇧 UK:', text: 'Deposit protection scheme\'s free dispute resolution' },
                                        { prefix: '🇩🇪 Germany:', text: 'Mieterverein (tenants\' association) or small claims' },
                                        { prefix: '🇫🇷 France:', text: 'Commission départementale de conciliation' },
                                        { prefix: '🇺🇸 US:', text: 'Small claims court (usually under $5,000-10,000)' },
                                    ].map((item, i) => (
                                        <li key={i} className="text-slate-600 text-sm">
                                            <strong>{item.prefix}</strong> {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </Step>

                            <Step number={6} title="Small Claims Court">
                                <p className="text-slate-600 leading-relaxed">
                                    As a last resort, you can take your landlord to small claims court. This is:
                                </p>
                                <ul className="space-y-2">
                                    {[
                                        'Usually inexpensive (€30-100 filing fee)',
                                        'No lawyer required',
                                        'Decided within a few weeks to months'
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-slate-600">
                                            <CheckCircle size={16} className="text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-slate-600 leading-relaxed text-sm">
                                    Bring all your evidence, be calm and factual, and let the documentation speak for itself.
                                </p>
                            </Step>
                        </div>

                        {/* Prevention tip */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Shield className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900 mb-2">Prevention is Better</h3>
                                    <p className="text-blue-800 text-sm leading-relaxed">
                                        The best way to avoid deposit disputes is to use <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault</Link> from
                                        day one. Upload your contract, take timestamped photos of every room, and generate
                                        evidence reports when you need them.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Key Takeaways */}
                        <section className="space-y-4 pt-4">
                            <h2 className="text-2xl font-bold text-slate-900">Key Takeaways</h2>
                            <ol className="space-y-3">
                                {[
                                    'Know your local deposit return timeline',
                                    'Always communicate in writing',
                                    'Keep organized evidence of property condition',
                                    'Challenge unfair deductions with documentation',
                                    'Use free dispute resolution before court'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600">
                                        <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed">{item}</span>
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-14 p-8 bg-slate-900 text-white rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-3">Document your next rental properly</h3>
                        <p className="text-slate-300 mb-5 max-w-md mx-auto">
                            RentVault helps you keep evidence organized so you never lose a deposit dispute.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Get started free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="mt-14 pt-10 border-t border-slate-200">
                        <h3 className="text-lg font-bold mb-5 text-slate-900">Related Articles</h3>
                        <div className="space-y-4">
                            <Link
                                href="/guides/deposit-protection"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">How to Protect Your Rental Deposit</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Comprehensive protection guide</span>
                            </Link>
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Start protection from day one</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
