import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Camera, CheckSquare, Home, Key, Lightbulb, FileText } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { Logo } from '@/components/brand/Logo'
import { ScrollToTop } from '@/components/ui/ScrollToTop'

export const metadata: Metadata = {
    title: 'Move-In Checklist for Tenants | What to Document on Day One | RentVault',
    description: 'A practical move-in checklist for tenants. Learn what to photograph, record, and keep from day one to avoid deposit disputes later.',
    alternates: {
        canonical: 'https://rentvault.co/guides/move-in-checklist-tenant'
    }
}

export default function MoveInChecklistGuide() {
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: 'Move-In Checklist for Tenants: What to Document on Day One',
        description: 'A practical move-in checklist for tenants. Learn what to photograph, record, and keep from day one.',
        datePublished: '2025-01-01',
        dateModified: '2025-01-01',
        author: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        publisher: { '@type': 'Organization', name: 'RentVault', url: 'https://rentvault.co' },
        mainEntityOfPage: 'https://rentvault.co/guides/move-in-checklist-tenant'
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://rentvault.co' },
            { '@type': 'ListItem', position: 2, name: 'Guides', item: 'https://rentvault.co/guides' },
            { '@type': 'ListItem', position: 3, name: 'Move-In Checklist', item: 'https://rentvault.co/guides/move-in-checklist-tenant' }
        ]
    }

    const rooms = [
        { name: 'Living areas', items: ['Floors — scratches, stains, damage', 'Walls — marks, holes, paint condition', 'Windows — cracks, locks working', 'Ceilings — stains, cracks'] },
        { name: 'Kitchen', items: ['Appliances — fridge, oven, microwave, dishwasher', 'Cabinets — condition, handles', 'Countertops — chips, stains', 'Sink and taps — leaks, drains'] },
        { name: 'Bathroom', items: ['Toilet — condition, flush working', 'Shower/bath — tiles, grout, leaks', 'Sink and mirror — chips, stains', 'Ventilation — fan working'] },
        { name: 'Bedrooms', items: ['Floors and walls', 'Wardrobes — doors, rails', 'Windows and blinds', 'Light fixtures'] },
    ]

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
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                            <CheckSquare className="text-green-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Move-In Checklist for Tenants: What to Record on Day One
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        The day you get the keys is the most important day for protecting your deposit.
                        What you document now determines what you can prove later.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* Why the First Day Matters */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why the First Day Matters</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Most deposit disputes are about condition when you moved in.
                            Did that scratch exist? Was the oven already stained? Was the wall already marked?
                        </p>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            The problem? Memory fades. Photos get lost in your camera roll. And by the time you move out — which could be a year or more later — you can't remember what was already there.
                        </p>
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                            <div className="flex gap-3 items-start">
                                <Lightbulb size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                <p className="text-blue-800 text-sm">
                                    <strong>Key point:</strong> Evidence created on day one, before any dispute exists, is more credible than evidence gathered after problems arise.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What to Photograph */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What to Photograph When You Move In</h2>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            Go room by room. Take more photos than you think you need. Cover every angle.
                        </p>

                        <div className="space-y-6">
                            {rooms.map((room, index) => (
                                <div key={index} className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                    <div className="flex items-center gap-3 mb-3">
                                        <Home size={20} className="text-slate-500" />
                                        <h3 className="font-semibold text-slate-900">{room.name}</h3>
                                    </div>
                                    <ul className="space-y-2 ml-8">
                                        {room.items.map((item, itemIndex) => (
                                            <li key={itemIndex} className="text-sm text-slate-600 flex items-start gap-2">
                                                <span className="text-slate-400">•</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <div className="flex gap-3 items-start">
                                <Camera size={20} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-amber-800 text-sm">
                                    <strong>Photo tip:</strong> Take photos from multiple angles. Get close-ups of any existing damage, marks, or wear. Include wide shots that show context.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Other Things to Record */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Other Things to Record</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Beyond photos, there are key documents and details to capture:
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold">⚡</div>
                                    <h3 className="font-semibold text-slate-900">Meter readings</h3>
                                </div>
                                <p className="text-sm text-slate-600">Electricity, gas, water. Photograph the meters with readings visible.</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <Key size={20} className="text-slate-500" />
                                    <h3 className="font-semibold text-slate-900">Keys received</h3>
                                </div>
                                <p className="text-sm text-slate-600">How many keys, fobs, or access cards? Note the count.</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-sm font-bold">💰</div>
                                    <h3 className="font-semibold text-slate-900">Deposit confirmation</h3>
                                </div>
                                <p className="text-sm text-slate-600">Amount paid, where it's held, reference number.</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                                <div className="flex items-center gap-3 mb-2">
                                    <FileText size={20} className="text-slate-500" />
                                    <h3 className="font-semibold text-slate-900">Lease details</h3>
                                </div>
                                <p className="text-sm text-slate-600">Start date, end date, notice period, landlord contact.</p>
                            </div>
                        </div>
                    </div>

                    {/* How to Keep Everything Organised */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to Keep Everything Organised</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            Here's the problem most tenants face:
                        </p>
                        <ul className="space-y-2 text-slate-700 mb-6">
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>Photos scattered across phone galleries, cloud backups, and old devices</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>Documents buried in email threads from months ago</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-400 mt-1">✗</span>
                                <span>No clear timeline or organisation</span>
                            </li>
                        </ul>
                        <p className="text-slate-700 leading-relaxed mb-6">
                            RentVault solves this by giving you one place for everything:
                        </p>
                        <ul className="space-y-2 text-slate-700">
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Photos and documents in one location, organised by rental</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Room-by-room structure so nothing gets lost</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-green-500 mt-1">✓</span>
                                <span>Easy to find months later when you need it</span>
                            </li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center mb-12">
                        <h3 className="text-xl font-bold text-white mb-3">Document your move-in in minutes</h3>
                        <p className="text-slate-300 mb-6">Upload photos and documents for free. Organise everything in one place.</p>
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

                    {/* Quick Checklist Summary */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Move-In Checklist (Quick Summary)</h2>
                        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                            <ul className="space-y-3 text-slate-700">
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Photograph every room — floors, walls, ceilings, windows</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Close-ups of any existing damage or wear</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Photograph all appliances — inside and out</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Record meter readings (photo + numbers)</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Count and note keys/fobs received</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Keep deposit confirmation and lease details</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckSquare size={18} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span>Store everything in one organised place</span>
                                </li>
                            </ul>
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
                                <FileText size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Landlord not returning deposit</span>
                            </div>
                        </Link>
                        <Link href="/guides/move-out-checklist" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <CheckSquare size={20} className="text-slate-400" />
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
