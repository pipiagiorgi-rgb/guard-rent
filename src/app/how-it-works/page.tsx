'use client'

import Link from 'next/link'
import {
    Camera,
    Shield,
    FileText,
    Clock,
    CheckCircle,
    ArrowRight,
    Smartphone,
    Lock,
    Download,
    ChevronRight
} from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

const steps = [
    {
        number: '01',
        title: 'Document Your Property',
        description: 'Take photos of every room when you move in. Upload your lease contract to get key dates and terms extracted automatically.',
        icon: Camera,
        features: [
            'Room-by-room photo capture',
            'AI contract scanning',
            'Key deadline extraction',
            'Works on any device'
        ],
        color: 'blue'
    },
    {
        number: '02',
        title: 'Seal Your Evidence',
        description: 'Lock your evidence with an immutable timestamp. Once sealed, records cannot be altered — creating a credible, verifiable record.',
        icon: Lock,
        features: [
            'Tamper-proof timestamps',
            'Locked and immutable',
            'Secure cloud storage',
            '12 months retention'
        ],
        color: 'emerald'
    },
    {
        number: '03',
        title: 'Export Your Report',
        description: 'Download a professional PDF report with all your evidence, ready to submit to landlords, letting agents, or deposit schemes.',
        icon: Download,
        features: [
            'Professional PDF output',
            'All photos included',
            'Timestamped evidence',
            'Dispute-ready format'
        ],
        color: 'purple'
    }
]

const useCases = [
    {
        title: 'Long-Term Rentals',
        description: 'Document move-in condition, track your lease, and create evidence for deposit recovery when you move out.',
        price: 'From €19',
        icon: '🏠'
    },
    {
        title: 'Short-Stay & Vacation',
        description: 'Protect yourself on Airbnb, Booking.com, or VRBO stays with arrival and departure photo evidence.',
        price: '€5.99',
        icon: '✈️'
    },
    {
        title: 'Property Managers',
        description: 'Create consistent condition records for all your properties and resolve guest disputes quickly.',
        price: 'Per booking',
        icon: '🔑'
    }
]

