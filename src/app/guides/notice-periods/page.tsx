import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Camera, Shield } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Notice Periods Guide | RentVault',
    description: 'Understand rental notice periods in Belgium, France, and Luxembourg. Missing your deadline can cost months of extra rent.',
    alternates: {
        canonical: 'https://rentvault.ai/guides/notice-periods'
    }
}

export default function NoticePeriodsGuide() {
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
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="text-amber-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Understanding notice periods
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Missing your notice deadline doesn't just delay your move — it can lock you into paying rent for months you didn't plan on.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* The Stakes */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why this matters</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If your contract requires 3 months notice and you only give 2, you're legally bound to pay that extra month.
                            Landlords can pursue this through courts, and they usually win.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <p className="text-amber-800 text-sm">
                                <strong>Example:</strong> You find a great new apartment and want to move next month.
                                But your contract requires 3 months notice. You're now either paying double rent or losing the new place.
                            </p>
                        </div>
                    </div>

                    {/* Country-specific notice periods */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Notice periods by country</h2>

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
                                    <div className="space-y-4 text-sm text-slate-700">
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Standard lease (9-year "bail de résidence principale")</p>
                                            <p>3 months notice. Can leave at any time, but compensation may apply in early years:</p>
                                            <ul className="mt-2 ml-4 space-y-1">
                                                <li>• Year 1: 3 months rent compensation</li>
                                                <li>• Year 2: 2 months rent compensation</li>
                                                <li>• Year 3: 1 month rent compensation</li>
                                                <li>• Year 4+: No compensation</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Short-term lease (≤3 years)</p>
                                            <p>Cannot terminate early unless both parties agree. You're bound until the end date.</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-blue-800"><strong>Regional differences:</strong> Brussels, Flanders, and Wallonia have different rules. Always check your regional housing code.</p>
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
                                    <div className="space-y-4 text-sm text-slate-700">
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Unfurnished rental</p>
                                            <p>3 months notice (standard), reduced to 1 month in "zones tendues" (high-demand areas like Paris, Lyon, Marseille).</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Furnished rental</p>
                                            <p>1 month notice regardless of location.</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Reduced notice (1 month) also applies if:</p>
                                            <ul className="mt-2 ml-4 space-y-1">
                                                <li>• Job loss or new job requiring relocation</li>
                                                <li>• Health reasons (with medical certificate)</li>
                                                <li>• First social housing allocation</li>
                                                <li>• Receiving RSA or AAH benefits</li>
                                            </ul>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-blue-800"><strong>How to send notice:</strong> "Lettre recommandée avec accusé de réception" (registered letter with acknowledgment). Keep the receipt.</p>
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
                                    <div className="space-y-4 text-sm text-slate-700">
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Indefinite lease ("bail à durée indéterminée")</p>
                                            <p>3 months notice, typically to end on the 15th or last day of the month.</p>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-900 mb-1">Fixed-term lease ("bail à durée déterminée")</p>
                                            <p>Ends automatically on the agreed date. Early termination requires landlord consent unless the contract specifies otherwise.</p>
                                        </div>
                                        <div className="bg-blue-50 rounded-lg p-3">
                                            <p className="text-blue-800"><strong>Important:</strong> Always check your specific contract. Many Luxembourg leases have custom notice clauses.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How to give notice */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to give notice properly</h2>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                    <span className="text-slate-700"><strong>Check your contract</strong> — Find the exact notice period and any specific requirements.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                    <span className="text-slate-700"><strong>Calculate your end date</strong> — Notice usually starts from when the landlord receives your letter, not when you send it.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                    <span className="text-slate-700"><strong>Send by registered mail</strong> — This gives you proof of delivery date. Keep the receipt.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                    <span className="text-slate-700"><strong>State clearly</strong> — Include your name, address, intention to terminate, and proposed end date.</span>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Never miss a deadline</h3>
                        <p className="text-slate-300 mb-6">RentVault extracts key dates from your contract and sends reminders.</p>
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
                        <Link href="/guides/deposit-protection" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Protecting your deposit</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
