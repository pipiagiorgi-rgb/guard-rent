'use client'

import Link from 'next/link'
import { Check, FileText, Shield, Clock, Eye } from 'lucide-react'
import { FAQAccordion } from '@/components/ui/FAQAccordion'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const faqItems = [
    {
        question: "Can I use RentVault if I'm already renting?",
        answer: "Yes. RentVault is useful whether you're preparing to move or already renting. You can store your contract, track notice dates, set reminders, and keep everything organised so nothing important is missed later."
    },
    {
        question: "Can I try RentVault before paying?",
        answer: "Yes. You can explore preview features for free — including 3 contract questions, 1 translation, and 3 photos per rental. Preview results are temporary and cleared on refresh. Purchasing a pack unlocks unlimited access and saves everything permanently."
    },
    {
        question: "Is RentVault a subscription?",
        answer: "No. RentVault uses one-time payments. You pay once for the pack you need, and your data is stored securely for 12 months. No recurring charges."
    },
    {
        question: "What happens after 12 months?",
        answer: "Your documents are securely stored for 12 months from the date of purchase. Before the retention period ends, you'll receive a reminder. You can extend storage for another 12 months for €9, or download your files and let the data expire."
    },
    {
        question: "What's included in Preview mode?",
        answer: "Preview mode lets you upload contracts, scan for key dates, ask up to 3 questions, request 1 translation, and upload up to 3 photos per rental. Preview results are not saved — they're cleared when you refresh. Unlocking a pack saves everything permanently and removes limits."
    },
    {
        question: "Can I delete my data at any time?",
        answer: "Yes. You can delete individual rentals or your entire account at any time directly from the application. We respect your right to control your data."
    },
    {
        question: "What is the Deposit Recovery Pack?",
        answer: "It's a downloadable PDF that includes your move-in and move-out photos with timestamps, organised by room. Useful if you need to document the apartment's condition for deposit discussions."
    },
    {
        question: "Is the contract analysis legal advice?",
        answer: "No. RentVault helps you understand and organise your rental documents, but it does not provide legal advice. If you need legal guidance, consult a qualified professional in your jurisdiction."
    },
    {
        question: "How are my documents stored?",
        answer: "Your documents are stored securely with encryption in transit and at rest. Only you can access your files. We do not share your data with third parties."
    },
    {
        question: "Can I use RentVault if I'm renting abroad?",
        answer: "Yes. RentVault is especially useful when renting in a different country or language. You can upload contracts in any language and request translations for easier reading."
    },
    {
        question: "What payment methods do you accept?",
        answer: "Payments are processed securely by Stripe. You can pay with major credit and debit cards. VAT may apply depending on your location."
    }
]

export default function PricingPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [loading, setLoading] = useState<string | null>(null)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            setIsLoggedIn(!!user)
        }
        checkAuth()
    }, [])

    const handleGetStarted = (packType: 'checkin' | 'bundle' | 'moveout') => {
        if (!isLoggedIn) {
            // Not logged in - send to login
            router.push('/login')
        } else {
            // Logged in - send to app to select rental
            router.push('/app')
        }
    }

    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-[1120px] mx-auto px-4 md:px-6 py-12 md:py-20">
                {/* Title */}
                <div className="text-center mb-12 md:mb-16">
                    <h1 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight">Simple, transparent pricing</h1>
                    <p className="text-lg text-slate-600 max-w-xl mx-auto">
                        No subscriptions. Pay only when you need protection.
                    </p>
                </div>

                {/* Preview Mode Banner */}
                <div className="max-w-3xl mx-auto mb-12 p-6 bg-blue-50 border border-blue-200 rounded-2xl">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Eye size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 mb-1">Preview features</h3>
                            <p className="text-sm text-blue-800">
                                You can explore RentVault for free. Upload contracts, scan for dates,
                                ask questions, and translate in preview mode. Data is cleared on refresh. Buy a pack to save your data.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing Cards */}
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
                                <span>Unlimited contract questions &amp; translations</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Check-in photo documentation</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Check-in report (PDF)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Data saved for 12 months</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('checkin')}
                            className="w-full py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all"
                        >
                            Select
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-3">
                            Extend storage if needed for €9/year.
                        </p>
                    </div>

                    {/* Full Bundle */}
                    <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl relative flex flex-col">
                        <div className="mb-6">
                            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white mb-3">
                                <Shield size={20} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">Full Bundle</h3>
                            <p className="text-sm text-slate-400">Complete protection</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€39</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Everything in the Check-In Pack</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Deadline reminders</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Move-out photo documentation</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Deposit recovery pack (PDF)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                <span>Data saved for 12 months</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('bundle')}
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
                            <h3 className="text-xl font-bold mb-1">Move-Out Pack</h3>
                            <p className="text-sm text-slate-500">For moving out</p>
                        </div>
                        <div className="mb-6">
                            <span className="text-4xl font-bold">€29</span>
                        </div>
                        <ul className="space-y-3 mb-8 flex-1">
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Unlimited contract questions &amp; translations</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Move-out photo documentation</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Deposit recovery pack (PDF)</span>
                            </li>
                            <li className="flex items-start gap-3 text-sm">
                                <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>Data saved for 12 months</span>
                            </li>
                        </ul>
                        <button
                            onClick={() => handleGetStarted('moveout')}
                            className="w-full py-3 border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 font-medium transition-all"
                        >
                            Select
                        </button>
                        <p className="text-xs text-slate-400 text-center mt-3">
                            Extend storage if needed for €9/year.
                        </p>
                    </div>
                </div>

                {/* Footnote */}
                <div className="text-center mt-10 md:mt-12 space-y-1 text-sm text-slate-500">
                    <p>Delete your data at any time.</p>
                    <p>No automatic renewals.</p>
                </div>

                {/* Preview vs Saved comparison */}
                <div className="max-w-3xl mx-auto mt-12 p-6 bg-slate-50 rounded-xl">
                    <h3 className="font-semibold mb-4 text-center">Preview mode vs Unlocked</h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-3">Preview mode (free)</p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>• Upload and scan contracts</li>
                                <li>• 3 contract questions per rental</li>
                                <li>• 1 translation per rental</li>
                                <li>• 3 photos (not saved)</li>
                                <li>• Results cleared on refresh</li>
                            </ul>
                        </div>
                        <div className="bg-white p-5 rounded-lg border border-slate-200">
                            <p className="text-sm font-medium text-slate-700 mb-3">With a pack</p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li>• Unlimited questions &amp; translations</li>
                                <li>• All data saved for 12 months</li>
                                <li>• PDF exports available</li>
                                <li>• Deadline notifications</li>
                            </ul>
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

                {/* FAQ Section */}
                <div className="max-w-2xl mx-auto mt-16 md:mt-20">
                    <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
                    <FAQAccordion items={faqItems} />
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-8 mt-12">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6 text-center text-sm text-slate-500">
                    <p>RentVault securely stores and organises your rental documents. Not legal advice.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="hover:text-slate-900 transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-900 transition-colors">Terms</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
