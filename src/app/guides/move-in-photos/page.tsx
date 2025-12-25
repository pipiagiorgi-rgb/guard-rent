import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Lock, Shield, Clock, Hash, FileCheck } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Move-In Photos: The Evidence That Saves Your Deposit | RentVault',
    description: 'Without timestamped move-in photos, landlords can blame you for damage that was already there. Learn how to protect yourself.',
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
                        The photos you take on move-in day are your insurance policy
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        When you leave and the landlord claims damage, there's one question that decides everything:
                        "What was the condition when you moved in?"
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
                            Deposit disputes happen constantly. Scratches on floors, marks on walls, worn appliances —
                            landlords routinely deduct hundreds or thousands for "damage" that was there before you moved in.
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-4">
                            <p className="text-red-800">
                                <strong>Without evidence, you lose.</strong> It's your word against theirs, and landlords hold your money.
                            </p>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            Photos on your phone help, but they're easy to dismiss. "You could have taken those last week."
                            There's no proof of when they were captured.
                        </p>
                    </div>

                    {/* The Solution - RentVault */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault solves this</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault creates evidence that holds up. When you seal your check-in, your photos become immutable —
                            timestamped, hashed, and locked so they can't be edited or backdated.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                        <Clock size={16} className="text-green-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">System timestamps</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Every photo is recorded with the exact date and time. You can't fake when it was taken.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Hash size={16} className="text-blue-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">File integrity hashing</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Each file gets a unique cryptographic hash. If anything changes, the hash breaks.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <Lock size={16} className="text-amber-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Sealed evidence</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Once you seal your check-in, photos are locked. No edits, no deletions.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <FileCheck size={16} className="text-purple-600" />
                                    </div>
                                    <h3 className="font-semibold text-slate-900">Official PDF reports</h3>
                                </div>
                                <p className="text-sm text-slate-600">
                                    Export a complete Check-in Pack with all photos, timestamps, and metadata.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What to Photograph */}
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
                                    <span className="text-slate-700"><strong>Floors and walls</strong> — especially existing scratches, marks, or stains</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Appliances</strong> — oven, fridge, washing machine, dishwasher</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Windows and doors</strong> — cracks, dents, issues with locks</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Meter readings</strong> — electric, gas, and water</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0">✓</span>
                                    <span className="text-slate-700"><strong>Keys</strong> — all keys you receive</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Why This is Different */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why RentVault is different</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Before RentVault, tenants had no good way to create verifiable evidence.
                            Photos on your phone are editable. Emails can be faked. Paper inventories get lost.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            RentVault is the first platform built specifically to protect the entire tenant journey —
                            from signing the lease to getting your deposit back.
                            Every piece of evidence is timestamped, hashed, and stored securely for 12 months.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Protect your next move-in</h3>
                        <p className="text-slate-300 mb-6">Document for free. Pay only when you need official exports.</p>
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
