import { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Clock, ArrowLeft, ArrowRight, Camera, Check } from 'lucide-react'
import { ArticleSchema, BreadcrumbSchema } from '@/lib/seo-schemas'

export const metadata: Metadata = {
    title: 'The Complete Move-In Photo Checklist | RentVault Blog',
    description: 'A room-by-room guide to documenting your rental property. Print this checklist and use it on your first day to protect your deposit.',
    keywords: 'move-in photos checklist, rental documentation, property photos, deposit evidence, tenant checklist',
    openGraph: {
        title: 'The Complete Move-In Photo Checklist',
        description: 'Room-by-room guide to photographing your rental. Print and use on move-in day.',
        type: 'article',
    },
    alternates: {
        canonical: 'https://rentvault.ai/blog/move-in-photo-checklist',
    },
}

const ChecklistSection = ({ title, items }: { title: string; items: string[] }) => (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <ul className="p-5 space-y-3">
            {items.map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-600">
                    <span className="w-5 h-5 border-2 border-slate-300 rounded flex-shrink-0"></span>
                    <span className="text-sm">{item}</span>
                </li>
            ))}
        </ul>
    </div>
)

export default function BlogPost() {
    return (
        <>
            <ArticleSchema
                headline="The Complete Move-In Photo Checklist"
                description="A room-by-room guide to documenting your rental property on move-in day."
                url="https://rentvault.ai/blog/move-in-photo-checklist"
                datePublished="2024-12-10"
            />
            <BreadcrumbSchema
                items={[
                    { name: 'Home', url: 'https://rentvault.ai' },
                    { name: 'Blog', url: 'https://rentvault.ai/blog' },
                    { name: 'Move-In Photo Checklist', url: 'https://rentvault.ai/blog/move-in-photo-checklist' },
                ]}
            />
            <main className="max-w-[680px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8 transition-colors"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    <header className="mb-12">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-semibold rounded-full uppercase tracking-wide">
                                Documentation
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-5 leading-[1.2] text-slate-900">
                            The Complete Move-In Photo Checklist
                        </h1>
                        <div className="flex items-center gap-5 text-sm text-slate-500">
                            <span className="flex items-center gap-2">
                                <Calendar size={15} className="text-slate-400" />
                                10 Dec 2024
                            </span>
                            <span className="flex items-center gap-2">
                                <Clock size={15} className="text-slate-400" />
                                6 min read
                            </span>
                        </div>
                    </header>

                    <div className="space-y-8">
                        <p className="text-xl text-slate-600 leading-relaxed font-light">
                            Taking 20 minutes to photograph your rental on move-in day could save you
                            hundreds when you leave. Here's exactly what to capture, room by room.
                        </p>

                        {/* Pro tip box */}
                        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Camera className="text-green-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-green-900 mb-2">Before You Start</h3>
                                    <p className="text-green-800 text-sm leading-relaxed">
                                        Take photos before any furniture arrives. Good lighting is essential.
                                        Open all blinds and turn on lights. Email photos to yourself immediately
                                        to create a timestamped backup.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* General Tips */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-bold text-slate-900 pt-4">General Tips for Every Room</h2>
                            <ul className="space-y-3 pl-1">
                                {[
                                    'Take at least 4 photos per room (one from each corner)',
                                    'Photograph floors, walls, ceilings, and windows',
                                    'Get close-ups of any existing damage',
                                    'Include a wide shot showing the overall condition',
                                    'Check that photos are in focus before moving on'
                                ].map((item, i) => (
                                    <li key={i} className="flex items-start gap-3 text-slate-600">
                                        <Check size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Room Checklists */}
                        <div className="space-y-5 pt-4">
                            <h2 className="text-2xl font-bold text-slate-900">Room-by-Room Checklists</h2>

                            <ChecklistSection
                                title="🛋️ Living Room / Main Rooms"
                                items={[
                                    'All walls (check for marks, holes, scuffs)',
                                    'Floor condition (scratches, stains, wear)',
                                    'Windows and frames',
                                    'Light fixtures and switches',
                                    'Radiators or heating units',
                                    'Power sockets'
                                ]}
                            />

                            <ChecklistSection
                                title="🍳 Kitchen"
                                items={[
                                    'Countertops (scratches, stains, burns)',
                                    'Inside all cabinets and drawers',
                                    'Oven interior and stovetop',
                                    'Inside fridge and freezer',
                                    'Sink and taps (rust, stains)',
                                    'Extractor fan and hood',
                                    'Dishwasher interior (if applicable)'
                                ]}
                            />

                            <ChecklistSection
                                title="🚿 Bathroom"
                                items={[
                                    'Toilet (bowl, seat, tank)',
                                    'Bath/shower (grout, sealant, tiles)',
                                    'Sink and taps',
                                    'Mirror and cabinet interiors',
                                    'Tiles and grouting (mould, cracks)',
                                    'Extractor fan'
                                ]}
                            />

                            <ChecklistSection
                                title="🛏️ Bedroom"
                                items={[
                                    'Wardrobes (inside and out)',
                                    'Floor under where bed will go',
                                    'Walls behind furniture areas',
                                    'Windows and blinds/curtains'
                                ]}
                            />

                            <ChecklistSection
                                title="⚡ Utilities & Outside"
                                items={[
                                    'Electric meter reading',
                                    'Gas meter reading',
                                    'Water meter reading',
                                    'Fuse box / electrical panel',
                                    'Boiler settings and condition',
                                    'Front door and locks',
                                    'Balcony or garden (if applicable)'
                                ]}
                            />
                        </div>

                        {/* Final reminders */}
                        <section className="space-y-4 pt-4">
                            <h2 className="text-2xl font-bold text-slate-900">Don't Forget</h2>
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                                <ul className="space-y-2 text-blue-800 text-sm">
                                    <li>📸 Photograph any existing damage, no matter how small</li>
                                    <li>📰 Take a photo with a newspaper or phone screen showing the date</li>
                                    <li>📧 Email all photos to yourself and your landlord</li>
                                    <li>💾 Store backups in at least two places</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* CTA */}
                    <div className="mt-14 p-8 bg-slate-900 text-white rounded-2xl text-center">
                        <h3 className="text-xl font-bold mb-3">Organize your move-in photos automatically</h3>
                        <p className="text-slate-300 mb-5 max-w-md mx-auto">
                            RentVault lets you upload photos by room with automatic timestamps.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-900 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Try it free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="mt-14 pt-10 border-t border-slate-200">
                        <h3 className="text-lg font-bold mb-5 text-slate-900">Related Articles</h3>
                        <div className="space-y-4">
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1.5">Essential first-day tasks</span>
                            </Link>
                            <Link
                                href="/guides/move-in-photos"
                                className="block p-5 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors group"
                            >
                                <span className="text-slate-900 font-semibold group-hover:text-blue-600 transition-colors">Why Move-In Photos Matter</span>
                                <span className="text-slate-500 text-sm block mt-1.5">The complete guide</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
