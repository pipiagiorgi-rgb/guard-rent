import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Camera, Clock, AlertCircle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Deposit Protection Guide | RentVault',
    description: 'How to protect your rental deposit in Belgium, France, and Luxembourg. Evidence-based strategies that work.',
    alternates: {
        canonical: 'https://rentvault.ai/guides/deposit-protection'
    }
}

export default function DepositProtectionGuide() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="pt-20 pb-12 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-[800px] mx-auto">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm"
                    >
                        <ArrowLeft size={16} />
                        All guides
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Shield className="text-blue-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Protecting your deposit
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Around one in four renters report not getting their full deposit back.
                        The difference between getting your money and losing it usually comes down to evidence.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* The Reality */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The reality of deposit disputes</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Most deposit deductions fall into three categories:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Cleaning</p>
                                <p className="text-red-700 text-sm">"Professional cleaning required" — often €200-400</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Damage</p>
                                <p className="text-red-700 text-sm">Scratches, marks, holes — can be hundreds to thousands</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Missing items</p>
                                <p className="text-red-700 text-sm">Lost keys, broken fixtures — often inflated prices</p>
                            </div>
                        </div>
                    </div>

                    {/* What Actually Works */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What actually works</h2>
                        <div className="space-y-4">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">1. Document everything at move-in</h3>
                                <p className="text-slate-700 text-sm">
                                    Photograph every room, wall, floor, appliance, and existing damage.
                                    If it's not documented, it didn't exist. Take photos before you move any furniture in.
                                </p>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">2. Keep proof of deposit payment</h3>
                                <p className="text-slate-700 text-sm">
                                    Bank transfer receipt, check copy, or wire confirmation. This proves how much you paid and when.
                                </p>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">3. Report problems immediately</h3>
                                <p className="text-slate-700 text-sm">
                                    When something breaks or gets damaged during your tenancy, document it and notify your landlord in writing.
                                    This creates a paper trail showing you reported issues promptly.
                                </p>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">4. Document the handover</h3>
                                <p className="text-slate-700 text-sm">
                                    Take photos at move-out too. If possible, do a walkthrough with the landlord and get written acknowledgment of the property condition.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Country-specific deposit rules */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Deposit rules by country</h2>

                        <div className="space-y-6">
                            {/* Belgium */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇧🇪</span>
                                        <h3 className="font-bold text-slate-900">Belgium</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <p><strong>Maximum:</strong> 2-3 months rent (varies by region)</p>
                                        <p><strong>Where it's held:</strong> Must be in a blocked bank account in your name. The landlord cannot access it without your consent.</p>
                                        <p><strong>Return deadline:</strong> At the end of the tenancy, both parties must agree to release the funds. If there's a dispute, it goes to the Justice of the Peace (Juge de Paix).</p>
                                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                                            <p className="text-blue-800"><strong>Tip:</strong> If your deposit isn't in a blocked account, you're entitled to the interest. Some landlords skip this — know your rights.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* France */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇫🇷</span>
                                        <h3 className="font-bold text-slate-900">France</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <p><strong>Maximum:</strong> 1 month rent (unfurnished), 2 months (furnished)</p>
                                        <p><strong>Return deadline:</strong> 1 month if entry and exit inventories match, 2 months if they differ</p>
                                        <p><strong>Penalties for late return:</strong> If the landlord doesn't return your deposit on time, you're entitled to 10% of the monthly rent for each month of delay.</p>
                                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                                            <p className="text-blue-800"><strong>Tip:</strong> Send your new address to the landlord by registered mail. This starts the clock on the return deadline.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Luxembourg */}
                            <div className="border border-slate-200 rounded-xl overflow-hidden">
                                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">🇱🇺</span>
                                        <h3 className="font-bold text-slate-900">Luxembourg</h3>
                                    </div>
                                </div>
                                <div className="p-5">
                                    <div className="space-y-3 text-sm text-slate-700">
                                        <p><strong>Maximum:</strong> 3 months rent</p>
                                        <p><strong>Where it's held:</strong> Often in a blocked bank account (compte bloqué) or held by the landlord. Verify your specific arrangement.</p>
                                        <p><strong>Return:</strong> No legally mandated timeline, but typically within 1-2 months after exit inventory if no issues.</p>
                                        <div className="bg-blue-50 rounded-lg p-3 mt-3">
                                            <p className="text-blue-800"><strong>Tip:</strong> Request a joint exit inspection with the landlord and get a signed acknowledgment of the property's condition.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* If There's a Dispute */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">If there's a dispute</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When a landlord refuses to return your deposit:
                        </p>
                        <ol className="space-y-3 text-slate-700">
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900">1.</span>
                                <span>Request a detailed, itemized list of deductions in writing</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900">2.</span>
                                <span>Compare it to your move-in photos and documentation</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900">3.</span>
                                <span>Send a formal letter disputing unjustified charges (registered mail)</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900">4.</span>
                                <span>If unresolved, contact a tenant association or consult a lawyer</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="font-bold text-slate-900">5.</span>
                                <span>Small claims court is often an option for deposit disputes</span>
                            </li>
                        </ol>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Start building your evidence</h3>
                        <p className="text-slate-300 mb-6">Document your rental from day one. RentVault keeps everything organized with timestamps.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Start now
                                <ArrowRight size={18} />
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-6 py-3 border border-slate-600 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                            >
                                View pricing
                            </Link>
                        </div>
                    </div>

                </div>
            </section>

            {/* Related guides */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/guides/move-in-photos" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Camera size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Why move-in photos matter</span>
                            </div>
                        </Link>
                        <Link href="/guides/mid-tenancy-issues" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <AlertCircle size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Logging mid-tenancy issues</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
