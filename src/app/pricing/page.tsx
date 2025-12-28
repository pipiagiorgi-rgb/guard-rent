'use client'

import Link from 'next/link'
import { Check, FileText, Shield, Clock, Eye, ChevronDown, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'

// FAQ items - trimmed for conversion, 8 essential questions
const faqItems = [
    {
        question: "What do I get for free?",
        answer: "You can explore RentVault in preview mode — upload and scan contracts, ask up to 3 questions, request 1 translation, and upload up to 3 photos per rental. Preview data clears on refresh."
    },
    {
        question: "What changes when I buy a pack?",
        answer: "Purchasing a pack removes all limits and saves your data permanently. You get unlimited contract questions, translations, and photos, plus deadline reminder emails, official PDF reports, and 12 months of secure storage."
    },
    {
        question: "Is this legal advice?",
        answer: "No. RentVault helps you understand and organise your rental documents, but does not provide legal advice. If you need legal guidance, consult a qualified professional."
    },
    {
        question: "Are records timestamped and tamper-proof?",
        answer: "Yes. All uploads receive system-generated timestamps. Once you complete a phase (check-in or handover), records are locked and cannot be modified."
    },
    {
        question: "How long is data stored?",
        answer: "Your documents are stored securely for 12 months. You can extend for another 12 months for €9, or download your files before expiry."
    },
    {
        question: "Is RentVault a subscription?",
        answer: "No. You pay once for the pack you need. No recurring charges."
    },
    {
        question: "Can I delete my data?",
        answer: "Yes. You can delete individual rentals or your entire account at any time from within the app."
    },
    {
        question: "What are Related Contracts?",
        answer: "An optional €9 add-on to track utility and service contracts (internet, electricity, parking) linked to your rental. These are reference-only and not included in evidence reports."
    }
]

// Simple FAQ Accordion component
function FAQItem({ question, answer }: { question: string; answer: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="border-b border-slate-200 last:border-b-0">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full py-4 flex items-center justify-between text-left hover:bg-slate-50 -mx-4 px-4 rounded-lg transition-colors"
            >
                <span className="font-medium text-slate-900">{question}</span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="pb-4 text-slate-600 text-sm leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    )
}

export default function PricingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkAuth()
    }, [])

    const handleGetStarted = () => {
        if (!isLoggedIn) {
            router.push('/login')
        } else {
            router.push('/vault')
        }
    }
    // Generate FAQ Schema for SEO
    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqItems.map(({ question, answer }) => ({
            '@type': 'Question',
            name: question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: answer
            }
        }))
    }

    return (
        <div className="min-h-screen bg-white">
            {/* FAQ Schema for SEO */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
            <main className="max-w-[1120px] mx-auto px-4 md:px-6 py-12 md:py-20">
                {/* Title */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Simple, transparent pricing</h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        No subscriptions. Pay only when you need protection.
                    </p>
                    <p className="text-sm text-slate-500 mt-3">
                        Free to explore. Pay only when you need official exports or extended retention.
                    </p>
                </div>

                {/* Preview Mode Note */}
                <div className="max-w-3xl mx-auto mb-10 flex items-center justify-center gap-3 text-sm text-slate-500">
                    <Eye size={16} className="flex-shrink-0" />
                    <span>Preview mode is free — data clears on refresh. Buy a pack to save permanently.</span>
                </div>

                {/* Pricing Cards - OUTCOME-FOCUSED BULLETS */}
                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {/* Check-In Pack */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all flex flex-col">
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 mb-3">
                                <FileText size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Check-In Pack</h3>
                            <p className="text-sm text-slate-500">For moving in</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€19</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Evidence record for move-in (photos + timestamps)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Lease summary for reference</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>12 months secure record retention</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleGetStarted}
                            className="w-full py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all"
                        >
                            Select
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-3">
                            Extend storage if needed for €9/year.
                        </p>
                    </div>

                    {/* Full Bundle - POPULAR */}
                    <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl relative flex flex-col md:-mt-4 md:mb-4 shadow-xl">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Most popular</span>
                        </div>
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white mb-3">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Full Pack</h3>
                            <p className="text-sm text-slate-400">Complete protection</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€39</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Complete rental evidence record (check-in → handover)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Immutable records with timestamps</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>One complete dispute-ready PDF</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Deadline reminder emails</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>12 months secure retention</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleGetStarted}
                            className="w-full py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all"
                        >
                            Select
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-3">
                            Extend storage if needed for €9/year.
                        </p>
                    </div>

                    {/* Move-Out Pack */}
                    <div className="bg-white p-6 md:p-8 rounded-2xl border-2 border-slate-200 hover:border-slate-300 transition-all flex flex-col">
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-3">
                                <Clock size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Handover Pack</h3>
                            <p className="text-sm text-slate-500">For ending your tenancy</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€29</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Before/after comparison (check-in vs handover)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Locked handover record</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Deposit recovery evidence PDF</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>12 months secure retention</span>
                            </li>
                        </ul>
                        <button
                            onClick={handleGetStarted}
                            className="w-full py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all"
                        >
                            Select
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-3">
                            Extend storage if needed for €9/year.
                        </p>
                    </div>
                </div>

                {/* Walkthrough Video Note */}
                <div className="max-w-3xl mx-auto mt-8 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Video size={16} />
                    <span>Optional walkthrough video evidence can be uploaded and referenced in exports.</span>
                </div>

                {/* Related Contracts Add-on */}
                <div className="max-w-3xl mx-auto mt-4 flex items-center justify-center gap-2 text-sm text-slate-500">
                    <FileText size={16} />
                    <span>Optional add-on: Related contracts tracking (reference only) — €9 one-time</span>
                </div>

                {/* PDF Export Flow - with title for context */}
                <div className="max-w-3xl mx-auto mt-12">
                    <h3 className="text-lg font-semibold mb-6 text-center text-slate-900">Export official PDF reports</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col items-center">
                            <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                                <img
                                    src="/screenshots/rentvault-pdf-export-loading-preview.webp"
                                    alt="RentVault PDF export loading screen showing gathering photos, creating document, and finalizing steps"
                                    className="w-full h-auto"
                                    loading="lazy"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-3 text-center">Building your PDF report</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="max-w-[280px] rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-white">
                                <img
                                    src="/screenshots/rentvault-deposit-recovery-pack-move-out.webp"
                                    alt="RentVault Deposit Recovery Pack showing move-out property record with evidence summary and issues documented"
                                    className="w-full h-auto"
                                    loading="lazy"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-3 text-center">Deposit Recovery Pack ready to download</p>
                        </div>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="max-w-3xl mx-auto mt-12">
                    <h3 className="text-lg font-semibold mb-6 text-center text-slate-900">Preview vs Paid</h3>

                    {/* Desktop Table */}
                    <div className="hidden sm:block overflow-hidden rounded-xl border border-slate-200 bg-white">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left py-4 px-5 text-sm font-semibold text-slate-700">Feature</th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-500 w-32">Preview</th>
                                    <th className="text-center py-4 px-4 text-sm font-semibold text-slate-900 w-32 bg-emerald-50">Full access</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Upload and scan contracts</td>
                                    <td className="py-3.5 px-4 text-center"><span className="text-emerald-600">✓</span></td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Ask questions about the contract</td>
                                    <td className="py-3.5 px-4 text-center text-sm text-slate-400">3 max</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">Unlimited</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Contract translation</td>
                                    <td className="py-3.5 px-4 text-center text-sm text-slate-400">1 max</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">Unlimited</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Add photos (check-in / handover)</td>
                                    <td className="py-3.5 px-4 text-center text-sm text-slate-400">3 per rental</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">Unlimited</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Data saved securely</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Deadline reminder emails</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Official PDF reports</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Locked, immutable evidence</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">12-month secure retention</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                                <tr>
                                    <td className="py-3.5 px-5 text-sm text-slate-700">Walkthrough video upload</td>
                                    <td className="py-3.5 px-4 text-center text-slate-300">—</td>
                                    <td className="py-3.5 px-4 text-center bg-emerald-50/50"><span className="text-emerald-600">✓</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="sm:hidden space-y-3">
                        {/* Preview Column */}
                        <div className="bg-white rounded-xl border border-slate-200 p-5">
                            <p className="text-sm font-semibold text-slate-500 mb-4">Preview (free)</p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Upload and scan contracts</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">3 max</span>
                                    <span className="text-slate-700">Ask questions</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">1 max</span>
                                    <span className="text-slate-700">Translation</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-slate-400 text-xs font-medium bg-slate-100 px-2 py-0.5 rounded">3/rental</span>
                                    <span className="text-slate-700">Photos</span>
                                </li>
                            </ul>
                            <p className="text-xs text-slate-400 mt-4 pt-3 border-t border-slate-100">Results are temporary.</p>
                        </div>

                        {/* Full Access Column */}
                        <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-5">
                            <p className="text-sm font-semibold text-emerald-800 mb-4">Full access</p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Unlimited questions & translations</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Unlimited photos & videos</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Data saved for 12 months</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Deadline reminder emails</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Official PDF reports</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="text-emerald-600 text-base">✓</span>
                                    <span className="text-slate-700">Locked, immutable evidence</span>
                                </li>
                            </ul>
                            <p className="text-xs text-emerald-700 mt-4 pt-3 border-t border-emerald-200">One payment. No subscription.</p>
                        </div>
                    </div>
                </div>

                {/* Data retention info */}
                <div className="max-w-xl mx-auto mt-8 p-6 bg-slate-50 rounded-xl text-center">
                    <h3 className="font-semibold mb-2">Data retention</h3>
                    <p className="text-sm text-slate-600 mb-2">
                        Your documents are stored securely for 12 months.<br />
                        This covers most rentals and deposit disputes.
                    </p>
                    <p className="text-sm text-slate-600">
                        If your rental lasts longer, you can extend secure storage for an additional 12 months for €9.
                    </p>
                </div>

                {/* Guides Link for Trust */}
                <div className="max-w-xl mx-auto mt-8 text-center">
                    <p className="text-sm text-slate-500">
                        New to renting? Read our{' '}
                        <Link href="/guides" className="text-slate-700 underline hover:text-slate-900">
                            free guides for tenants
                        </Link>
                        .
                    </p>
                </div>

                {/* Footnote - Trust signals */}
                <div className="text-center mt-8 space-y-1 text-sm text-slate-500">
                    <p>Delete your data at any time. No automatic renewals.</p>
                </div>

                {/* FAQ Section - Collapsible */}
                <div className="max-w-2xl mx-auto mt-16 md:mt-20">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        {faqItems.map((item, index) => (
                            <FAQItem key={index} question={item.question} answer={item.answer} />
                        ))}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
