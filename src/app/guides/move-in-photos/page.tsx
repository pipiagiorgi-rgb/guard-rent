import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Clock, Shield, AlertCircle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Move-In Photos Guide | RentVault',
    description: 'Learn why timestamped move-in photos are essential for protecting your rental deposit. Tips for Belgium, France, and Luxembourg tenants.',
    alternates: {
        canonical: 'https://rentvault.ai/guides/move-in-photos'
    }
}

export default function MoveInPhotosGuide() {
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
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <Camera className="text-green-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Why move-in photos matter
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        In a deposit dispute, the question is always: "What was the condition when you moved in?"
                        Without photos, it's your word against the landlord's.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* The Problem */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The problem</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When you leave a rental, landlords often claim damage that was already there.
                            Scratches on floors, marks on walls, worn appliances — these can become expensive deductions from your deposit.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            If you can't prove the condition when you moved in, you lose. It's that simple.
                        </p>
                    </div>

                    {/* The Solution */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What to photograph</h2>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <ul className="space-y-3">
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Every room</strong> — wide shots showing overall condition</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Floors and walls</strong> — especially any existing scratches, marks, or stains</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Appliances</strong> — oven, fridge, washing machine, dishwasher</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Windows and doors</strong> — any cracks, dents, or issues with locks</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Meter readings</strong> — electric, gas, and water meters</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Keys</strong> — all keys you receive</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Country-specific */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Country-specific rules</h2>

                        <div className="space-y-4">
                            {/* Belgium */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇧🇪</span>
                                    <h3 className="font-bold text-slate-900">Belgium</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    The <strong>"état des lieux d'entrée"</strong> (entry inventory) is standard practice.
                                    It's typically prepared by a court bailiff or real estate agent.
                                    However, photos you take yourself serve as additional evidence and are increasingly accepted in disputes.
                                    Take photos on move-in day, before unpacking.
                                </p>
                            </div>

                            {/* France */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇫🇷</span>
                                    <h3 className="font-bold text-slate-900">France</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    The <strong>"état des lieux"</strong> is legally required and must be attached to the lease.
                                    But the written description is often vague ("walls in good condition").
                                    Your photos add specificity that the official document lacks.
                                    Under French law, the burden of proof shifts to the tenant if no entry inventory exists.
                                </p>
                            </div>

                            {/* Luxembourg */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇱🇺</span>
                                    <h3 className="font-bold text-slate-900">Luxembourg</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    A detailed inventory is recommended but not always provided.
                                    If no inventory exists, the property is presumed to have been in good condition at move-in —
                                    making your own photographic record essential.
                                    Request a written inventory and supplement it with timestamped photos.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Timestamps matter */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why timestamps matter</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            A photo without a verifiable date is easy to dismiss. "You could have taken that last week."
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            RentVault stores photos with system-generated timestamps that can't be edited after upload.
                            When you lock your check-in, the timestamp is preserved — creating a clear record of when the evidence was captured.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Document your move-in today</h3>
                        <p className="text-slate-300 mb-6">Start for free. Photos are stored with timestamps.</p>
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
                        <Link href="/guides/deposit-protection" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Protecting your deposit</span>
                            </div>
                        </Link>
                        <Link href="/guides/notice-periods" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Clock size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Understanding notice periods</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
