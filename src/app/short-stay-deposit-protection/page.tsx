import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Camera, Shield, FileText, Clock, CheckCircle, Plane, Home, AlertTriangle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Short-Stay Deposit Protection for Airbnb & Booking Guests | RentVault',
    description: 'If you\'re staying short-term, arrival and departure photos matter. RentVault helps guests organise evidence for Airbnb or Booking disputes.',
    alternates: {
        canonical: 'https://rentvault.co/short-stay-deposit-protection'
    }
}

export default function ShortStayDepositProtectionPage() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: 'Short-Stay Deposit Protection for Guests',
        description: 'Protect yourself from damage claims on Airbnb, Booking.com, and VRBO stays with timestamped arrival and departure evidence.',
        url: 'https://rentvault.co/short-stay-deposit-protection'
    }

    const platforms = [
        { name: 'Airbnb', icon: '🏠' },
        { name: 'Booking.com', icon: '🛎️' },
        { name: 'VRBO', icon: '🏡' },
        { name: 'Holiday rentals', icon: '🌴' },
    ]

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

            {/* Logo Header */}
            <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        <Logo size="sm" />
                    </Link>
                    <Link
                        href="/login"
                        className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                        Sign in
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-24 pb-16 px-4 md:px-6 bg-gradient-to-b from-blue-50 to-white">
                <div className="max-w-[800px] mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 text-sm font-medium rounded-full mb-6">
                        <Plane size={16} />
                        For vacation rental guests
                    </div>

                    <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
                        Short-Stay Deposit Protection for Guests
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-8">
                        Staying at an Airbnb, Booking.com, or VRBO? Document arrival and departure condition in case the host claims damage you didn't cause.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                        >
                            Start short-stay evidence
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                        >
                            View pricing
                        </Link>
                    </div>

                    <p className="text-sm text-slate-500">
                        One-time fee · No subscription · 30-day storage window
                    </p>
                </div>
            </section>

            {/* Platform logos */}
            <section className="py-8 px-4 md:px-6 border-b border-slate-100">
                <div className="max-w-[800px] mx-auto">
                    <p className="text-center text-sm text-slate-500 mb-4">Works for guests on any platform</p>
                    <div className="flex justify-center gap-8 flex-wrap">
                        {platforms.map((platform, index) => (
                            <div key={index} className="flex items-center gap-2 text-slate-600">
                                <span className="text-2xl">{platform.icon}</span>
                                <span className="font-medium">{platform.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why Short-Stay Disputes Happen */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
                        Why Short-Stay Disputes Happen
                    </h2>
                    <p className="text-slate-600 text-center max-w-xl mx-auto mb-8">
                        You check out. A few days later, the host claims damage and charges your card.
                        Sound familiar?
                    </p>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mb-3">
                                <AlertTriangle size={20} className="text-red-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Damage claims after checkout</h3>
                            <p className="text-sm text-slate-600">
                                Hosts report damage days later, after you've left and can't verify.
                            </p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mb-3">
                                <Camera size={20} className="text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">Conflicting photos</h3>
                            <p className="text-sm text-slate-600">
                                Host has photos. You have photos. But who can prove when they were taken?
                            </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                                <FileText size={20} className="text-slate-500" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-2">No clear record</h3>
                            <p className="text-sm text-slate-600">
                                Without a structured arrival/departure record, disputes become "he said, she said."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* What Guests Can Do */}
            <section className="py-16 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
                        What Guests Can Do
                    </h2>
                    <p className="text-slate-600 text-center max-w-xl mx-auto mb-8">
                        A few minutes on arrival and departure can save you from fraudulent claims.
                    </p>

                    <div className="space-y-4">
                        <div className="bg-white rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-blue-600">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Photograph on arrival</h3>
                                <p className="text-sm text-slate-600">
                                    As soon as you enter, take photos of every room.
                                    Focus on anything that looks damaged or worn.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-green-600">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Photograph before leaving</h3>
                                <p className="text-sm text-slate-600">
                                    Before you hand back the keys (or leave for self-checkout), document the condition you're leaving it in.
                                </p>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <span className="font-bold text-purple-600">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900 mb-1">Keep records together</h3>
                                <p className="text-sm text-slate-600">
                                    Don't scatter photos across your camera roll.
                                    Organise them in one place so you can find them if a dispute arises.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How RentVault Works for Short Stays */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-center">
                        How RentVault Works for Short Stays
                    </h2>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <Camera size={20} className="text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Arrival photos</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Upload photos when you arrive. They're timestamped and stored securely.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Camera size={20} className="text-green-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Departure photos</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Upload photos before you leave. Complete your departure record and seal it.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <FileText size={20} className="text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900">Simple evidence report</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Download a PDF with all your photos, platform booking details, and timestamps.
                            </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Clock size={20} className="text-amber-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900">30-day storage window</h3>
                            </div>
                            <p className="text-sm text-slate-600">
                                Records are stored for 30 days after checkout — enough time for most disputes to surface.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section className="py-16 px-4 md:px-6 bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="max-w-[600px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                        Simple Pricing
                    </h2>
                    <div className="bg-white rounded-2xl p-8 border border-blue-100 shadow-sm">
                        <div className="text-5xl font-bold text-slate-900 mb-2">€5.99</div>
                        <p className="text-slate-500 mb-6">One-time payment per booking</p>

                        <ul className="space-y-3 text-left mb-8">
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                Arrival & departure photo evidence
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                Platform & reservation ID tracking
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                Timestamped, sealed evidence
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                Downloadable evidence report PDF
                            </li>
                            <li className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
                                30 days secure retention after checkout
                            </li>
                        </ul>

                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                        >
                            Start short-stay evidence
                            <ArrowRight size={18} />
                        </Link>
                        <p className="text-xs text-slate-500 mt-4">No subscription. No recurring fees.</p>
                    </div>
                </div>
            </section>

            {/* Trust signals */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">
                    <div className="grid sm:grid-cols-3 gap-8 text-center">
                        <div>
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Shield size={24} className="text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Your data, your control</h3>
                            <p className="text-sm text-slate-600">Private account. Share only what you choose.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Clock size={24} className="text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Immutable timestamps</h3>
                            <p className="text-sm text-slate-600">Records are locked when sealed. No backdating.</p>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                                <Home size={24} className="text-slate-600" />
                            </div>
                            <h3 className="font-semibold text-slate-900 mb-1">Works anywhere</h3>
                            <p className="text-sm text-slate-600">Any platform, any country, any property.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-16 px-4 md:px-6 bg-slate-900">
                <div className="max-w-[600px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
                        Don't let a disputed claim ruin your trip
                    </h2>
                    <p className="text-slate-300 mb-8">
                        A few photos on arrival and departure can save you hundreds in fraudulent damage charges.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all text-lg"
                    >
                        Get started for €5.99
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            <ScrollToTop />
            <Footer />
        </div>
    )
}
