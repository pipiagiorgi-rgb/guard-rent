import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, AlertCircle, Camera, Shield, Clock, FileText, Hash } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Mid-Tenancy Issues: Document Problems Before They Cost You | RentVault',
    description: 'When something breaks, document it immediately. Learn how to build a timeline of evidence that protects you at move-out.',
    alternates: {
        canonical: 'https://rentvault.ai/guides/mid-tenancy-issues'
    }
}

export default function MidTenancyIssuesGuide() {
    // Article schema for SEO
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Mid-Tenancy Issues: Document Problems Before They Cost You',
        description: 'When something breaks, document it immediately. Learn how to build a timeline of evidence that protects you at move-out.',
        datePublished: '2024-12-01',
        dateModified: '2025-12-25',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.ai' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.ai' },
        mainEntityOfPage: 'https://rentvault.ai/guides/mid-tenancy-issues'
    }

    // Breadcrumb schema for navigation
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.ai' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.ai/guides' },
            { '@type': 'ListItem', position: 3, name: 'Mid-Tenancy Issues', item: 'https://rentvault.ai/guides/mid-tenancy-issues' }
        ]
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            {/* Logo Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-[800px] mx-auto px-4 md:px-6 h-16 flex items-center">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="sm" />
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-24 pb-12 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-[800px] mx-auto">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm"
                    >
                        <ArrowLeft size={16} />
                        All guides
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="text-red-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        The leak you reported 8 months ago? Prove it.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        When you move out and the landlord blames you for damage,
                        can you prove you reported it months ago? If not, you pay.
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
                            Things break during a tenancy. Pipes leak, appliances fail, paint chips.
                            You tell the landlord. Maybe you email, maybe you call, maybe you mention it in passing.
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-4">
                            <p className="text-red-800">
                                <strong>8 months later at move-out:</strong> "There's water damage under the sink.
                                That'll be €800 from your deposit." You know you reported it. But can you prove it?
                            </p>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            Verbal reports don't count. Text messages get deleted.
                            Without a clear, dated record, you're responsible for damage you didn't cause.
                        </p>
                    </div>

                    {/* The Solution - RentVault */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault solves this</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault's Issues Log lets you document problems as they happen —
                            with photos, descriptions, and timestamps that create a verifiable timeline.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <AlertCircle size={20} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Log issues instantly</h3>
                                    <p className="text-sm text-slate-600">
                                        Something breaks? Open RentVault, snap photos, add a description.
                                        The date and time are recorded automatically.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Build a timeline</h3>
                                    <p className="text-sm text-slate-600">
                                        Every issue is recorded chronologically.
                                        At move-out, you have a complete history of what happened and when.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Hash size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Tamper-proof evidence</h3>
                                    <p className="text-sm text-slate-600">
                                        Photos are stored with cryptographic hashes.
                                        If anyone tries to edit or backdate them, the evidence is broken.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Include in your Deposit Recovery Pack</h3>
                                    <p className="text-sm text-slate-600">
                                        When you need to dispute deductions, your issues timeline is included in the
                                        official PDF export — showing exactly what was reported and when.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What to Document */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What to document</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">Maintenance issues</h3>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• Broken appliances</li>
                                    <li>• Plumbing problems</li>
                                    <li>• Heating/cooling failures</li>
                                    <li>• Electrical issues</li>
                                </ul>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">Property damage</h3>
                                <ul className="text-sm text-slate-600 space-y-1">
                                    <li>• Water leaks and stains</li>
                                    <li>• Mold or damp</li>
                                    <li>• Cracks in walls or ceilings</li>
                                    <li>• Window or door damage</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* The Full Picture */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The full picture at move-out</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When you leave, RentVault has everything:
                        </p>
                        <ul className="space-y-2 text-slate-700">
                            <li className="flex gap-3">
                                <span className="text-green-500">✓</span>
                                <span><strong>Check-in evidence</strong> — how the property looked when you moved in</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-500">✓</span>
                                <span><strong>Issues timeline</strong> — everything you reported during the tenancy</span>
                            </li>
                            <li className="flex gap-3">
                                <span className="text-green-500">✓</span>
                                <span><strong>Handover evidence</strong> — how you left the property</span>
                            </li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed mt-4">
                            This is the evidence you need to dispute unfair deductions.
                            All in one place, all timestamped, all verifiable.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Start logging issues today</h3>
                        <p className="text-slate-300 mb-6">Build your evidence timeline for free. Pay only when you need exports.</p>
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
                        <Link href="/guides/move-in-photos" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Camera size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Why move-in photos matter</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <ScrollToTop />
            <Footer />
        </div>
    )
}
