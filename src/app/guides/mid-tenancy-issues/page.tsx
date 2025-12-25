import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, AlertCircle, Camera, Shield, Clock } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Mid-Tenancy Issues Guide | RentVault',
    description: 'How to document problems and damage during your tenancy. Build a timeline of evidence for Belgium, France, and Luxembourg rentals.',
    alternates: {
        canonical: 'https://rentvault.ai/guides/mid-tenancy-issues'
    }
}

export default function MidTenancyIssuesGuide() {
    return (
        <div className="min-h-screen bg-white">
            {/* Hero */}
            <section className="pt-20 pb-12 px-4 md:px-6 bg-gradient-to-b from-slate-50 to-white">
                <div className="max-w-[800px] mx-auto">
                    <Link
                        href="/guides"
                        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 mb-8 text-sm"
                    >
                        <ArrowLeft size={16} />
                        All guides
                    </Link>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                            <AlertCircle className="text-red-600" size={24} />
                        </div>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                        Logging mid-tenancy issues
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl">
                        Problems don't just happen at move-in and move-out.
                        What you document during your tenancy can make the difference in a dispute.
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 px-4 md:px-6">
                <div className="max-w-[800px] mx-auto">

                    {/* Why It Matters */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">Why document issues as they happen?</h2>
                        <p className="text-slate-700 leading-relaxed mb-4">
                            When you move out and the landlord claims you damaged the heating system,
                            you need to prove it was already broken when you reported it 8 months ago.
                        </p>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                            <p className="text-amber-800 text-sm">
                                <strong>Common scenario:</strong> The shower leaked for months. You told the landlord verbally.
                                At move-out, they deduct €800 for water damage. Without written evidence, it's your word against theirs.
                            </p>
                        </div>
                    </div>

                    {/* What to Document */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">What to document</h2>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">Maintenance issues</h3>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    <li>• Broken appliances</li>
                                    <li>• Plumbing problems</li>
                                    <li>• Heating/cooling failures</li>
                                    <li>• Electrical issues</li>
                                    <li>• Lock or security problems</li>
                                </ul>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">Damage</h3>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    <li>• Water leaks and stains</li>
                                    <li>• Mold or damp</li>
                                    <li>• Cracks in walls or ceilings</li>
                                    <li>• Window or door damage</li>
                                    <li>• Flooring issues</li>
                                </ul>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">Safety concerns</h3>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    <li>• Fire safety issues</li>
                                    <li>• Gas leaks or smells</li>
                                    <li>• Security breaches</li>
                                    <li>• Structural concerns</li>
                                </ul>
                            </div>
                            <div className="border border-slate-200 rounded-xl p-5">
                                <h3 className="font-bold text-slate-900 mb-2">External factors</h3>
                                <ul className="text-sm text-slate-700 space-y-1">
                                    <li>• Pest infestations</li>
                                    <li>• Noise from construction</li>
                                    <li>• Common area issues</li>
                                    <li>• Building-wide problems</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* How to Document */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4">How to document properly</h2>
                        <div className="bg-slate-50 rounded-xl p-6">
                            <ol className="space-y-4">
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">Take photos and videos</span>
                                        <p className="text-sm text-slate-600 mt-1">Show the issue clearly. Include context (whole room, then close-up of the problem).</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">Write a description</span>
                                        <p className="text-sm text-slate-600 mt-1">What's the issue? When did you first notice it? How does it affect you?</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">Notify your landlord in writing</span>
                                        <p className="text-sm text-slate-600 mt-1">Email or registered letter. Keep a copy. Verbal reports are hard to prove later.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">4</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">Save their response</span>
                                        <p className="text-sm text-slate-600 mt-1">Whether they fix it, ignore it, or claim it's your fault — keep records.</p>
                                    </div>
                                </li>
                                <li className="flex gap-3">
                                    <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">5</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">Document resolution</span>
                                        <p className="text-sm text-slate-600 mt-1">When it's fixed, photograph the repair. This closes the loop on your evidence.</p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    </div>

                    {/* Country-specific */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Landlord obligations by country</h2>

                        <div className="space-y-4">
                            {/* Belgium */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇧🇪</span>
                                    <h3 className="font-bold text-slate-900">Belgium</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    Landlords must maintain the property in a habitable condition throughout the tenancy.
                                    Major repairs (roof, heating, plumbing) are typically the landlord's responsibility.
                                    Minor repairs due to normal wear are often the tenant's.
                                    Document issues and send a registered letter ("lettre recommandée") if they're not addressed.
                                </p>
                            </div>

                            {/* France */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇫🇷</span>
                                    <h3 className="font-bold text-slate-900">France</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    Under French law, landlords must provide a "logement décent" (decent housing) that meets minimum standards.
                                    Major repairs and maintenance of essential equipment are the landlord's responsibility.
                                    Tenants handle minor repairs ("réparations locatives").
                                    Send a formal notice by registered mail if issues aren't resolved within a reasonable time.
                                </p>
                            </div>

                            {/* Luxembourg */}
                            <div className="border border-slate-200 rounded-xl p-5">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-2xl">🇱🇺</span>
                                    <h3 className="font-bold text-slate-900">Luxembourg</h3>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">
                                    The landlord must ensure the property is in good repair and safe for habitation.
                                    Structural issues, major systems (heating, plumbing, electrical), and exterior maintenance are the landlord's responsibility.
                                    Always report issues promptly and in writing. If unresolved, you may contact the "Commission des Loyers" (Rent Commission).
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-slate-900 rounded-2xl p-8 text-center">
                        <h3 className="text-xl font-bold text-white mb-3">Keep a timeline of issues</h3>
                        <p className="text-slate-300 mb-6">RentVault's Issues log lets you document problems with photos, dates, and descriptions.</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/login"
                                className="px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                            >
                                Start now
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

                </div>
            </section>

            {/* Related guides */}
            <section className="py-12 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[800px] mx-auto">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Related guides</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        <Link href="/guides/deposit-protection" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Protecting your deposit</span>
                            </div>
                        </Link>
                        <Link href="/guides/move-in-photos" className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors">
                            <div className="flex items-center gap-3">
                                <Camera size={20} className="text-slate-400" />
                                <span className="font-medium text-slate-900">Why move-in photos matter</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
