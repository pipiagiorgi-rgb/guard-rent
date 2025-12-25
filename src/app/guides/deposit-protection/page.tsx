import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Camera, Lock, Hash, FileDown, Clock } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Deposit Protection: Build Your Case With Evidence | RentVault',
    description: 'Landlords deduct from your deposit. You dispute it. The difference often comes down to documentation. Learn how to build a clear evidence record.',
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
                        Your deposit is at risk the moment you sign
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Around one in four renters don't get their full deposit back.
                        When disputes happen, the outcome often comes down to one thing: documentation.
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
                            When you move out, landlords often claim damage that was already there.
                            Cleaning fees, wear and tear, "missing" items — deductions add up fast.
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Cleaning</p>
                                <p className="text-red-700 text-sm">"Professional cleaning required"</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Damage</p>
                                <p className="text-red-700 text-sm">Scratches, marks, holes</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Missing items</p>
                                <p className="text-red-700 text-sm">Lost keys, broken fixtures</p>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            You disagree. You know the apartment was clean. You know that scratch was there when you moved in.
                            But without proof, it's your word against theirs — and they're holding your money.
                        </p>
                    </div>

                    {/* The Solution - RentVault */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault protects your deposit</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault helps you collect and organise the documentation you need.
                            From the moment you move in to the day you hand over the keys, everything is recorded with timestamps.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Camera size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Check-in documentation</h3>
                                    <p className="text-sm text-slate-600">
                                        Photograph every room, wall, and appliance on move-in day.
                                        All photos are timestamped and stored securely.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Lock size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Sealed evidence</h3>
                                    <p className="text-sm text-slate-600">
                                        When you seal your check-in, photos become immutable.
                                        No edits, no deletions, no backdating. The evidence is locked.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Hash size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">File integrity hashing</h3>
                                    <p className="text-sm text-slate-600">
                                        Each file gets a unique cryptographic hash.
                                        If anyone tries to tamper with the evidence, the hash breaks and it's immediately obvious.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileDown size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Export packs</h3>
                                    <p className="text-sm text-slate-600">
                                        Download a complete Check-in Pack or Deposit Recovery Pack —
                                        official PDF reports with all photos, timestamps, and metadata ready for disputes.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* The Full Lifecycle */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Protecting your entire tenancy</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            Deposit disputes can happen because of issues at any point — move-in, during your stay, or move-out.
                            RentVault covers the full lifecycle:
                        </p>

                        <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Move-in</p>
                                    <p className="text-sm text-slate-600">Document property condition, meters, keys. Upload and seal your check-in evidence.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                <div>
                                    <p className="font-semibold text-slate-900">During tenancy</p>
                                    <p className="text-sm text-slate-600">Log any issues as they happen. Build a timeline of problems and repairs.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Move-out</p>
                                    <p className="text-sm text-slate-600">Document handover condition. Compare to check-in. Seal and export your Deposit Recovery Pack.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Why RentVault is Different */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The first platform built for tenants</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Before RentVault, tenants had no good way to create official, verifiable evidence.
                            Photos on your phone are editable. Emails can be faked. Paper inventories get lost.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            RentVault is built specifically for tenants,
                            with clear documentation when it matters.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Protect your deposit from day one</h3>
                        <p className="text-slate-300 mb-6">Start documenting for free. Pay only when you need official exports.</p>
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
                                <Clock size={20} className="text-slate-400" />
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
