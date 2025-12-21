import Link from 'next/link'
import { FileText, Clock, Lock, Upload, Camera, Bell, FileDown, Users, Shield, Eye, ArrowRight, Check, Sparkles } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero Section */}
            <section className="hero-gradient pt-20 md:pt-28 pb-16 md:pb-24 px-4 md:px-6">
                <div className="max-w-[1120px] mx-auto text-center">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-full mb-8 animate-fade-in-up opacity-0">
                        <Sparkles size={14} className="text-amber-500" />
                        <span className="text-sm font-medium text-slate-600">Privacy-first. Built for tenants.</span>
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
                        A privacy-first vault for tenants to store rental documents, move-in photos, and key notice dates — securely in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6 px-4 animate-fade-in-up opacity-0 delay-300">
                        <Link
                            href="/login"
                            className="group w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
                        >
                            Get started free
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all text-base md:text-lg hover:-translate-y-1"
                        >
                            See pricing
                        </Link>
                    </div>

                    <p className="text-sm text-slate-500 animate-fade-in-up opacity-0 delay-400">
                        Free to explore. Pay only when you save and export.
                    </p>

                    {/* Trust Strip */}
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-6 mt-14 pt-10 animate-fade-in-up opacity-0 delay-500">
                        <div className="trust-badge">
                            <div className="w-10 h-10 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl flex items-center justify-center">
                                <Users size={18} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">Built for tenants</span>
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
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need, in one place</h2>
                        <p className="text-slate-600 text-lg max-w-xl mx-auto">Simple tools to protect your deposit and stay organised throughout your rental.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Contract clarity */}
                        <div className="feature-card group">
                            <div className="icon-container icon-container-blue mb-6">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors">Contract clarity</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Upload your lease to review key dates, notice periods, and important terms. Ask questions and translate to your language.
                            </p>
                        </div>

                        {/* Photo evidence */}
                        <div className="feature-card group">
                            <div className="icon-container icon-container-green mb-6">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-green-600 transition-colors">Photo evidence</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Document apartment condition at move-in and before handover. Photos are stored with system timestamps for your records.
                            </p>
                        </div>

                        {/* Deadline reminders */}
                        <div className="feature-card group">
                            <div className="icon-container icon-container-amber mb-6">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors">Deadline reminders</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Choose what to be reminded about — contract termination, renewals, rent payments — and when you want reminders.
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
                        <p className="text-slate-600 text-lg max-w-xl mx-auto">Four simple steps to protect your rental and stay on top of deadlines.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {[
                            {
                                step: 1,
                                icon: <Upload size={24} />,
                                iconClass: 'icon-container-blue',
                                hoverColor: 'group-hover:text-blue-600',
                                title: 'Review your lease',
                                desc: 'Upload your rental contract to see key dates and terms in a clear summary.'
                            },
                            {
                                step: 2,
                                icon: <Camera size={24} />,
                                iconClass: 'icon-container-green',
                                hoverColor: 'group-hover:text-green-600',
                                title: 'Record condition',
                                desc: 'Take room-by-room photos at move-in and again before you return the keys.'
                            },
                            {
                                step: 3,
                                icon: <Bell size={24} />,
                                iconClass: 'icon-container-amber',
                                hoverColor: 'group-hover:text-amber-600',
                                title: 'Set reminders',
                                desc: 'Get notified before notice deadlines or rent due dates — only for what you choose.'
                            },
                            {
                                step: 4,
                                icon: <FileDown size={24} />,
                                iconClass: 'icon-container-purple',
                                hoverColor: 'group-hover:text-purple-600',
                                title: 'Export when needed',
                                desc: 'Generate a clean, shareable PDF with your photos, timestamps, and timeline.'
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
                        <h2 className="text-2xl md:text-3xl font-bold mb-4">Built for tenants like you</h2>
                        <p className="text-slate-600 text-lg leading-relaxed mb-6">
                            For tenants who want clarity, organisation, and peace of mind throughout their rental. Especially useful when renting abroad or in a different language.
                        </p>
                        <div className="flex flex-wrap justify-center gap-3">
                            {['First-time renters', 'Expats', 'International students', 'Remote workers'].map((tag) => (
                                <span key={tag} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SEO Section: Rental Documentation & Deposit Protection */}
            <section className="py-16 md:py-20 px-4 md:px-6">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
                        Rental documentation and deposit protection for tenants
                    </h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">Why document your rental?</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Many tenants lose part of their deposit due to disputes about apartment condition.
                                Without proper documentation, it's difficult to prove the state of the property when you moved in.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Keeping organised records of your lease, photos, and key dates helps you stay protected
                                throughout your tenancy — whether you're renting locally or abroad.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-900">How RentVault helps</h3>
                            <p className="text-slate-600 leading-relaxed">
                                RentVault is a simple, private vault where tenants can store rental contracts,
                                move-in and move-out photos, and set reminders for important dates like notice periods.
                            </p>
                            <p className="text-slate-600 leading-relaxed">
                                Everything is organised in one place — no more searching through emails or camera rolls.
                                When you need your documentation, it's ready.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 md:py-28 px-4 md:px-6">
                <div className="max-w-[720px] mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to protect your deposit?</h2>
                    <p className="text-slate-600 mb-10 text-lg">
                        Start exploring for free. Pay only when you need to save and export.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="group px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2"
                        >
                            Get started free
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
                            <span>GDPR compliant</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 border-t border-slate-100 mt-auto bg-slate-50">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                        <div className="flex flex-col items-center md:items-start gap-2">
                            <span className="text-lg font-bold text-slate-900">RentVault</span>
                            <span className="text-slate-500 text-sm text-center md:text-left max-w-md">
                                Securely stores and organises your rental documents. Not legal advice.
                            </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm">
                            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Privacy</Link>
                            <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Terms</Link>
                        </div>
                    </div>
                    <div className="text-center mt-8 pt-6 border-t border-slate-200">
                        <span className="text-sm text-slate-400">© 2025 RentVault. All rights reserved.</span>
                    </div>
                </div>
            </footer>
        </div>
    )
}
