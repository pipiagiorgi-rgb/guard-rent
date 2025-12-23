import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Upload, Camera, Bell, FileDown, Users, Shield, Eye, ArrowRight, Check, BookOpen } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'RentVault | Protect Your Rental Deposit — Organise Documents, Photos & Deadlines',
    description: 'A secure, private vault for tenants to organise rental documents, move-in and move-out photos, and key notice dates. Evidence-based protection before disputes arise.',
    keywords: 'rental deposit protection, tenant documentation, move-in photos, rental contract storage, deposit dispute evidence, tenancy organiser, expat rental, property condition report, notice period reminders',
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
                            A secure, private vault for tenants to organise rental documents, move-in and move-out photos, and key notice dates — before disputes arise.
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
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-14 pt-10 animate-fade-in-up opacity-0 delay-500">
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
                                Don't lose part of your deposit over missing photos.
                            </h2>
                            <div className="space-y-5">
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    Every year, <strong className="text-slate-900">countless deposit disputes</strong> are
                                    decided based on one thing: who has the evidence.
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    In England & Wales alone, nearly <strong className="text-slate-900">47,000 rental disputes</strong> went
                                    to adjudication last year.<sup className="text-slate-400">*</sup> If you don't have
                                    clear move-in photos and dates, you're at a disadvantage.
                                </p>
                                <p className="text-slate-700 leading-relaxed text-base md:text-lg">
                                    RentVault helps you document everything — rental contracts, property condition photos,
                                    and key deadlines — with timestamps and locked records, so you're not scrambling later.
                                </p>
                            </div>
                            {/* Source footnote */}
                            <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
                                <sup>*</sup> Source:{' '}
                                <a
                                    href="https://www.tenancydepositscheme.com/resources/statistics/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-slate-600"
                                >
                                    Tenancy Deposit Scheme statistics 2024/25
                                </a>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-8 md:py-10 px-4 md:px-6">
                    <div className="max-w-[1120px] mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-bold mb-3">Everything in one place</h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto">Tools to protect your deposit and stay organised.</p>
                        </div>

                        {/* Differentiator line */}
                        <p className="text-center text-slate-600 mb-8 max-w-2xl mx-auto">
                            Most rental tools are built for landlords or general contract management.
                            RentVault is designed specifically for tenants to organise records, evidence, and deadlines throughout a rental.
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                            {/* Contract clarity */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-blue mb-6">
                                    <FileText size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">Contract clarity</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Upload your lease to see key dates and notice periods. Translate terms to your language if needed.
                                </p>
                            </div>

                            {/* Photo evidence */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-green mb-6">
                                    <Camera size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">Photo evidence</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Document the property condition at move-in and before handover. Photos are stored with timestamps.
                                </p>
                            </div>

                            {/* Deadline reminders */}
                            <div className="feature-card group">
                                <div className="icon-container icon-container-amber mb-6">
                                    <Bell size={24} />
                                </div>
                                <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors">Deadline alerts</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">
                                    Choose exactly what to be reminded about—like contract renewal or termination dates.
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

                {/* Guides for Tenants - NEW SECTION */}
                <section className="py-12 md:py-16 px-4 md:px-6">
                    <div className="max-w-[720px] mx-auto text-center">
                        <div className="flex items-center justify-center gap-2 mb-6">
                            <BookOpen size={20} className="text-slate-500" />
                            <h2 className="text-xl font-semibold text-slate-900">Guides for tenants</h2>
                        </div>
                        <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-sm">
                            <Link href="/guides/move-in-photos" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
                                Why move-in photos matter
                            </Link>
                            <Link href="/guides/notice-periods" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
                                Understanding notice periods
                            </Link>
                            <Link href="/guides/renting-abroad" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
                                Renting abroad: what to watch for
                            </Link>
                            <Link href="/guides/deposit-protection" className="text-slate-600 hover:text-slate-900 underline underline-offset-2">
                                How to protect your deposit
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Who it's for */}
                <section className="py-10 md:py-14 px-4 md:px-6 bg-gradient-to-b from-white to-slate-50">
                    <div className="max-w-[720px] mx-auto">
                        <div className="feature-card text-center py-10 px-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <Users size={28} className="text-white" />
                            </div>
                            <h2 className="text-2xl md:text-3xl font-bold mb-4">Built for tenants</h2>
                            <p className="text-slate-600 text-lg leading-relaxed mb-6">
                                For anyone renting who wants peace of mind. Useful if you are renting abroad or in a second language.
                            </p>
                            <div className="flex flex-wrap justify-center gap-3">
                                {['Renting abroad', 'Students', 'First-time renters', 'Remote workers'].map((tag) => (
                                    <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                        {tag}
                                    </span>
                                ))}
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
                                <div className="bg-white rounded-xl px-5 py-3 border border-slate-200">
                                    <span className="text-2xl font-bold">€19</span>
                                    <span className="text-slate-500 text-sm ml-1">Check-in</span>
                                </div>
                                <div className="bg-white rounded-xl px-5 py-3 border border-slate-200">
                                    <span className="text-2xl font-bold">€29</span>
                                    <span className="text-slate-500 text-sm ml-1">Move-out</span>
                                </div>
                                <div className="bg-slate-900 text-white rounded-xl px-5 py-3">
                                    <span className="text-2xl font-bold">€39</span>
                                    <span className="text-slate-300 text-sm ml-1">Full bundle</span>
                                </div>
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

                {/* AI Disclosure - Small FAQ clarification */}
                <section className="py-8 px-4 md:px-6 border-t border-slate-100">
                    <div className="max-w-[720px] mx-auto">
                        <details className="group">
                            <summary className="text-sm font-medium text-slate-600 cursor-pointer hover:text-slate-900 list-none flex items-center gap-2">
                                <span className="text-slate-400 group-open:rotate-90 transition-transform">▶</span>
                                Does RentVault use automated assistance?
                            </summary>
                            <div className="mt-3 text-sm text-slate-600 pl-5">
                                <p className="mb-2">
                                    Yes. RentVault uses automated assistance to help identify key dates and summarise rental documents.
                                </p>
                                <p className="text-slate-500">
                                    Your uploaded files and timestamps remain the authoritative record. Not legal advice.
                                </p>
                            </div>
                        </details>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </div>
        </>
    )
}
