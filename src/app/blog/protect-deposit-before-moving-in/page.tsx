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
                            <span className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                Deposit Protection
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-[1.2] text-slate-900">
                            5 Things to Do Before Moving into a New Rental
                        </h1>
                        <div className="flex items-center gap-5 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <Calendar size={15} className="text-slate-400" />
                                20 Dec 2024
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={15} className="text-slate-400" />
                                5 min read
                            </span>
                        </div>
                    </header>

                    {/* Content */}
                    <div className="space-y-8">
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            The first 24 hours in your new rental are the most important for protecting your deposit.
                            Before you unpack a single box, there are five critical things you need to do.
                        </p>

                        {/* Section 1 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">Why the First Day Matters</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Most tenants who lose money on their deposit don't actually damage anything. They simply
                                can't prove the damage was already there when they moved in. Your landlord has every
                                incentive to forget about that scratched floor or marked wall, but you won't have
                                that luxury when you're trying to get your deposit back.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">1. Take Photos of Everything</h2>
                            <p className="text-slate-600 leading-relaxed">
                                This is the single most important thing you can do. Before bringing in furniture,
                                photograph every room from multiple angles. Focus on:
                            </p>
                            <ul className="space-y-3 pl-1">
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Walls and floors (especially corners and edges)</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Windows and doors</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Kitchen appliances and countertops</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Bathroom fixtures and tiles</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Any existing damage, no matter how small</span>
                                </li>
                            </ul>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <p className="text-blue-800 text-sm font-medium">
                                    💡 Pro tip: Use <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault</Link> to
                                    upload photos by room with automatic timestamps. This creates undisputable evidence
                                    that's organized and easy to find when you need it.
                                </p>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">2. Record Meter Readings</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Take photos of all utility meters (electricity, gas, water) on the day you get
                                the keys. This prevents disputes about energy bills and proves your starting point.
                            </p>
                        </section>

                        {/* Section 4 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">3. Test Everything That Works</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Turn on every tap, flush every toilet, switch on every light. If something doesn't
                                work, document it immediately and notify your landlord in writing. You don't want
                                to be blamed for a broken boiler that was faulty when you arrived.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">4. Read Your Lease Carefully</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Now that you have the keys, sit down and read your lease word by word. Look for:
                            </p>
                            <ul className="space-y-3 pl-1">
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Notice period requirements</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Cleaning expectations at move-out</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>Rules about modifications or decorating</span>
                                </li>
                                <li className="flex items-start gap-3 text-slate-600">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2.5 flex-shrink-0"></span>
                                    <span>How the deposit is protected</span>
                                </li>
                            </ul>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <p className="text-blue-800 text-sm font-medium">
                                    💡 Pro tip: <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault's contract scanner</Link> can
                                    extract key dates like notice deadlines automatically and set up reminders so you never miss them.
                                </p>
                            </div>
                        </section>

                        {/* Section 6 */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">5. Store Everything in One Place</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Keep all your rental documents in one secure location: lease, photos, meter readings,
                                and any correspondence with your landlord. In 12 months when you're moving out,
                                you'll thank yourself.
                            </p>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <p className="text-blue-800 text-sm font-medium">
                                    💡 <Link href="/login" className="text-blue-600 underline hover:text-blue-700">RentVault</Link> is built exactly for this.
                                    Upload your contract, photos, and meter readings in one secure vault. When you need to generate
                                    an evidence report for a deposit dispute, everything is organized and ready.
                                </p>
                            </div>
                        </section>

                        {/* Checklist Box */}
                        <section className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 md:p-8 border border-slate-200">
                            <h3 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <Check size={20} className="text-green-600" />
                                Quick Checklist
                            </h3>
                            <ul className="space-y-3">
                                {[
                                    'Photos of every room (before furniture)',
                                    'Close-ups of any existing damage',
                                    'Meter readings photographed',
                                    'All appliances tested',
                                    'Lease read and key dates noted',
                                    'Everything stored in one place'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-700">
                                        <span className="w-5 h-5 border-2 border-slate-300 rounded flex-shrink-0"></span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Summary */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">The Bottom Line</h2>
                            <p className="text-slate-600 leading-relaxed">
                                Spending 30 minutes documenting your rental on day one can save you hundreds
                                (or thousands) when you move out. It's not about being paranoid; it's about
                                having evidence if you need it.
                            </p>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-14 p-8 bg-slate-900 text-white rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-3">Need help organizing your rental documents?</h3>
                        <p className="text-slate-300 mb-5 max-w-md mx-auto">
                            RentVault helps tenants keep contracts, photos, and key dates in one secure place.
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
                                href="/blog/move-in-photo-checklist"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">The Complete Move-In Photo Checklist</span>
                                <span className="text-slate-500 text-sm block mt-1.5">A room-by-room guide to documenting your rental</span>
                            </Link>
                            <Link
                                href="/guides/deposit-protection"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">How to Protect Your Rental Deposit</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Comprehensive guide to deposit protection</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
