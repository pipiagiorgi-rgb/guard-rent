'use client'

import Link from 'next/link'
import { ArrowLeft, ArrowRight, FileText, Camera, Shield, Clock, AlertCircle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

// Country data with flags, names, and rental context
const countries = [
    {
        code: 'BE',
        flag: '🇧🇪',
        name: 'Belgium',
        slug: 'belgium',
        language: 'Dutch, French, or German',
        depositNote: 'Typically 2-3 months rent, held in a blocked bank account',
        noticeNote: '3-month notice period is common for standard leases',
        keyTips: [
            'Request a detailed "état des lieux" (inventory) at move-in',
            'Keep copies of all registered letters (recommandé)',
            'Know your regional rules — Brussels, Flanders, and Wallonia differ'
        ]
    },
    {
        code: 'FR',
        flag: '🇫🇷',
        name: 'France',
        slug: 'france',
        language: 'French',
        depositNote: 'Usually 1-2 months rent, returned within 2 months after move-out',
        noticeNote: '1-3 month notice depending on location and reason',
        keyTips: [
            'The "état des lieux" is legally required — take photos too',
            'Furnished rentals have different rules than unfurnished',
            'Send notice via "lettre recommandée avec accusé de réception"'
        ]
    },
    {
        code: 'LU',
        flag: '🇱🇺',
        name: 'Luxembourg',
        slug: 'luxembourg',
        language: 'French, German, or Luxembourgish',
        depositNote: 'Maximum 3 months rent, often held in escrow',
        noticeNote: '3-month notice period is standard',
        keyTips: [
            'Ensure the "bail de location" clearly states deposit amount',
            'Document property condition in writing and photos',
            'Check if your lease is fixed-term or indefinite'
        ]
    }
]

// Common topics for all countries
const commonTopics = [
    {
        icon: Camera,
        title: 'Why move-in photos matter',
        description: 'Timestamped photos protect you if there\'s a dispute about property condition.'
    },
    {
        icon: Clock,
        title: 'Understanding notice periods',
        description: 'Missing your deadline can mean extra months of rent. Know when to act.'
    },
    {
        icon: Shield,
        title: 'Protecting your deposit',
        description: 'Most disputes come down to evidence. Keep records from day one.'
    },
    {
        icon: AlertCircle,
        title: 'Logging mid-tenancy issues',
        description: 'Document problems as they happen, not months later.'
    }
]

export default function GuidesPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="pt-20 pb-12 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-[900px] mx-auto">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm"
                    >
                        <ArrowLeft size={16} />
                        Back to home
                    </Link>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
                        Rental guides for tenants
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Practical information about renting in Belgium, France, and Luxembourg.
                        Know your rights, understand the process, and protect your deposit.
                    </p>
                </div>
            </section>

            {/* Country Cards */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Choose your country</h2>

                    <div className="grid md:grid-cols-3 gap-4">
                        {countries.map((country) => (
                            <div
                                key={country.code}
                                className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all group"
                            >
                                <div className="text-5xl mb-4">{country.flag}</div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {country.name}
                                </h3>
                                <p className="text-sm text-slate-500 mb-4">
                                    Contracts typically in {country.language}
                                </p>

                                <div className="space-y-3 text-sm">
                                    <div>
                                        <span className="font-medium text-slate-700">Deposit: </span>
                                        <span className="text-slate-600">{country.depositNote}</span>
                                    </div>
                                    <div>
                                        <span className="font-medium text-slate-700">Notice: </span>
                                        <span className="text-slate-600">{country.noticeNote}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Key tips</p>
                                    <ul className="space-y-2">
                                        {country.keyTips.map((tip, i) => (
                                            <li key={i} className="text-sm text-slate-600 flex gap-2">
                                                <span className="text-green-500 flex-shrink-0">✓</span>
                                                {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Common Topics */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[900px] mx-auto">
                    <h2 className="text-xl font-bold text-slate-900 mb-6">Essential topics</h2>

                    <div className="grid md:grid-cols-2 gap-4">
                        {commonTopics.map((topic) => (
                            <div
                                key={topic.title}
                                className="bg-white rounded-xl border border-slate-200 p-5 flex gap-4 items-start"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <topic.icon size={20} className="text-slate-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">{topic.title}</h3>
                                    <p className="text-sm text-slate-600">{topic.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-[600px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                        Ready to protect your deposit?
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Start documenting your rental for free. Pay only when you need official exports.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="group px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                            Start now
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-6 py-3 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            View pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Disclaimer */}
            <section className="py-8 px-4 md:px-6 border-t border-slate-100">
                <div className="max-w-[900px] mx-auto">
                    <p className="text-xs text-slate-400 text-center">
                        This information is for general guidance only and does not constitute legal advice.
                        Rental laws vary by region and may change. Consult local authorities or a legal professional for specific situations.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    )
}
