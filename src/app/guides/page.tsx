import { Metadata } from 'next'
import Link from 'next/link'
import { Shield, Camera, Clock, Globe, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Tenant Guides | RentVault',
    description: 'Helpful guides for tenants on deposit protection, move-in documentation, notice periods, and renting abroad.',
    openGraph: {
        title: 'Tenant Guides | RentVault',
        description: 'Practical advice for tenants on protecting deposits and documenting rentals.',
    },
}

const guides = [
    {
        href: '/guides/deposit-protection',
        icon: Shield,
        title: 'How to protect your rental deposit',
        description: 'Simple steps every tenant can take to avoid deposit disputes and keep their money.',
    },
    {
        href: '/guides/move-in-photos',
        icon: Camera,
        title: 'Why move-in photos matter',
        description: 'The photos you take on day one could save you hundreds when you move out.',
    },
    {
        href: '/guides/notice-periods',
        icon: Clock,
        title: 'Understanding rental notice periods',
        description: "Missing a notice deadline can cost you months of extra rent. Here's what you need to know.",
    },
    {
        href: '/guides/renting-abroad',
        icon: Globe,
        title: 'Tips for tenants renting abroad',
        description: "Renting in a foreign country comes with unique challenges. Here's how to protect yourself.",
    },
]

export default function GuidesPage() {
    return (
        <main className="max-w-[800px] mx-auto px-4 md:px-6 py-12 md:py-16">
            <header className="mb-10 text-center">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">Guides for tenants</h1>
                <p className="text-lg text-slate-600 max-w-xl mx-auto">
                    Practical advice on documentation, deposits, and staying organised throughout your rental.
                </p>
            </header>

            <div className="space-y-4">
                {guides.map((guide) => {
                    const Icon = guide.icon
                    return (
                        <Link
                            key={guide.href}
                            href={guide.href}
                            className="block bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all group"
                        >
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-slate-200 transition-colors">
                                    <Icon size={20} className="text-slate-600" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-semibold text-lg group-hover:text-slate-900 flex items-center gap-2">
                                        {guide.title}
                                        <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </h2>
                                    <p className="text-slate-600 text-sm mt-1">
                                        {guide.description}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    )
                })}
            </div>

            <div className="mt-12 text-center">
                <p className="text-slate-500 mb-4">Ready to start documenting your rental?</p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                >
                    Get started for free
                    <ArrowRight size={18} />
                </Link>
            </div>
        </main>
    )
}
