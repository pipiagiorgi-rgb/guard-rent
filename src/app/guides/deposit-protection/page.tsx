import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Check, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'How to Protect Your Rental Deposit | RentVault',
    description: 'Learn how to protect your rental deposit with proper documentation. Tips for tenants on move-in photos, contract review, and avoiding deposit disputes.',
    openGraph: {
        title: 'How to Protect Your Rental Deposit',
        description: 'Tips for tenants on avoiding deposit disputes with proper documentation.',
    },
}

export default function DepositProtectionGuide() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            <article className="prose prose-slate max-w-none">
                <header className="mb-10">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link href="/guides" className="hover:text-slate-900">Guides</Link>
                        <span>/</span>
                        <span>Deposit Protection</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        How to protect your rental deposit
                    </h1>
                    <p className="text-lg text-slate-600">
                        Simple steps every tenant can take to avoid deposit disputes and keep their money.
                    </p>
                </header>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Why deposit disputes happen</h2>
                    <p className="text-slate-600 mb-4">
                        Most deposit disputes come down to one thing: proof. When you move out, landlords may claim
                        damage or poor condition — but without documentation from when you moved in, it's your word against theirs.
                    </p>
                    <p className="text-slate-600">
                        The good news is that protecting yourself is straightforward. With a few simple habits at the
                        start and end of your tenancy, you can significantly reduce the risk of losing money unfairly.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">5 steps to protect your deposit</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">1. Document the apartment on move-in day</h3>
                                <p className="text-slate-600 text-sm">
                                    Take photos of every room before you unpack. Capture walls, floors, appliances,
                                    and any existing damage. Timestamps on photos serve as evidence.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">2. Read your lease carefully</h3>
                                <p className="text-slate-600 text-sm">
                                    Know what's expected of you. Check for cleaning requirements, notice periods,
                                    and any special conditions about the deposit.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">3. Record meter readings</h3>
                                <p className="text-slate-600 text-sm">
                                    Document electricity, gas, and water meter readings when you move in and out.
                                    This prevents disputes about utility bills.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">4. Keep everything organised</h3>
                                <p className="text-slate-600 text-sm">
                                    Store your lease, photos, and correspondence in one place. When disputes arise,
                                    you'll be glad you can find everything quickly.
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Check size={18} className="text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-medium mb-1">5. Document again before handover</h3>
                                <p className="text-slate-600 text-sm">
                                    Take move-out photos showing the apartment's condition when you leave.
                                    Compare with your move-in photos to show you've maintained the property.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-50 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Shield className="text-slate-700" size={24} />
                        <h2 className="text-xl font-semibold">How RentVault helps</h2>
                    </div>
                    <p className="text-slate-600 mb-4">
                        RentVault is a simple tool for tenants to store rental documentation in one secure place.
                        Upload your lease, take room-by-room photos, and set reminders for important dates.
                    </p>
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-slate-900 font-medium hover:underline"
                    >
                        Get started for free <ArrowRight size={16} />
                    </Link>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-4">Further reading</h2>
                    <ul className="space-y-2">
                        <li>
                            <Link href="/guides/move-in-photos" className="text-slate-600 hover:text-slate-900">
                                → Why move-in photos matter
                            </Link>
                        </li>
                        <li>
                            <Link href="/guides/notice-periods" className="text-slate-600 hover:text-slate-900">
                                → Understanding rental notice periods
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
