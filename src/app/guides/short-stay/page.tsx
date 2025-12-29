import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Shield, Camera, Lock, FileDown, Calendar, Check, Home } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Short Stay Evidence: Protect Your Airbnb & Vacation Rental | RentVault',
    description: 'Document your arrival and departure at Airbnb, Booking.com, or VRBO stays. Create timestamped evidence to dispute unfair damage claims.',
    keywords: 'airbnb damage protection, vacation rental evidence, short stay documentation, booking.com guest protection, vrbo deposit evidence, airbnb photo evidence, vacation rental dispute',
    alternates: {
        canonical: 'https://rentvault.co/guides/short-stay'
    }
}

export default function ShortStayGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Short Stay Evidence: Protect Yourself at Vacation Rentals',
        description: 'Learn how to document your arrival and departure at Airbnb, Booking.com, or VRBO stays to protect yourself from unfair damage claims.',
        datePublished: '2024-12-29',
        dateModified: '2024-12-29',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        mainEntityOfPage: 'https://rentvault.co/guides/short-stay'
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.co' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.co/guides' },
            { '@type': 'ListItem', position: 3, name: 'Short Stay Evidence', item: 'https://rentvault.co/guides/short-stay' }
        ]
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-[800px] mx-auto px-4 md:px-6 h-16 flex items-center">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="sm" />
                    </Link>
                </div>
            </header>

            <section className="pt-24 pb-12 px-4 md:px-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-[800px] mx-auto">
                    <Link href="/guides" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm">
                        <ArrowLeft size={16} />
                        All guides
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                            <Home className="text-blue-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Protect yourself at short-stay rentals
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Hosts on Airbnb, Booking.com, and VRBO can claim damage you didn't cause.
                        Document your stay with timestamped evidence.
                    </p>
                </div>
            </section>

            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">The problem with vacation rentals</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            After you check out, hosts can file damage claims against you. Without evidence,
                            platforms often side with the host. You may lose your deposit or face charges for:
                        </p>
                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Pre-existing damage</p>
                                <p className="text-red-700 text-sm">Scratches and marks from previous guests</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Cleaning claims</p>
                                <p className="text-red-700 text-sm">"Excessive cleaning required"</p>
                            </div>
                            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                                <p className="font-semibold text-red-900 mb-1">Missing items</p>
                                <p className="text-red-700 text-sm">Items that were never there</p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault helps</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault's Short-Stay Pack is designed for vacation rentals.
                            Quick photo capture at arrival and departure with automatic timestamps.
                        </p>

                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Camera size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Arrival photos</h3>
                                    <p className="text-sm text-slate-600">
                                        Document property condition when you arrive. Capture any existing damage,
                                        cleanliness issues, or missing amenities.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Calendar size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Booking details</h3>
                                    <p className="text-sm text-slate-600">
                                        Track your platform, reservation ID, and check-in/out dates.
                                        Everything linked to your evidence.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileDown size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Evidence report</h3>
                                    <p className="text-sm text-slate-600">
                                        Download a PDF with all photos and timestamps. Share with
                                        platform support if a dispute arises.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Quick and affordable</h2>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-3xl font-bold text-slate-900">€5.99</div>
                                <div className="text-sm text-slate-600">per booking</div>
                            </div>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-green-600" />
                                    Arrival & departure photo evidence
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-green-600" />
                                    Platform & reservation tracking
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-green-600" />
                                    30 days secure retention after check-out
                                </li>
                                <li className="flex items-center gap-2 text-sm text-slate-700">
                                    <Check size={16} className="text-green-600" />
                                    Downloadable evidence report PDF
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Document your next stay</h3>
                        <p className="text-slate-300 mb-6">Takes 2 minutes at arrival and departure.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Get started
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

            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/guides/deposit-protection" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Long-term deposit protection</span>
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
