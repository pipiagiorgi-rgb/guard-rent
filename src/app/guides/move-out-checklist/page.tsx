import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, CheckSquare, Clock, Key, FileText, AlertTriangle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Move-Out Checklist for Tenants | Protect Your Deposit | RentVault',
    description: 'A step-by-step move-out checklist for tenants. Learn what to document and how to prepare records before handing keys back.',
    alternates: {
        canonical: 'https://rentvault.co/guides/move-out-checklist'
    }
}

export default function MoveOutChecklistGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Move-Out Checklist: What Tenants Should Do Before Leaving',
        description: 'A step-by-step move-out checklist for tenants. Learn what to document before handing keys back.',
        datePublished: '2025-01-01',
        dateModified: '2025-01-01',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        mainEntityOfPage: 'https://rentvault.co/guides/move-out-checklist'
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.co' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.co/guides' },
            { '@type': 'ListItem', position: 3, name: 'Move-Out Checklist', item: 'https://rentvault.co/guides/move-out-checklist' }
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
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                            <CheckSquare className="text-purple-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Move-Out Checklist: What Tenants Should Do Before Leaving
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        The way you leave a property determines how your deposit dispute plays out.
                        Document everything before you hand back the keys.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* Before You Hand Back the Keys */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Before You Hand Back the Keys</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            The final hours in your rental are critical. Once you hand over the keys, you lose access — and you can't go back to take more photos.
                        </p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">Clean thoroughly</h3>
                                <p className="text-sm text-slate-600">
                                    Cleaning disputes are the most common reason for deposit deductions.
                                    Document the condition after you've finished cleaning.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">Photograph every room</h3>
                                <p className="text-sm text-slate-600">
                                    Wide shots and close-ups. Cover the same areas you photographed at move-in if possible.
                                </p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <h3 className="font-semibold text-slate-900 mb-2">Capture appliances and fixtures</h3>
                                <p className="text-sm text-slate-600">
                                    Open the oven, show the fridge interior, photograph sinks and showers.
                                    These are common dispute areas.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Why Timing Matters */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Timing Matters at Move-Out</h2>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-4">
                            <div className="flex gap-3 items-start">
                                <Clock size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-amber-800 text-sm mb-2">
                                        <strong>Photos taken after you leave can be challenged.</strong>
                                    </p>
                                    <p className="text-amber-700 text-sm">
                                        If a dispute arises days or weeks after handover, how do you prove what condition you left it in?
                                        Photos taken on handover day, before you surrendered access, carry more weight.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                            Landlords often do their own inspection after you leave.
                            If their photos show damage you didn't document, you're on the back foot.
                        </p>
                    </div>

                    {/* How to Prepare Clear Records */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Prepare Clear Records</h2>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Match your move-in coverage</p>
                                    <p className="text-sm text-slate-600">
                                        If you photographed a room at check-in, photograph it now.
                                        Matching coverage makes comparison easier if there's a dispute.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Avoid gaps</p>
                                    <p className="text-sm text-slate-600">
                                        Don't skip rooms or areas. A gap in documentation can be used against you.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Record meter readings</p>
                                    <p className="text-sm text-slate-600">
                                        Final readings for electricity, gas, water. Photo the meters.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Note keys returned</p>
                                    <p className="text-sm text-slate-600">
                                        How many keys, fobs, access cards. Get confirmation if possible.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How RentVault Helps */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault Helps at Move-Out</h2>
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Camera size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Keeps move-in and move-out records together</h3>
                                    <p className="text-sm text-slate-600">
                                        One place for your entire tenancy. Easy to compare before and after.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Clock size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Preserves what was recorded at the time</h3>
                                    <p className="text-sm text-slate-600">
                                        When you seal your handover, records are locked with timestamps. No edits after.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Creates a clear summary if needed later</h3>
                                    <p className="text-sm text-slate-600">
                                        Download a Deposit Recovery Pack — a PDF with check-in vs handover evidence, ready to submit.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center mb-12">
                        <h3 className="text-xl font-bold text-white mb-3">Organise your move-out records</h3>
                        <p className="text-slate-300 mb-6">Free to start. No card required.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Start free
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

                    {/* Quick Checklist */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Move-Out Checklist (Quick Summary)</h2>
                        <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                            <ul className="space-y-3 text-slate-700">
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Clean the property thoroughly</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Photograph every room — wide shots and close-ups</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Capture all appliances (inside and out)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Record final meter readings</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Count and note keys returned</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Take photos BEFORE handing over keys</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-purple-600 flex-shrink-0 mt-0.5" />
                                    <span>Seal and store your records immediately</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Warning box */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-12">
                        <div className="flex gap-3 items-start">
                            <AlertTriangle size={24} className="text-red-500 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-red-900 mb-1">Don't wait until there's a dispute</h3>
                                <p className="text-red-800 text-sm">
                                    By the time you realise there's a problem, you've already lost access to the property.
                                    Document on handover day, not after.
                                </p>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Related guides */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/guides/landlord-not-returning-deposit" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Landlord not returning deposit</span>
                            </div>
                        </Link>
                        <Link href="/guides/move-in-checklist-tenant" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <CheckSquare size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Move-in checklist</span>
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
