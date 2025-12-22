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
        { href: `/vault/case/${caseId}`, label: 'Overview', icon: LayoutDashboard },
        { href: `/vault/case/${caseId}/contract`, label: 'Contract', icon: FileText },
        { href: `/vault/case/${caseId}/check-in`, label: 'Check-in', icon: Camera },
        { href: `/vault/case/${caseId}/deadlines`, label: 'Deadlines', icon: Clock },
        { href: `/vault/case/${caseId}/handover`, label: 'Handover', icon: KeyRound },
        { href: `/vault/case/${caseId}/exports`, label: 'Exports', icon: Download },
        { href: `/vault/case/${caseId}/settings`, label: 'Data', icon: Database },
    ]

    const isActive = (href: string) => {
        if (href === `/vault/case/${caseId}`) {
            return pathname === href
        }
        return pathname?.startsWith(href)
    }

    return (
        <aside className="w-full lg:w-auto flex-shrink-0 mb-6 lg:mb-0">
            {/* Mobile: Back link and title */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
                <Link
                    href="/vault"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors py-2"
                >
                    <ChevronLeft size={16} />
                    All rentals
                </Link>
                <span className="font-semibold text-slate-900 truncate max-w-[180px]">{caseLabel}</span>
            </div>

            {/* Desktop: Back and Title */}
            <div className="mb-4 hidden lg:block">
                <Link
                    href="/vault"
                    className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 mb-2"
                >
                    <ChevronLeft size={14} />
                    All rentals
                </Link>
                <h2 className="font-semibold text-slate-900 truncate">{caseLabel}</h2>
            </div>

            {/* Mobile Navigation: Grid that wraps */}
            <nav className="lg:hidden grid grid-cols-4 gap-2 mb-2">
                {navItems.map(item => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-colors min-h-[64px] justify-center ${active
                                ? 'bg-slate-900 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-center leading-tight">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Desktop Navigation: Vertical list */}
            <nav className="hidden lg:flex lg:flex-col gap-1">
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

