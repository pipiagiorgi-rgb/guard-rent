import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, Lock, FileText, AlertTriangle, HelpCircle, CheckCircle } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Landlord Not Returning Your Deposit? What Tenants Can Do | RentVault',
    description: 'If your landlord won\'t return your deposit, evidence and timing matter. Learn what to do and how to protect yourself before disputes escalate.',
    alternates: {
        canonical: 'https://rentvault.co/guides/landlord-not-returning-deposit'
    }
}

export default function LandlordNotReturningDepositGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Landlord Not Returning Your Deposit? What Tenants Can Do',
        description: 'If your landlord won\'t return your deposit, evidence and timing matter. Learn what to do and how to protect yourself.',
        datePublished: '2025-01-01',
        dateModified: '2025-01-01',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        mainEntityOfPage: 'https://rentvault.co/guides/landlord-not-returning-deposit'
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.co' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.co/guides' },
            { '@type': 'ListItem', position: 3, name: 'Landlord Not Returning Deposit', item: 'https://rentvault.co/guides/landlord-not-returning-deposit' }
        ]
    }

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: 'Can I use RentVault if I already moved out?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Yes. You can upload and organise photos and documents from your phone or files. However, records uploaded later will have later timestamps. Disputes are stronger when evidence is created at the time.'
                }
            },
            {
                '@type': 'Question',
                name: 'What if my landlord took their own photos?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'Having your own independent record is valuable. When both parties have photos, disputes often come down to timing, clarity, and completeness. RentVault helps you present your evidence in an organised, timestamped format.'
                }
            },
            {
                '@type': 'Question',
                name: 'Do landlords get access to my files?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'No. Your RentVault account is private. You choose what to share and when. The only way anyone else sees your records is if you download and send them.'
                }
            }
        ]
    }

    return (
        <div className="min-h-screen bg-white">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                            <AlertTriangle className="text-amber-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Landlord Not Returning Your Deposit? Here's What Tenants Can Do
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Deposit delays are common. Disputes often come down to evidence and timing.
                        Many tenants lose not because they're wrong, but because their records are incomplete.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* Why Deposits Are Often Withheld */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Deposits Are Often Withheld</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Most deposit disputes don't involve bad landlords or dishonest tenants.
                            They happen because of genuine disagreement about condition.
                        </p>
                        <ul className="space-y-3 text-slate-700">
                            <li className="flex items-start gap-3">
                                <span className="text-slate-400 mt-1">•</span>
                                <span><strong>Cleaning disagreements</strong> — Was it clean enough? Standards vary.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-slate-400 mt-1">•</span>
                                <span><strong>Damage claims without "before" photos</strong> — If there's no record from move-in, proving pre-existing damage is hard.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-slate-400 mt-1">•</span>
                                <span><strong>Missed deadlines</strong> — Disputes about notice periods, inspection timing, or handover dates.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-slate-400 mt-1">•</span>
                                <span><strong>Conflicting photos</strong> — Both sides have photos, but they were taken at different times or don't match.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Why Evidence Matters More Than Arguments */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why Evidence Matters More Than Arguments</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When a dispute goes to a deposit scheme or mediator, they don't decide based on who argues better.
                            They look at evidence.
                        </p>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                            <p className="text-slate-700">
                                <strong>Photos without clear timing</strong> are often disputed. A photo could have been taken months before or after — there's no way to tell.
                            </p>
                            <p className="text-slate-700">
                                <strong>Records created after the disagreement started</strong> are weaker.
                                Evidence carries more weight when it was created at the time, before anyone knew there'd be a dispute.
                            </p>
                            <p className="text-slate-700">
                                <strong>Organised, complete records</strong> are more credible than scattered photos in a phone gallery.
                            </p>
                        </div>
                    </div>

                    {/* What Tenants Can Do Immediately */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What Tenants Can Do Immediately</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            If you're dealing with a deposit dispute right now, here's what you can do:
                        </p>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Gather your move-in and move-out photos</p>
                                    <p className="text-sm text-slate-600">Find everything you have. Phone photos, emails with attachments, inventory reports.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Check when and how your records were created</p>
                                    <p className="text-sm text-slate-600">Look at file metadata. Note dates clearly. Gaps in coverage matter.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Organise your documents and key dates</p>
                                    <p className="text-sm text-slate-600">Lease dates, deposit amount, correspondence about the dispute.</p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
                                <div>
                                    <p className="font-semibold text-slate-900">Avoid altering or re-uploading old files</p>
                                    <p className="text-sm text-slate-600">Re-saving a photo changes its metadata. Keep originals.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How RentVault Helps */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How RentVault Helps</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault is a tool for organising rental documentation. Here's what it does:
                        </p>
                        <div className="space-y-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Camera size={20} className="text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Stores photos and documents in one place</h3>
                                    <p className="text-sm text-slate-600">
                                        Organised by room and phase (check-in, handover). Easy to find months later.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Lock size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Applies system timestamps when evidence is sealed</h3>
                                    <p className="text-sm text-slate-600">
                                        When you complete a phase, records are locked with a timestamp. You can't backdate or edit.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <CheckCircle size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Keeps records unchanged after completion</h3>
                                    <p className="text-sm text-slate-600">
                                        Sealed evidence is immutable. What you uploaded is what stays.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex gap-4 items-start">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Generates a clear, shareable summary</h3>
                                    <p className="text-sm text-slate-600">
                                        Download a PDF report with all photos, timestamps, and property details in one document.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center mb-12">
                        <h3 className="text-xl font-bold text-white mb-3">Start organising your records</h3>
                        <p className="text-slate-300 mb-6">Free to organise. Pay only if you need official exports.</p>
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

                    {/* FAQ */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Common Questions</h2>
                        <div className="space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <HelpCircle size={20} className="text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Can I use this if I already moved out?</h3>
                                    <p className="text-sm text-slate-600">
                                        Yes. You can upload existing photos and documents.
                                        However, records uploaded later will have later timestamps.
                                        Evidence is stronger when created at the time.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <HelpCircle size={20} className="text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">What if my landlord took their own photos?</h3>
                                    <p className="text-sm text-slate-600">
                                        Having your own independent record is valuable.
                                        When both parties have photos, disputes often come down to timing, clarity, and completeness.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <HelpCircle size={20} className="text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-slate-900 mb-1">Do landlords get access to my files?</h3>
                                    <p className="text-sm text-slate-600">
                                        No. Your RentVault account is private.
                                        You choose what to share and when.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Closing CTA */}
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                        <p className="text-slate-700 mb-4">
                            If you're dealing with this right now, organising your records early can make a real difference.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                        >
                            Start free with RentVault
                            <ArrowRight size={18} />
                        </Link>
                    </div>

                </div>
            </section>

            {/* Related guides */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/guides/move-in-checklist-tenant" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Camera size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Move-in checklist for tenants</span>
                            </div>
                        </Link>
                        <Link href="/guides/move-out-checklist" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <FileText size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Move-out checklist</span>
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
