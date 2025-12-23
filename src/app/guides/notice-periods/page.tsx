import { Metadata } from 'next'
import Link from 'next/link'
import { Clock, Folder, Calendar, Lightbulb, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Understanding Rental Notice Periods | RentVault',
    description: 'Learn about rental notice periods, how they work, and how to avoid missing important deadlines. Essential guide for tenants on termination notices, timing, and avoiding extra rent payments.',
    keywords: 'rental notice period, termination notice, lease termination, tenant notice, rental deadline',
    openGraph: {
        title: 'Understanding Rental Notice Periods | RentVault',
        description: 'Missing a notice deadline can cost you months of extra rent. Here\'s what every tenant needs to know.',
    },
}

export default function NoticePeriodsGuide() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            <article className="prose prose-slate max-w-none">
                <header className="mb-10">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link href="/guides" className="hover:text-slate-900">Guides</Link>
                        <span>/</span>
                        <span>Notice Periods</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Understanding rental notice periods
                    </h1>
                    <p className="text-lg text-slate-600">
                        Missing a notice deadline can cost you months of extra rent. Here's what you need to know.
                    </p>
                </header>

                {/* Why This Matters */}
                <section className="mb-10 bg-slate-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Calendar size={20} className="text-slate-600" />
                        Why this matters
                    </h2>
                    <p className="text-slate-600 mb-3">
                        Many tenants only think about notice periods when they're ready to move — by which point
                        it's often too late. A 3-month notice period means you need to decide to leave 3 months before
                        you actually want to move out.
                    </p>
                    <p className="text-slate-600">
                        Missing your deadline by even a single day can legally obligate you to pay rent for another
                        full month (or more). This isn't about landlords being unreasonable — it's simply how contracts work.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">What is a notice period?</h2>
                    <p className="text-slate-600 mb-4">
                        A notice period is the amount of advance warning you must give your landlord before ending
                        your tenancy. It's specified in your lease and often required by law.
                    </p>
                    <p className="text-slate-600">
                        If you don't give proper notice in time, you may be legally required to pay rent for
                        additional months — even if you've already moved out.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Common notice period lengths</h2>
                    <p className="text-slate-600 mb-4">
                        Notice periods vary by country and contract type. Here are some typical examples:
                    </p>
                    <div className="bg-slate-50 rounded-xl p-6">
                        <ul className="space-y-3 text-slate-600">
                            <li><strong>1 month</strong> — Common in the UK and some US states for month-to-month leases</li>
                            <li><strong>2 months</strong> — Standard in many UK assured shorthold tenancies</li>
                            <li><strong>3 months</strong> — Common in Germany, France, and other European countries</li>
                            <li><strong>Fixed term</strong> — Some leases don't allow early termination; you're committed until the end date</li>
                        </ul>
                    </div>
                    <p className="text-sm text-slate-500 mt-4">
                        Always check your specific lease. Notice periods can vary even within the same country.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">How to calculate your deadline</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-medium mb-2">Step 1: Find your notice period</h3>
                            <p className="text-slate-600 text-sm">
                                Look in your lease for the termination or cancellation section. It should state
                                how much notice is required (e.g., "60 days" or "two calendar months").
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Step 2: Understand how it's counted</h3>
                            <p className="text-slate-600 text-sm">
                                Some contracts count from the day you give notice. Others count from the first
                                of the following month. Check the exact wording carefully.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-2">Step 3: Mark your calendar</h3>
                            <p className="text-slate-600 text-sm">
                                Once you know your deadline, set a reminder well in advance. It's better to
                                give notice early than to miss the deadline by a day.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Pro Tips Section */}
                <section className="mb-10 bg-gradient-to-br from-blue-50 to-slate-50 rounded-xl p-6 border border-blue-100">
                    <div className="flex items-center gap-2 mb-4">
                        <Lightbulb size={20} className="text-blue-600" />
                        <h2 className="text-xl font-semibold text-blue-900">Pro tips from experienced renters</h2>
                    </div>
                    <div className="space-y-3 text-slate-700">
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Send notice by registered mail AND email</strong> — This gives you proof of delivery date
                                that's hard to dispute.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>"Calendar months" often means end-of-month</strong> — In many countries,
                                a 3-month notice given on March 15th means you leave June 30th, not June 15th.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Set a reminder 4+ months before you might want to leave</strong> — This gives you
                                time to decide without rushing.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Keep your notice confirmation forever</strong> — Landlords sometimes claim they
                                never received it. Having proof protects you.</span>
                        </p>
                    </div>
                </section>

                {/* Softened note */}
                <section className="bg-slate-100 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="text-slate-600" size={22} />
                        <h2 className="text-xl font-semibold">A note on timing</h2>
                    </div>
                    <p className="text-slate-600 mb-3">
                        The tricky thing about notice periods is that you need to think about them before you're
                        ready to move. If you wait until you've found a new place, you may already be past your deadline.
                    </p>
                    <p className="text-slate-600">
                        Setting a reminder — whether in your calendar, phone, or a rental tracking tool — ensures
                        you have time to make decisions without being rushed.
                    </p>
                </section>

                {/* Soft RentVault Relevance */}
                <section className="bg-slate-50 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Folder className="text-slate-600" size={22} />
                        <h2 className="text-xl font-semibold">Tracking important dates</h2>
                    </div>
                    <p className="text-slate-600 mb-3">
                        The challenge isn't just knowing your notice period — it's remembering to act on it at the right time.
                        Most tenants know their deadline exists somewhere in their contract, but don't have it written down
                        anywhere visible.
                    </p>
                    <p className="text-slate-600">
                        Tools like RentVault can extract key dates from your lease and send reminders before deadlines.
                        But even a simple calendar reminder set when you move in is better than nothing.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Related guides</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/guides/deposit-protection" className="text-slate-600 hover:text-slate-900">
                                → How to protect your rental deposit
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/move-in-photos" className="text-slate-600 hover:text-slate-900">
                                → Why move-in photos matter
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/renting-abroad" className="text-slate-600 hover:text-slate-900">
                                → Tips for tenants renting abroad
                            </Link>
                        </li>
                    </ul>
                </section>

                {/* CTA Section */}
                <section className="bg-slate-900 text-white rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Never miss an important deadline</h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        RentVault extracts key dates from your lease and reminds you before deadlines. Free to start.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                    >
                        Get started for free
                        <ArrowRight size={18} />
                    </Link>
                </section>
            </article>
        </main>
    )
}
