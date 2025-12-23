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
            <main className="max-w-[700px] mx-auto px-4 md:px-6 py-12 md:py-16">
                <article>
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-8"
                    >
                        <ArrowLeft size={16} />
                        Back to Blog
                    </Link>

                    <header className="mb-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                Documentation
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
                            The Complete Move-In Photo Checklist
                        </h1>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar size={14} />
                                10 Dec 2024
                            </span>
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                6 min read
                            </span>
                        </div>
                    </header>

                    <div className="prose prose-slate max-w-none">
                        <p className="text-lg text-slate-600 leading-relaxed">
                            Taking 20 minutes to photograph your rental on move-in day could save you
                            hundreds when you leave. Here's exactly what to capture, room by room.
                        </p>

                        <div className="bg-green-50 border border-green-200 rounded-xl p-6 my-8">
                            <div className="flex items-start gap-3">
                                <Camera className="text-green-600 flex-shrink-0 mt-1" size={20} />
                                <div>
                                    <h3 className="font-semibold text-green-900 mb-1">Before You Start</h3>
                                    <p className="text-green-800 text-sm m-0">
                                        Take photos before any furniture arrives. Good lighting is essential.
                                        Open all blinds and turn on lights. Email photos to yourself immediately
                                        to create a timestamped backup.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <h2>General Tips for Every Room</h2>
                        <ul>
                            <li>Take at least 4 photos per room (one from each corner)</li>
                            <li>Photograph floors, walls, ceilings, and windows</li>
                            <li>Get close-ups of any existing damage</li>
                            <li>Include a wide shot showing the overall condition</li>
                            <li>Check that photos are in focus before moving on</li>
                        </ul>

                        <h2>Living Room / Main Rooms</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
                            <ul className="space-y-2 m-0">
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> All walls (check for marks, holes, scuffs)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Floor condition (scratches, stains, wear)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Windows and frames
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Light fixtures and switches
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Radiators or heating units
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Power sockets
                                </li>
                            </ul>
                        </div>

                        <h2>Kitchen</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
                            <ul className="space-y-2 m-0">
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Countertops (scratches, stains, burns)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Inside all cabinets and drawers
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Oven interior and stovetop
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Inside fridge and freezer
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Sink and taps (rust, stains)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Extractor fan and hood
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Dishwasher interior (if applicable)
                                </li>
                            </ul>
                        </div>

                        <h2>Bathroom</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
                            <ul className="space-y-2 m-0">
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Toilet (bowl, seat, tank)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Bath/shower (grout, sealant, tiles)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Sink and taps
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Mirror and cabinet interiors
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Tiles and grouting (mould, cracks)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Extractor fan
                                </li>
                            </ul>
                        </div>

                        <h2>Bedroom</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
                            <ul className="space-y-2 m-0">
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Wardrobes (inside and out)
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Floor under where bed will go
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Walls behind furniture areas
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Windows and blinds/curtains
                                </li>
                            </ul>
                        </div>

                        <h2>Utilities & Outside</h2>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 my-4">
                            <ul className="space-y-2 m-0">
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Electric meter reading
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Gas meter reading
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Water meter reading
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Fuse box / electrical panel
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Boiler settings and condition
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Front door and locks
                                </li>
                                <li className="flex items-center gap-2 text-slate-700">
                                    <span className="text-slate-400">□</span> Balcony or garden (if applicable)
                                </li>
                            </ul>
                        </div>

                        <h2>Don't Forget</h2>
                        <ul>
                            <li>Photograph any existing damage, no matter how small</li>
                            <li>Take a photo with a newspaper or phone screen showing the date</li>
                            <li>Email all photos to yourself and your landlord</li>
                            <li>Store backups in at least two places</li>
                        </ul>
                    </div>

                    {/* CTA */}
                    <div className="mt-12 p-6 bg-slate-900 text-white rounded-xl text-center">
                        <h3 className="text-xl font-bold mb-2">Organize your move-in photos automatically</h3>
                        <p className="text-slate-300 mb-4">
                            RentVault lets you upload photos by room with automatic timestamps.
                        </p>
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-colors"
                        >
                            Try it free
                            <ArrowRight size={16} />
                        </Link>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <h3 className="text-lg font-semibold mb-4">Related Articles</h3>
                        <div className="space-y-3">
                            <Link
                                href="/blog/protect-deposit-before-moving-in"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">5 Things to Do Before Moving In</span>
                                <span className="text-slate-500 text-sm block mt-1">Essential first-day tasks</span>
                            </Link>
                            <Link
                                href="/guides/move-in-photos"
                                className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                                <span className="text-slate-900 font-medium">Why Move-In Photos Matter</span>
                                <span className="text-slate-500 text-sm block mt-1">The complete guide</span>
                            </Link>
                        </div>
                    </div>
                </article>
            </main>
        </>
    )
}
