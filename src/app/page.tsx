import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Upload, Camera, Bell, FileDown, Users, Shield, Eye, ArrowRight, Check, BookOpen, AlertCircle, Lock, Hash, Clock, Globe, Home as HomeIcon, Calendar } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'RentVault | Protect Your Rental Deposit — Organise Documents, Photos & Deadlines',
    description: 'A secure, private vault for tenants to organise rental documents, move-in and move-out photos, and key notice dates. Evidence-based protection before disputes arise.',
    keywords: 'rental deposit protection, tenant documentation, move-in photos, rental contract storage, deposit dispute evidence, tenancy organiser, expat rental, property condition report, notice period reminders',
    icons: {
        icon: '/favicon.png',
        apple: '/apple-icon.png',
    },
    alternates: {
        canonical: 'https://rentvault.ai'
    },
    openGraph: {
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A secure, private vault for tenants to organise rental documents, move-in photos, and key notice dates — before disputes arise.',
        url: 'https://rentvault.ai',
        siteName: 'RentVault',
        type: 'website',
        locale: 'en_GB',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'RentVault | Protect Your Rental Deposit',
        description: 'A secure vault for tenants to organise rental documents, photos, and key dates.',
    },
    robots: {
        index: true,
        follow: true,
    },
}

export default function Home() {
    // JSON-LD structured data for SEO
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'RentVault',
        description: 'A secure vault for tenants to organise rental documents, photos, and key dates. Evidence-based protection before disputes arise.',
        url: 'https://rentvault.ai',
        applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Web',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
            description: 'Free to explore. Pay only if you export.'
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="flex flex-col min-h-screen bg-white">
                {/* Hero Section */}
                <section className="hero-gradient pt-20 md:pt-28 pb-16 md:pb-24 px-4 md:px-6">
                    <div className="max-w-[1120px] mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full mb-8 animate-fade-in-up opacity-0">
                            <span className="text-sm font-medium text-slate-600">Built for tenants. Private by default.</span>
                        </div>

                        {/* Headline */}
                        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1] animate-fade-in-up opacity-0 delay-100">
                            Protect your rental deposit.
                            <br />
                            <span className="bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent">
                                Never miss an important deadline.
                            </span>
                        </h1>

                        {/* Subheadline - IMPROVED: Outcome-focused, no hype */}
                        <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed px-4 animate-fade-in-up opacity-0 delay-200">
                            A secure, private vault for tenants to organise rental documents, move-in and move-out photos, and key notice dates, before disputes arise.
                        </p>

                        {/* CTA Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 px-4 animate-fade-in-up opacity-0 delay-300">
                            <Link
                                href="/login"
                                className="group w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                            >
                                Start now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all text-base md:text-lg hover:-translate-y-1"
                            >
                                Pricing
                            </Link>
                        </div>

                        <p className="text-sm text-slate-500 animate-fade-in-up opacity-0 delay-400">
                            Free to explore. Pay only when you need official exports or extended retention.
                        </p>

                        {/* Trust Strip */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-10 pt-6 animate-fade-in-up opacity-0 delay-500">
                            <div className="trust-badge">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                                    <Users size={18} className="text-slate-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">For tenants only</span>
                            </div>
                            <div className="trust-badge">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                                    <Eye size={18} className="text-slate-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">No tracking or ads</span>
                            </div>
                            <div className="trust-badge">
                                <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                                    <Shield size={18} className="text-slate-600" />
                                </div>
                                <span className="text-sm font-medium text-slate-700">Your data stays private</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why This Matters - Urgency + SEO keywords */}
                <section className="py-8 md:py-10 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-[900px] mx-auto">
                        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-10 shadow-sm">
                            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-900">
                                Why this matters
                            </h2>
                            <div className="space-y-5">
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    Independent research indicates that around <strong className="text-slate-900">one in four renters</strong> report
                                    not receiving their full <strong className="text-slate-900">deposit</strong> back after a tenancy.<sup className="text-slate-400">*</sup>
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    The most common reasons are disagreements about <strong className="text-slate-900">property condition</strong>,
                                    missing or unclear records, and timing issues around notice and handover.
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    These situations are <strong className="text-slate-900">evidence-based</strong> and <strong className="text-slate-900">deadline-driven</strong>.
                                    Clear records, accurate timestamps, and preserved files can make a material difference.
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    RentVault helps tenants keep <strong className="text-slate-900">rental documents</strong>, <strong className="text-slate-900">photos</strong>,
                                    and <strong className="text-slate-900">key dates</strong> organised with system-generated timestamps and locked records
                                    that preserve what was recorded at the time.
                                </p>
                            </div>

                            {/* CTA Button */}
                            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <Link
                                    href="/vault"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-md"
                                >
                                    Start documenting for free
                                    <ArrowRight size={18} />
                                </Link>
                                <span className="text-sm text-slate-500">No credit card required</span>
                            </div>

                            {/* Source footnote */}
                            <p className="text-xs text-slate-400 mt-6">
                                <sup>*</sup> Source:{' '}
                                <a
                                    href="https://www.generationrent.org/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-slate-600"
                                >
                                    Generation Rent, 2025
                                </a>
                            </p>
                        </div>
                    </div>
                </section>


                {/* Features Section */}
                <section className="py-8 md:py-10 px-4 md:px-6">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">Your rental, organised</h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto">Evidence and deadlines in one secure place.</p>
                        </div>

                        {/* Differentiator line */}
                        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                            Most rental tools are built for landlords or general contract management.
                            RentVault is designed specifically for tenants to organise records, evidence, and deadlines throughout a rental.
                        </p>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                            {/* Contract clarity */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-blue mb-4">
                                    <FileText size={20} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-blue-600 transition-colors">Contract clarity</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Upload your lease to see key dates and notice periods. Translate terms to your language if needed.
                                </p>
                            </div>

                            {/* Photo evidence */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-green mb-4">
                                    <Camera size={20} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-green-600 transition-colors">Photo evidence</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Document the property condition at move-in and before handover. Photos are stored with timestamps.
                                </p>
                            </div>

                            {/* Issues log */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-red mb-4">
                                    <AlertCircle size={20} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-red-600 transition-colors">Issues log</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Log damage or problems as they happen with photos and timestamps. Build a timeline of evidence.
                                </p>
                            </div>

                            {/* Deadline reminders */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-amber mb-4">
                                    <Bell size={20} />
                                </div>
                                <h3 className="text-lg font-bold mb-2 group-hover:text-amber-600 transition-colors">Deadline alerts</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Get reminded about contract renewal, termination dates, and other key deadlines.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="py-8 md:py-10 px-4 md:px-6 bg-gradient-to-b from-white to-slate-50">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">How it works</h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto">Four steps to keep your rental organised.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                            {[
                                {
                                    step: 1,
                                    icon: <Upload size={24} />,
                                    iconClass: 'icon-container-blue',
                                    hoverColor: 'group-hover:text-blue-600',
                                    title: 'Add your lease',
                                    desc: 'Upload your rental contract to view a summary of dates and terms.'
                                },
                                {
                                    step: 2,
                                    icon: <Camera size={24} />,
                                    iconClass: 'icon-container-green',
                                    hoverColor: 'group-hover:text-green-600',
                                    title: 'Record condition',
                                    desc: 'Add room-by-room photos when you move in and again before you leave.'
                                },
                                {
                                    step: 3,
                                    icon: <Bell size={24} />,
                                    iconClass: 'icon-container-amber',
                                    hoverColor: 'group-hover:text-amber-600',
                                    title: 'Set alerts',
                                    desc: 'Get notified before critical dates.'
                                },
                                {
                                    step: 4,
                                    icon: <FileDown size={24} />,
                                    iconClass: 'icon-container-purple',
                                    hoverColor: 'group-hover:text-purple-600',
                                    title: 'Export if needed',
                                    desc: 'Download a PDF with your photos and timeline if you need to share them.'
                                }
                            ].map((item) => (
                                <div key={item.step} className="feature-card group flex gap-5">
                                    <div className={`icon-container ${item.iconClass} flex-shrink-0`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Step {item.step}</div>
                                        <h3 className={`text-xl font-bold mb-2 ${item.hoverColor} transition-colors`}>{item.title}</h3>
                                        <p className="text-slate-600">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Evidence Technology - First of its kind */}
                <section className="py-10 md:py-14 px-4 md:px-6 bg-slate-900">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-10">
                            <span className="inline-block px-3 py-1 bg-white/10 text-white/70 text-sm font-medium rounded-full mb-4">First of its kind</span>
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Evidence that stands up</h2>
                            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                                RentVault is the first platform built specifically to secure the entire tenant journey —
                                from signing the lease to getting your deposit back.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Clock size={24} className="text-blue-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">System timestamps</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Every photo and document is recorded with the exact date and time. You can't fake when it was taken.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Hash size={24} className="text-green-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">File integrity hashing</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Each file gets a unique cryptographic hash. If anyone tampers with it, the hash breaks.
                                </p>
                            </div>
                            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 border border-white/10">
                                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center mb-4">
                                    <Lock size={24} className="text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sealed evidence</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">
                                    Lock your check-in and handover. Once sealed, evidence can't be edited or deleted.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mt-8">
                            <Link
                                href="/guides/deposit-protection"
                                className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors"
                            >
                                Learn more about protecting your deposit
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Guides for Tenants - Enhanced */}
                <section className="py-10 md:py-12 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                    <div className="max-w-[900px] mx-auto">
                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-3">
                                <BookOpen size={18} className="text-slate-500" />
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Free resources</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Guides for tenants</h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Moving soon? Learn what evidence you need and how to collect it properly.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <Link href="/guides/move-in-photos" className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-green-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Camera size={20} className="text-green-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-green-700 transition-colors">Move-in photos</h3>
                                        <p className="text-sm text-slate-500">Document condition on day one</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/guides/notice-periods" className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Clock size={20} className="text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">Notice periods</h3>
                                        <p className="text-sm text-slate-500">Never miss a deadline</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/guides/deposit-protection" className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <Shield size={20} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">Deposit protection</h3>
                                        <p className="text-sm text-slate-500">Build evidence that wins disputes</p>
                                    </div>
                                </div>
                            </Link>
                            <Link href="/guides/mid-tenancy-issues" className="group p-5 bg-white rounded-xl border border-slate-200 hover:border-red-300 hover:shadow-md transition-all">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                        <AlertCircle size={20} className="text-red-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-slate-900 group-hover:text-red-700 transition-colors">Mid-tenancy issues</h3>
                                        <p className="text-sm text-slate-500">Log problems as they happen</p>
                                    </div>
                                </div>
                            </Link>
                        </div>

                        <div className="text-center">
                            <Link href="/guides" className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors">
                                View all guides
                                <ArrowRight size={14} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Who it's for - Specific use cases */}
                <section className="py-10 md:py-12 px-4 md:px-6">
                    <div className="max-w-[900px] mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl md:text-3xl font-bold mb-3">Built for tenants</h2>
                            <p className="text-slate-600 max-w-lg mx-auto">
                                Especially useful when renting abroad or in a second language.
                            </p>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="bg-slate-50 rounded-xl p-5 text-center">
                                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center mx-auto mb-3">
                                    <Globe size={18} className="text-slate-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">Renting abroad</h3>
                                <p className="text-sm text-slate-500">Translate contracts and understand local rules</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 text-center">
                                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center mx-auto mb-3">
                                    <HomeIcon size={18} className="text-slate-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">First rental</h3>
                                <p className="text-sm text-slate-500">Know what to document and when</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 text-center">
                                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center mx-auto mb-3">
                                    <Calendar size={18} className="text-slate-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">Busy schedule</h3>
                                <p className="text-sm text-slate-500">Get deadline reminders so nothing slips</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Teaser */}
                <section className="py-10 md:py-14 px-4 md:px-6">
                    <div className="max-w-[900px] mx-auto">
                        <div className="bg-slate-50 rounded-2xl p-8 md:p-10 text-center">
                            <h2 className="text-xl md:text-2xl font-bold mb-3">Simple pricing</h2>
                            <p className="text-slate-600 mb-6 max-w-lg mx-auto">
                                One-time payment. No subscriptions. Choose what fits your needs.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4 mb-6">
                                <Link href="/pricing" className="bg-white rounded-xl px-5 py-3 border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer select-none">
                                    <span className="text-2xl font-bold">€19</span>
                                    <span className="text-slate-500 text-sm ml-1">Check-in</span>
                                </Link>
                                <Link href="/pricing" className="bg-white rounded-xl px-5 py-3 border border-slate-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-1 transition-all cursor-pointer select-none">
                                    <span className="text-2xl font-bold">€29</span>
                                    <span className="text-slate-500 text-sm ml-1">Move-out</span>
                                </Link>
                                <Link href="/pricing" className="bg-slate-900 text-white rounded-xl px-5 py-3 hover:bg-slate-800 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer select-none">
                                    <span className="text-2xl font-bold">€39</span>
                                    <span className="text-slate-300 text-sm ml-1">Full bundle</span>
                                </Link>
                            </div>
                            <Link
                                href="/pricing"
                                className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
                            >
                                See full pricing details →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="py-14 md:py-20 px-4 md:px-6">
                    <div className="max-w-[720px] mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get organised?</h2>
                        <p className="text-slate-600 mb-10 text-lg">
                            Start for free. Pay only when you need official exports or extended retention.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="group px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                            >
                                Start now
                                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                                href="/pricing"
                                className="px-8 py-4 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all hover:-translate-y-1"
                            >
                                View pricing
                            </Link>
                        </div>

                        {/* Quick benefits */}
                        <div className="flex flex-wrap justify-center gap-6 mt-10 text-sm text-slate-500">
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-500" />
                                <span>No credit card required</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-500" />
                                <span>Free preview mode</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-500" />
                                <span>Your data stays private</span>
                            </div>
                        </div>
                    </div>
                </section>



                {/* Footer */}
                <Footer />
            </div>
        </>
    )
}
