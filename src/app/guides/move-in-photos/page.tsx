import { Metadata } from 'next'
import Link from 'next/link'
import { Camera, Folder, ImageIcon, Lightbulb, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Why Move-in Photos Matter | RentVault',
    description: 'Learn why taking photos when you move into a rental is essential for protecting your deposit. Professional tips on what to photograph, how to organise evidence, and avoiding costly disputes.',
    keywords: 'move-in photos, rental documentation, deposit protection, tenant evidence, property condition report',
    openGraph: {
        title: 'Why Move-in Photos Matter | RentVault',
        description: 'The 20 minutes you spend photographing your new apartment could save you hundreds when you move out.',
    },
}

export default function MoveInPhotosGuide() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            <article className="prose prose-slate max-w-none">
                <header className="mb-10">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                        <Link href="/guides" className="hover:text-slate-900">Guides</Link>
                        <span>/</span>
                        <span>Move-in Photos</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Why move-in photos matter
                    </h1>
                    <p className="text-lg text-slate-600">
                        The photos you take on day one could save you hundreds when you move out.
                    </p>
                </header>

                {/* Why This Matters */}
                <section className="mb-10 bg-slate-50 rounded-xl p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <ImageIcon size={20} className="text-slate-600" />
                        Why this matters
                    </h2>
                    <p className="text-slate-600 mb-3">
                        Most tenants who lose part of their deposit didn't damage anything. They simply couldn't prove
                        the damage was already there. Without move-in photos, there's no evidence that the scratched floor
                        or marked walls existed before you arrived.
                    </p>
                    <p className="text-slate-600">
                        Taking 20 minutes on your first day to photograph everything can save you hours of frustration
                        and potentially hundreds of euros when you move out.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">The problem with memory</h2>
                    <p className="text-slate-600 mb-4">
                        When you sign a lease, you're usually focused on the excitement of a new place, not the small
                        scratch on the kitchen counter or the scuff mark behind the door. But months or years later,
                        when you're moving out, those details matter.
                    </p>
                    <p className="text-slate-600">
                        Without photos, you can't prove that damage existed before you moved in. And landlords may
                        deduct repair costs from your deposit for issues you didn't cause.
                    </p>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">What to photograph</h2>
                    <p className="text-slate-600 mb-4">
                        Be thorough. It takes 15–20 minutes on move-in day and can save you significant money later.
                    </p>
                    <ul className="space-y-2 text-slate-600">
                        <li>• <strong>Every room</strong>: Wide shots showing the overall condition</li>
                        <li>• <strong>Walls and floors</strong>: Capture any marks, stains, or damage</li>
                        <li>• <strong>Appliances</strong>: Fridge, oven, washing machine, dishwasher</li>
                        <li>• <strong>Bathroom fixtures</strong>: Tiles, grout, toilet, shower</li>
                        <li>• <strong>Windows and doors</strong>: Check for cracks or damage</li>
                        <li>• <strong>Existing damage</strong>: Close-ups of scratches, dents, or broken items</li>
                        <li>• <strong>Meter readings</strong>: Electricity, gas, and water</li>
                    </ul>
                </section>

                <section className="mb-10">
                    <h2 className="text-xl font-semibold mb-4">Tips for better documentation</h2>
                    <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                        <div>
                            <h3 className="font-medium mb-1">Use natural light</h3>
                            <p className="text-slate-600 text-sm">
                                Take photos during the day when possible. Damage is easier to see in good lighting.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">Keep timestamps enabled</h3>
                            <p className="text-slate-600 text-sm">
                                Your phone automatically records when photos were taken. This metadata is valuable evidence.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">Organise by room</h3>
                            <p className="text-slate-600 text-sm">
                                Sort your photos into folders or use an app that organises them for you.
                                This makes comparison easier when you move out.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-medium mb-1">Back up your photos</h3>
                            <p className="text-slate-600 text-sm">
                                Don't rely on your phone alone. Upload photos to cloud storage or a dedicated service.
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
                            <span><strong>Email yourself the photos</strong>. This creates a third-party timestamp that's hard to dispute.
                                Subject line: "Move-in photos [address] [date]"</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Include a newspaper or phone screen showing today's date</strong>. Old-school but effective
                                for proving when photos were taken.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Don't just photograph damage; photograph clean, good condition too</strong>. This proves you
                                received the property in good shape and returned it the same way.</span>
                        </p>
                        <p className="flex items-start gap-2">
                            <span className="text-blue-500 font-bold">→</span>
                            <span><strong>Take photos before AND after cleaning</strong>. If you clean on move-in day,
                                photograph the original state first.</span>
                        </p>
                    </div>
                </section>

                {/* Soft RentVault Relevance */}
                <section className="bg-slate-50 rounded-xl p-6 mb-10">
                    <div className="flex items-center gap-3 mb-4">
                        <Folder className="text-slate-600" size={22} />
                        <h2 className="text-xl font-semibold">Keeping photos organised</h2>
                    </div>
                    <p className="text-slate-600 mb-3">
                        Taking photos is only half the battle. Finding them 12 months later is the other half.
                        Many tenants take dozens of move-in photos, then lose them in their camera roll or forget
                        which folder they saved them to.
                    </p>
                    <p className="text-slate-600">
                        Tools like RentVault let you upload photos organised by room, with automatic timestamp tracking.
                        But whatever system you use, the key is to store your photos somewhere you can reliably access later.
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

                {/* CTA Section */}
                <section className="bg-slate-900 text-white rounded-xl p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Ready to protect your deposit?</h2>
                    <p className="text-slate-300 mb-6 max-w-md mx-auto">
                        Start documenting your rental today. It's free to try, no credit card required.
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
