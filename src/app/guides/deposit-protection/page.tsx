import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Check, Folder, Lightbulb, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'How to Protect Your Rental Deposit | RentVault',
    description: 'Learn how to protect your rental deposit with proper documentation. Expert tips on move-in photos, contract review, meter readings, and avoiding costly deposit disputes when you move out.',
    keywords: 'rental deposit protection, security deposit, tenant rights, deposit disputes, move-out documentation',
    openGraph: {
        title: 'How to Protect Your Rental Deposit | RentVault',
        description: 'Simple steps every tenant can take to avoid deposit disputes and keep their money.',
    },
}

export default function DepositProtectionGuide() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            <article className="prose prose-slate max-w-none">
                <header className="mb-10">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link href="/guides" className="hover:text-slate-900">Guides</Link>
                        <span>/</span>
                        <span>Deposit Protection</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        How to protect your rental deposit
                    </h1>
                    <p className="text-lg text-slate-600">
                        Simple steps every tenant can take to avoid deposit disputes and keep their money.
                    </p>
                </header>

                {/* Why This Matters */}
                <section className="mb-10 bg-slate-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Shield size={20} className="text-slate-600" />
                        Why this matters
                    </h2>
                    <p className="text-slate-600 mb-3">
                        Deposit disputes are rarely about whether damage exists — they're about whether you can prove
                        it wasn't your fault. Tenants lose money not because they damaged the property, but because
                        they didn't document its original condition.
                    </p>
                    <p className="text-slate-600">
                        The difference between tenants who recover their full deposit and those who don't usually comes
                        down to organisation: having the right evidence, in the right place, at the right time.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Why deposit disputes happen</h2>
                    <p className="text-slate-600 mb-4">
                        Most deposit disputes come down to one thing: proof. When you move out, landlords may claim
                        damage or poor condition — but without documentation from when you moved in, it's your word against theirs.
                    </p>
                    <p className="text-slate-600">
                        The good news is that protecting yourself is straightforward. With a few simple habits at the
                        start and end of your tenancy, you can significantly reduce the risk of losing money unfairly.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">5 steps to protect your deposit</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">1. Document the apartment on move-in day</h3>
                                <p className="text-slate-600 text-sm">
                                    Take photos of every room before you unpack. Capture walls, floors, appliances,
                                    and any existing damage. Timestamps on photos serve as evidence.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">2. Read your lease carefully</h3>
                                <p className="text-slate-600 text-sm">
                                    Know what's expected of you. Check for cleaning requirements, notice periods,
                                    and any special conditions about the deposit.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">3. Record meter readings</h3>
                                <p className="text-slate-600 text-sm">
                                    Document electricity, gas, and water meter readings when you move in and out.
                                    This prevents disputes about utility bills.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">4. Keep everything organised</h3>
                                <p className="text-slate-600 text-sm">
                                    Store your lease, photos, and correspondence in one place. When disputes arise,
                                    you'll be glad you can find everything quickly.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-slate-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">5. Document again before handover</h3>
                                <p className="text-slate-600 text-sm">
                                    Take move-out photos showing the apartment's condition when you leave.
                                    Compare with your move-in photos to show you've maintained the property.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pro Tips Section */}
                <section className="mb-10 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={20} className="text-blue-600" />
                        <h2 className="text-xl font-semibold text-blue-900">Pro tips from experienced renters</h2>
                    </div>
                    <div className="space-y-3 text-slate-700">
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Request a walkthrough with your landlord</strong> — Having both parties agree on
                                the condition at move-in prevents disputes later.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Keep all communication in writing</strong> — Email instead of calling.
                                Text confirmations count too.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Get receipts for professional cleaning</strong> — If you pay for end-of-tenancy cleaning,
                                keep the receipt as proof.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Don't admit fault for pre-existing damage</strong> — If something was already broken,
                                say "this was here when I arrived" and show your photos.</span>
                        </p>
                    </div>
                </section>

                {/* Soft RentVault Relevance */}
                <section className="bg-slate-50 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Folder className="text-slate-600" size={22} />
                        <h2 className="text-xl font-semibold">Staying organised</h2>
                    </div>
                    <p className="text-slate-600 mb-3">
                        The advice above only works if you can actually find your documents when you need them.
                        Many tenants take photos and save contracts, but scatter them across phones, email attachments,
                        and cloud folders — making them hard to retrieve months later.
                    </p>
                    <p className="text-slate-600">
                        Tools like RentVault exist to help tenants keep everything in one place: contracts, photos,
                        and key dates. But whether you use a dedicated tool or your own system, the key is consistency.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Related guides</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/guides/move-in-photos" className="text-slate-600 hover:text-slate-900">
                                → Why move-in photos matter
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/notice-periods" className="text-slate-600 hover:text-slate-900">
                                → Understanding rental notice periods
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/renting-abroad" className="text-slate-600 hover:text-slate-900">
                                → Tips for tenants renting abroad
                            </Link>
                        </li>
                    </ul>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-900 text-white rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Start protecting your deposit today</h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        Document your rental, organise your evidence, and avoid costly disputes. Free to start.
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
    )
}
