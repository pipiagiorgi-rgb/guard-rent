import { Metadata } from 'next'
import Link from 'next/link'
import { Clock, ArrowRight, AlertCircle } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Understanding Rental Notice Periods | RentVault',
    description: 'Learn about rental notice periods, how they work, and how to avoid missing important deadlines. A guide for tenants on termination notices and timing.',
    openGraph: {
        title: 'Understanding Rental Notice Periods',
        description: 'What tenants need to know about rental termination notices and timing.',
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

                <section className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <AlertCircle className="text-amber-600" size={24} />
                        <h2 className="text-xl font-semibold text-amber-900">Don't miss your deadline</h2>
                    </div>
                    <p className="text-amber-800 mb-4">
                        Many tenants forget about notice periods until it's too late. A 3-month notice period
                        means you need to decide to leave 3 months before you actually want to move out.
                    </p>
                    <p className="text-amber-800">
                        Set reminders for yourself — or use a tool that tracks your lease dates automatically.
                    </p>
                </section>

                <section className="bg-slate-50 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Clock className="text-slate-700" size={24} />
                        <h2 className="text-xl font-semibold">How RentVault helps</h2>
                    </div>
                    <p className="text-slate-600 mb-4">
                        RentVault can extract your notice period from your lease and remind you before key deadlines.
                        Choose when you want to be notified — 30, 60, or 90 days in advance.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline"
                    >
                        Set up deadline reminders <ArrowRight size={16} />
                    </Link>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Related guides</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/guides/deposit-protection" className="text-slate-600 hover:text-slate-900">
                                → How to protect your rental deposit
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/renting-abroad" className="text-slate-600 hover:text-slate-900">
                                → Tips for tenants renting abroad
                            </Link>
                        </li>
                    </ul>
                </section>
            </article>
        </main>
    )
}
