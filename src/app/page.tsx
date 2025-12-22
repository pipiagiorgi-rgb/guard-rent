import type { Metadata } from 'next'
import Link from 'next/link'
import { FileText, Clock, Lock, Upload, Camera, Bell, FileDown, Users, Shield, Eye, ArrowRight, Check } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'RentVault | Protect Your Rental Deposit',
    description: 'A privacy-first vault for tenants to store contracts, photos, and key dates.',
    alternates: {
        canonical: 'https://rentvault.ai'
    }
}

export default function Home() {
    return (
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

                    {/* Subheadline */}
                    <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed px-4 animate-fade-in-up opacity-0 delay-200">
                        A secure vault for tenants to store contracts, photos, and key dates — all in one place.
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
                        Free to explore. Pay only if you export your data.
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

            {/* Features Section */}
            <section className="py-20 md:py-28 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-[1120px] mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything in one place</h2>
                        <p className="text-slate-600 text-lg max-w-xl mx-auto">Tools to protect your deposit and stay organised.</p>
                    </div>

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
            <section className="py-20 md:py-28 px-4 md:px-6">
                <div className="max-w-[1120px] mx-auto">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
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

            {/* Who it's for */}
            <section className="py-16 md:py-20 px-4 md:px-6 bg-gradient-to-b from-white to-slate-50">
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

            {/* SEO Section: Rental Documentation & Deposit Protection - Content Refined */}
            <section className="py-16 md:py-20 px-4 md:px-6">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                        Rental documentation for tenants
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">Why accurate records matter</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Disputes about apartment condition often happen because of missing evidence.
                                It can be hard to remember the exact state of a property years after moving in.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Keeping organised records of your lease and photos helps you answer questions if they come up later.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">What RentVault does</h3>
                            <p className="text-slate-600 leading-relaxed">
                                RentVault is a secure place to store your contract, photos, and dates.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Instead of searching through emails or camera rolls, your rental history is kept together.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-28 px-4 md:px-6">
                <div className="max-w-[720px] mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to get organised?</h2>
                    <p className="text-slate-600 mb-10 text-lg">
                        Start for free. Pay only if you want to export your data.
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
    )
}

