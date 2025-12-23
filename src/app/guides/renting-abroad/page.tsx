import { Metadata } from 'next'
import Link from 'next/link'
import { Globe, Folder, MapPin, Lightbulb, ArrowRight } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo-schemas'

export const metadata: Metadata = {
    title: 'Tips for Tenants Renting Abroad | RentVault',
    description: 'Essential guide for expats and international tenants on renting in a foreign country. Expert tips on contracts, language barriers, deposits, and documentation to protect yourself abroad.',
    keywords: 'renting abroad, expat rental, international tenant, rental deposit abroad, foreign lease',
    openGraph: {
        title: 'Tips for Tenants Renting Abroad | RentVault',
        description: 'Essential advice for expats and international students renting in a foreign country.',
    },
    alternates: {
        canonical: 'https://rentvault.ai/guides/renting-abroad',
    },
}

export default function RentingAbroadGuide() {
    return (
        <>
            <ArticleSchema
                headline="Tips for Tenants Renting Abroad"
                description="Essential guide for expats and international tenants on renting in a foreign country."
                url="https://rentvault.ai/guides/renting-abroad"
                datePublished="2024-12-01"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Guides', url: 'https://rentvault.ai/guides' },
                    { name: 'Renting Abroad', url: 'https://rentvault.ai/guides/renting-abroad' },
                ]}
            />
            <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article className="prose prose-slate max-w-none">
                    <header className="mb-10">
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                            <Link href="/guides" className="hover:text-slate-900">Guides</Link>
                            <span>/</span>
                            <span>Renting Abroad</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">
                            Tips for tenants renting abroad
                        </h1>
                        <p className="text-lg text-slate-600">
                            Renting in a foreign country comes with unique challenges. Here's how to protect yourself.
                        </p>
                    </header>

                    {/* Why This Matters */}
                    <section className="mb-10 bg-slate-50 rounded-xl p-6">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <MapPin size={20} className="text-slate-600" />
                            Why this matters
                        </h2>
                        <p className="text-slate-600 mb-3">
                            When you rent in a foreign country, you're at a disadvantage from the start. You may not know
                            the local laws, you might not speak the language fluently, and if something goes wrong,
                            you may have already left the country.
                        </p>
                        <p className="text-slate-600">
                            Expats and international students are disproportionately likely to lose deposits. Not because
                            they're bad tenants, but because they didn't document or understand their situation fully.
                            Good organisation is your best protection.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">The challenges of renting abroad</h2>
                        <p className="text-slate-600 mb-4">
                            When you rent in a new country, you're often navigating unfamiliar laws, a different language,
                            and local practices you don't fully understand. This puts you at a disadvantage if disputes arise.
                        </p>
                        <p className="text-slate-600">
                            Many expats and international students have lost deposits or faced unexpected costs because
                            they didn't understand their rights or document their rental properly.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">Common issues for international tenants</h2>
                        <ul className="space-y-3 text-slate-600">
                            <li>
                                <strong>Language barriers.</strong> Leases are often in the local language only,
                                making it hard to understand your obligations and rights.
                            </li>
                            <li>
                                <strong>Different deposit rules.</strong> Some countries require deposits to be held
                                in protected schemes; others don't. Know the local rules.
                            </li>
                            <li>
                                <strong>Unfamiliar notice periods.</strong> A 3-month notice period in Germany works
                                differently than a month-to-month lease in the US.
                            </li>
                            <li>
                                <strong>Verbal agreements.</strong> In some cultures, verbal agreements are common,
                                but harder to enforce if things go wrong.
                            </li>
                            <li>
                                <strong>Difficult to pursue disputes.</strong> If you've already left the country,
                                getting your deposit back becomes much harder.
                            </li>
                        </ul>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">How to protect yourself</h2>
                        <div className="space-y-6">
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-medium mb-2">1. Get everything in writing</h3>
                                <p className="text-slate-600 text-sm">
                                    Even if verbal agreements are common locally, insist on written documentation.
                                    Email confirmations, signed contracts, and receipts all count.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-medium mb-2">2. Translate your lease</h3>
                                <p className="text-slate-600 text-sm">
                                    Use a professional translator or translation tool to understand your contract fully.
                                    Don't sign anything you don't understand.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-medium mb-2">3. Document the apartment thoroughly</h3>
                                <p className="text-slate-600 text-sm">
                                    Take photos of every room on move-in day. This is even more important when renting abroad,
                                    as you may not be there to dispute claims later.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-medium mb-2">4. Know the local tenant rights</h3>
                                <p className="text-slate-600 text-sm">
                                    Research tenant protection laws in your country. Some places have strong protections;
                                    others favour landlords. Adjust your documentation accordingly.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5">
                                <h3 className="font-medium mb-2">5. Keep records accessible</h3>
                                <p className="text-slate-600 text-sm">
                                    Store your lease, photos, and correspondence somewhere you can access from anywhere.
                                    Cloud storage or a dedicated app works well.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pro Tips Section */}
                    <section className="mb-10 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                        <div className="flex items-center gap-2 mb-4">
                            <Lightbulb size={20} className="text-blue-600" />
                            <h2 className="text-xl font-semibold text-blue-900">Pro tips from expat renters</h2>
                        </div>
                        <div className="space-y-3 text-slate-700">
                            <p className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">→</span>
                                <span><strong>Join local expat groups on Facebook/Reddit</strong>. Other expats share warnings about
                                    problematic landlords and useful local tips.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">→</span>
                                <span><strong>Take a video walkthrough on move-in day</strong>. This captures everything at once and
                                    is harder to fake than photos. Email it to yourself for a timestamp.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">→</span>
                                <span><strong>Get a local friend to review your lease</strong>. Even if they're not a lawyer,
                                    a native speaker can spot unusual clauses.</span>
                            </p>
                            <p className="flex items-start gap-2">
                                <span className="text-blue-500 font-bold">→</span>
                                <span><strong>Resolve deposit disputes before you leave</strong>. It's much harder to fight
                                    from your home country. Stay until it's resolved if possible.</span>
                            </p>
                        </div>
                    </section>

                    {/* Soft RentVault Relevance */}
                    <section className="bg-slate-50 rounded-xl p-6 mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Folder className="text-slate-600" size={22} />
                            <h2 className="text-xl font-semibold">Staying organised across borders</h2>
                        </div>
                        <p className="text-slate-600 mb-3">
                            When you're far from home, organisation becomes even more critical. You need your documents
                            accessible from anywhere, not buried in a folder on a laptop you left behind.
                        </p>
                        <p className="text-slate-600">
                            Tools like RentVault are designed to help international tenants keep contracts, photos, and
                            key dates in one accessible place. But even a well-organised cloud folder is better than
                            scattered files across devices.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-semibold mb-4">Related guides</h2>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/guides/deposit-protection" className="text-slate-600 hover:text-slate-900">
                                    → How to protect your rental deposit
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/notice-periods" className="text-slate-600 hover:text-slate-900">
                                    → Understanding rental notice periods
                                </Link>
                            </li>
                            <li>
                                <Link href="/guides/move-in-photos" className="text-slate-600 hover:text-slate-900">
                                    → Why move-in photos matter
                                </Link>
                            </li>
                        </ul>
                    </section>

                    {/* CTA Section */}
                    <section className="bg-slate-900 text-white rounded-xl p-8 text-center">
                        <h2 className="text-2xl font-bold mb-3">Renting abroad? Stay organised.</h2>
                        <p className="text-slate-300 mb-6 max-w-md mx-auto">
                            Keep your lease, photos, and key dates in one place accessible from anywhere. Free to start.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Get started for free
                            <ArrowRight size={18} />
                        </Link>
                    </section>
                </article>
            </main>
        </>
    )
}
