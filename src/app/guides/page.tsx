import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Clock, Shield, AlertCircle, Lock, Hash, FileDown, Video } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Tenant Guides: Protect Your Deposit | RentVault',
    description: 'Free guides for tenants. Learn how to document your rental, protect your deposit, and build evidence that stands up in disputes.',
    alternates: {
        canonical: 'https://rentvault.ai/guides'
    }
}

// Guide topics with links
const guides = [
    {
        icon: Camera,
        title: 'Why move-in photos matter',
        description: 'Without timestamped evidence, landlords can blame you for damage that was already there.',
        slug: 'move-in-photos',
        color: 'green'
    },
    {
        icon: Clock,
        title: 'Understanding notice periods',
        description: 'Miss your deadline and you are legally bound to pay rent you did not plan for.',
        slug: 'notice-periods',
        color: 'amber'
    },
    {
        icon: Shield,
        title: 'Protecting your deposit',
        description: 'One in four renters do not get their full deposit back. Evidence decides who wins.',
        slug: 'deposit-protection',
        color: 'blue'
    },
    {
        icon: AlertCircle,
        title: 'Logging mid-tenancy issues',
        description: 'Document problems as they happen. Build a timeline that protects you at move-out.',
        slug: 'mid-tenancy-issues',
        color: 'red'
    }
]

// RentVault features
const features = [
    {
        icon: Clock,
        title: 'System timestamps',
        description: 'Every photo and document is recorded with exact date and time.'
    },
    {
        icon: Hash,
        title: 'File integrity hashing',
        description: 'Cryptographic hashes prove files have not been tampered with.'
    },
    {
        icon: Lock,
        title: 'Sealed evidence',
        description: 'Lock your check-in and handover. No edits, no deletions.'
    },
    {
        icon: FileDown,
        title: 'Official PDF reports',
        description: 'Export Check-in Packs and Deposit Recovery Packs.'
    },
    {
        icon: Video,
        title: 'Walkthrough videos',
        description: 'Upload video evidence with the same protection as photos.'
    },
    {
        icon: Shield,
        title: '12-month retention',
        description: 'Your evidence is stored securely for the full tenancy period.'
    }
]

const colorClasses: Record<string, { bg: string; text: string; hoverText: string }> = {
    green: { bg: 'bg-green-100', text: 'text-green-600', hoverText: 'group-hover:text-green-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', hoverText: 'group-hover:text-amber-600' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', hoverText: 'group-hover:text-blue-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600', hoverText: 'group-hover:text-red-600' }
}

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
                        Guides for tenants
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Renting anywhere in Europe or the UK? These guides cover the common problems tenants face —
                        and how to protect yourself with proper evidence.
                    </p>
                </div>
            </section>

            {/* Guide Cards */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[900px] mx-auto">
                    <div className="grid md:grid-cols-2 gap-4">
                        {guides.map((guide) => {
                            const colors = colorClasses[guide.color]
                            return (
                                <Link
                                    key={guide.slug}
                                    href={`/guides/${guide.slug}`}
                                    className="bg-white rounded-xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-lg transition-all group"
                                >
                                    <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4`}>
                                        <guide.icon size={24} className={colors.text} />
                                    </div>
                                    <h3 className={`text-xl font-bold text-slate-900 mb-2 ${colors.hoverText} transition-colors`}>
                                        {guide.title}
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        {guide.description}
                                    </p>
                                    <div className="mt-4 text-sm font-medium text-slate-400 group-hover:text-slate-600 transition-colors flex items-center gap-1">
                                        Read guide <ArrowRight size={14} />
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* How RentVault Helps */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[900px] mx-auto">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 mb-3">How RentVault protects you</h2>
                        <p className="text-slate-600 max-w-xl mx-auto">
                            The first platform built to secure your entire tenancy — from signing the lease to getting your deposit back.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="bg-white rounded-xl border border-slate-200 p-5"
                            >
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                                    <feature.icon size={20} className="text-slate-600" />
                                </div>
                                <h3 className="font-semibold text-slate-900 mb-1">{feature.title}</h3>
                                <p className="text-sm text-slate-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 md:px-6">
                <div className="max-w-[600px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
                        Protect your next rental
                    </h2>
                    <p className="text-slate-600 mb-8">
                        Document for free. Pay only when you need official exports.
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
                        These guides are for general information only and do not constitute legal advice.
                        Rental laws vary by country and region. Consult local authorities or a legal professional for specific situations.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    )
}
