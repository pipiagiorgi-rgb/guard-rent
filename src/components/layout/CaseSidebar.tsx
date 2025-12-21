'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Camera,
    Clock,
    KeyRound,
    Download,
    Database,
    ChevronLeft
} from 'lucide-react'

interface CaseSidebarProps {
    caseId: string
    caseLabel: string
}

export default function CaseSidebar({ caseId, caseLabel }: CaseSidebarProps) {
    const pathname = usePathname()

    const navItems = [
        { href: `/app/case/${caseId}`, label: 'Overview', icon: LayoutDashboard },
        { href: `/app/case/${caseId}/contract`, label: 'Contract', icon: FileText },
        { href: `/app/case/${caseId}/check-in`, label: 'Check-in', icon: Camera },
        { href: `/app/case/${caseId}/deadlines`, label: 'Deadlines', icon: Clock },
        { href: `/app/case/${caseId}/handover`, label: 'Handover', icon: KeyRound },
        { href: `/app/case/${caseId}/exports`, label: 'Exports', icon: Download },
        { href: `/app/case/${caseId}/settings`, label: 'Data & retention', icon: Database },
    ]

    const isActive = (href: string) => {
        if (href === `/app/case/${caseId}`) {
            return pathname === href
        }
        return pathname?.startsWith(href)
    }

    return (
        <aside className="w-full md:w-56 flex-shrink-0">
            {/* Mobile: Back link */}
            <div className="md:hidden mb-4">
                <Link
                    href="/app"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                    <ChevronLeft size={16} />
                    All rentals
                </Link>
            </div>

            {/* Case title */}
            <div className="mb-4 hidden md:block">
                <Link
                    href="/app"
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 mb-2"
                >
                    <ChevronLeft size={14} />
                    All rentals
                </Link>
                <h2 className="font-semibold text-slate-900 truncate">{caseLabel}</h2>
            </div>

            {/* Navigation */}
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0">
                {navItems.map(item => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>
        </aside>
    )
}