export default function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="max-w-[1120px] mx-auto px-4 md:px-6 py-16 md:py-24">
                <div className="text-center max-w-3xl mx-auto">
                    <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded-full uppercase tracking-wide mb-4">
                        How It Works
                    </span>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-6">
                        Protect your deposit in 3 simple steps
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-8">
                        RentVault helps you create timestamped, tamper-proof records of your rental property.
                        No more "he said, she said" — just clear, credible evidence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-base"
                        >
                            Get Started Free
                            <ArrowRight size={18} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 transition-all text-base"
                        >
                            View Pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Steps */}
            <section className="bg-slate-50 py-16 md:py-24">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Three steps to protection
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto">
                            Document, seal, and export. That's all it takes to create dispute-ready evidence.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {steps.map((step, index) => {
                            const Icon = step.icon
                            const bgColor = step.color === 'blue' ? 'bg-blue-50' :
                                step.color === 'emerald' ? 'bg-emerald-50' : 'bg-purple-50'
                            const iconColor = step.color === 'blue' ? 'text-blue-600' :
                                step.color === 'emerald' ? 'text-emerald-600' : 'text-purple-600'
                            const borderColor = step.color === 'blue' ? 'border-blue-100' :
                                step.color === 'emerald' ? 'border-emerald-100' : 'border-purple-100'

                            return (
                                <div key={index} className={`bg-white rounded-2xl p-8 border ${borderColor} relative`}>
                                    {/* Step Number */}
                                    <div className="absolute -top-4 left-6">
                                        <span className="inline-block px-3 py-1 bg-slate-900 text-white text-sm font-bold rounded-lg">
                                            {step.number}
                                        </span>
                                    </div>

                                    {/* Icon */}
                                    <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center ${iconColor} mb-6 mt-2`}>
                                        <Icon size={28} />
                                    </div>

                                    {/* Content */}
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">{step.description}</p>

                                    {/* Features */}
                                    <ul className="space-y-2">
                                        {step.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-center gap-2 text-sm text-slate-700">
                                                <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Visual Flow */}
            <section className="py-16 md:py-24">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            See it in action
                        </h2>
                        <p className="text-slate-600 max-w-xl mx-auto">
                            From your phone to a professional PDF in minutes
                        </p>
                    </div>

                    {/* Process visualization */}
                    <div className="grid md:grid-cols-4 gap-6 items-center">
                        {/* Step 1: Phone */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-4">
                                <Smartphone size={36} />
                            </div>
                            <p className="font-medium text-slate-900">Take photos</p>
                            <p className="text-sm text-slate-500">Any device, any room</p>
                        </div>

                        <div className="hidden md:flex justify-center">
                            <ChevronRight size={32} className="text-slate-300" />
                        </div>

                        {/* Step 2: Lock */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                <Lock size={36} />
                            </div>
                            <p className="font-medium text-slate-900">Seal evidence</p>
                            <p className="text-sm text-slate-500">Locked with timestamp</p>
                        </div>

                        <div className="hidden md:flex justify-center">
                            <ChevronRight size={32} className="text-slate-300" />
                        </div>

                        {/* Step 3: Shield */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
                                <Shield size={36} />
                            </div>
                            <p className="font-medium text-slate-900">Secure storage</p>
                            <p className="text-sm text-slate-500">12 months retention</p>
                        </div>

                        <div className="hidden md:flex justify-center">
                            <ChevronRight size={32} className="text-slate-300" />
                        </div>

                        {/* Step 4: PDF */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mx-auto mb-4">
                                <FileText size={36} />
                            </div>
                            <p className="font-medium text-slate-900">Export PDF</p>
                            <p className="text-sm text-slate-500">Ready for disputes</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases */}
            <section className="bg-slate-900 text-white py-16 md:py-24">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">
                            Works for every rental
                        </h2>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Whether you're renting long-term or just for a weekend, RentVault has you covered.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {useCases.map((useCase, index) => (
                            <div key={index} className="bg-white/5 backdrop-blur rounded-2xl p-8 border border-white/10">
                                <div className="text-4xl mb-4">{useCase.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{useCase.title}</h3>
                                <p className="text-slate-400 text-sm mb-4 leading-relaxed">{useCase.description}</p>
                                <p className="text-emerald-400 font-semibold">{useCase.price}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Trust Signals */}
            <section className="py-16 md:py-24">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="max-w-3xl mx-auto">
                        <div className="grid sm:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                                    <Clock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Immutable Timestamps</h3>
                                    <p className="text-sm text-slate-600">Every upload receives a system-generated timestamp. Records cannot be backdated or altered.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                                    <Lock size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Locked Evidence</h3>
                                    <p className="text-sm text-slate-600">Once you seal a phase, it's permanent. No edits, no modifications — just truth.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                                    <Shield size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">12-Month Retention</h3>
                                    <p className="text-sm text-slate-600">Your evidence is stored securely for 12 months, covering most rental disputes.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Professional Reports</h3>
                                    <p className="text-sm text-slate-600">Generate dispute-ready PDFs that landlords, agents, and deposit schemes take seriously.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-slate-50 py-16 md:py-20">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Ready to protect your deposit?
                    </h2>
                    <p className="text-slate-600 max-w-xl mx-auto mb-8">
                        Start documenting your rental for free. Pay only when you need official exports.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-lg"
                        >
                            Get Started Free
                            <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="/pricing"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-slate-200 rounded-xl font-semibold hover:bg-white transition-all text-lg"
                        >
                            View Pricing
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500 mt-6">
                        No credit card required. No subscription.
                    </p>
                </div>
            </section>

            <Footer />
        </div>
    )
}
