import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Clock, Bell, Calendar, FileText, Lock } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Notice Periods: Miss Your Deadline, Pay Extra Rent | RentVault',
    description: 'Missing your notice deadline can cost you months of extra rent. Learn how to track deadlines and never miss one again.',
    alternates: {
        canonical: 'https://rentvault.co/guides/notice-periods'
    }
}

export default function NoticePeriodsGuide() {
    // Article schema for SEO
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Notice Periods: Miss Your Deadline, Pay Extra Rent',
        description: 'Missing your notice deadline can cost you months of extra rent. Learn how to track deadlines and never miss one again.',
        datePublished: '2024-12-01',
        dateModified: '2025-12-25',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        mainEntityOfPage: 'https://rentvault.co/guides/notice-periods'
    }

    // Breadcrumb schema for navigation
    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.co' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.co/guides' },
            { '@type': 'ListItem', position: 3, name: 'Notice Periods', item: 'https://rentvault.co/guides/notice-periods' }
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
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Clock className="text-amber-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Miss your notice deadline. Pay extra rent.
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Most rental contracts require 1-3 months notice. Miss that window by a day,
                        and you're legally bound to pay rent you didn't plan for.
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
                            You find a great new apartment. You want to move next month.
                            But your contract requires 3 months notice. Now you're either paying double rent or losing the new place.
                        </p>
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5 mb-4">
                            <p className="text-red-800">
                                <strong>Real scenario:</strong> A tenant in the UK gave 2 months notice on a 3-month contract.
                                The landlord pursued them for the extra month's rent — and won.
                            </p>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            Rental contracts are written in legal language. The key dates — renewal, termination, notice deadlines —
                            are buried in dense paragraphs. Most people don't read them until it's too late.
                        </p>
                    </div>

                    {/* The Solution - RentVault */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault solves this</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault scans your contract and extracts the dates that matter.
                            Then it reminds you before deadlines hit — so you never miss a notice window.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">AI contract scanning</h3>
                                    <p className="text-sm text-slate-600">
                                        Upload your lease and RentVault extracts key dates automatically —
                                        start date, end date, notice period, renewal terms.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Bell size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Deadline reminders</h3>
                                    <p className="text-sm text-slate-600">
                                        Get email alerts before critical dates. You'll know when to give notice,
                                        when renewal happens, and when your lease ends.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Contract Q&A</h3>
                                    <p className="text-sm text-slate-600">
                                        Not sure what a clause means? Ask questions about your contract in plain language.
                                        RentVault's AI finds the answer and quotes the source.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* What You Need to Know */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What you need to know about notice periods</h2>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <ul className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                                    <span className="text-slate-700">
                                        <strong>Notice starts when received</strong> — not when sent.
                                        If you email on the 1st but the landlord reads it on the 3rd, the clock starts on the 3rd.
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                                    <span className="text-slate-700">
                                        <strong>Registered mail creates proof</strong> — in most countries,
                                        sending notice by registered post proves the delivery date.
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                                    <span className="text-slate-700">
                                        <strong>Fixed-term leases are different</strong> — you may not be able to leave early
                                        without paying out the remainder or finding a replacement tenant.
                                    </span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-green-500 flex-shrink-0 mt-1">✓</span>
                                    <span className="text-slate-700">
                                        <strong>Some contracts auto-renew</strong> — if you don't give notice before the renewal date,
                                        you're locked in for another term.
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Why This Matters */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why this matters</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Rental contracts across Europe, the UK, and beyond all have notice requirements.
                            Whether you're in London, Berlin, Paris, Amsterdam, Dublin, or Luxembourg —
                            the consequences of missing a deadline are the same: you pay.
                        </p>
                        <p className="text-slate-700 leading-relaxed">
                            RentVault puts your deadlines front and center. No more digging through PDFs.
                            No more forgetting until it's too late.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Never miss a deadline</h3>
                        <p className="text-slate-300 mb-6">Upload your contract and let RentVault track the dates that matter.</p>
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
                                <Clock size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Why move-in photos matter</span>
                            </div>
                        </Link>
                        <Link href="/guides/deposit-protection" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Lock size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Protecting your deposit</span>
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
