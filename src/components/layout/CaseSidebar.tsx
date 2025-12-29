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
    HardDrive,
    ChevronLeft,
    MessageSquarePlus,
    AlertTriangle,
    Check,
    Circle,
    FolderOpen,
    Plane
} from 'lucide-react'
import { useState } from 'react'
import { FeedbackDialog } from '@/components/features/FeedbackDialog'

type PhaseStatus = 'not-started' | 'in-progress' | 'complete'

interface CaseState {
    stayType?: 'long_term' | 'short_stay'
    hasContract: boolean
    checkinStatus: PhaseStatus
    handoverStatus: PhaseStatus
}

interface CaseSidebarProps {
    caseId: string
    caseLabel: string
    caseState?: CaseState
}

export default function CaseSidebar({ caseId, caseLabel, caseState }: CaseSidebarProps) {
    const pathname = usePathname()
    const [feedbackOpen, setFeedbackOpen] = useState(false)

    const isShortStay = caseState?.stayType === 'short_stay'

    // Navigation items grouped by hierarchy - different for short-stay vs long-term
    const primaryItems = isShortStay
        ? [
            { href: `/vault/case/${caseId}`, label: 'Overview', icon: LayoutDashboard },
            { href: `/vault/case/${caseId}/short-stay`, label: 'Evidence', icon: Plane, status: caseState?.checkinStatus },
        ]
        : [
            { href: `/vault/case/${caseId}`, label: 'Overview', icon: LayoutDashboard },
            { href: `/vault/case/${caseId}/check-in`, label: 'Move In', icon: Camera, status: caseState?.checkinStatus },
            { href: `/vault/case/${caseId}/handover`, label: 'Move Out', icon: KeyRound, status: caseState?.handoverStatus },
        ]

    const secondaryItems = isShortStay
        ? [] // No secondary items for short-stay (no Documents, no Contract, etc.)
        : [
            { href: `/vault/case/${caseId}/contract`, label: 'Contract', icon: FileText },
            { href: `/vault/case/${caseId}/deadlines`, label: 'Deadlines', icon: Clock },
            { href: `/vault/case/${caseId}/issues`, label: 'Condition', icon: FileText },
            { href: `/vault/case/${caseId}/documents`, label: 'Documents', icon: FolderOpen },
        ]

    const tertiaryItems = [
        { href: `/vault/case/${caseId}/exports`, label: 'Exports', icon: Download },
        { href: `/vault/case/${caseId}/storage`, label: 'Storage', icon: HardDrive },
        { href: `/vault/case/${caseId}/settings`, label: 'Data', icon: Database },
    ]

    const isActive = (href: string) => {
        if (href === `/vault/case/${caseId}`) {
            return pathname === href
        }
        return pathname?.startsWith(href)
    }

    // Progress badge component - now handles tristate
    const Badge = ({ status }: { status?: PhaseStatus }) => {
        if (!status || status === 'not-started') return null
        return status === 'complete' ? (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <Check size={10} className="text-white" strokeWidth={3} />
            </span>
        ) : (
            // in-progress
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                <Circle size={6} className="text-white fill-white" />
            </span>
        )
    }

    return (
        <aside className="w-full lg:w-auto flex-shrink-0 mb-6 lg:mb-0">
            {/* Mobile: Back link and title */}
            <div className="lg:hidden mb-4 flex items-center justify-between">
                <Link
                    href="/vault"
                    className="inline-flex items-center gap-2 text-base font-semibold text-slate-700 hover:text-slate-900 transition-colors py-2"
                >
                    <ChevronLeft size={20} />
                    All rentals
                </Link>
                <span className="font-semibold text-slate-900 truncate max-w-[180px]">{caseLabel}</span>
            </div>

            {/* Desktop: Back and Title */}
            <div className="mb-4 hidden lg:block">
                <Link
                    href="/vault"
                    className="text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors flex items-center gap-1.5 mb-3"
                >
                    <ChevronLeft size={16} />
                    All rentals
                </Link>
                <h2 className="font-semibold text-slate-900 truncate">{caseLabel}</h2>
            </div>

            {/* Mobile Navigation: Grid with visual hierarchy */}
            <nav className="lg:hidden space-y-3 mb-2">
                {/* Primary row - larger */}
                <div className="grid grid-cols-3 gap-2">
                    {primaryItems.map(item => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center gap-1 px-2 py-3 rounded-xl text-xs font-medium transition-colors min-h-[68px] justify-center ${active
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={22} />
                                <span className="text-center leading-tight">{item.label}</span>
                                {!active && <Badge status={item.status} />}
                            </Link>
                        )
                    })}
                </div>

                {/* Secondary row - now 4 items */}
                <div className="grid grid-cols-4 gap-2">
                    {secondaryItems.map(item => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-xs font-medium transition-colors min-h-[56px] justify-center ${active
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="text-center leading-tight">{item.label}</span>
                                {!active && 'status' in item && <Badge status={(item as any).status} />}
                            </Link>
                        )
                    })}
                </div>

                {/* Tertiary row - smaller, lighter */}
                <div className="grid grid-cols-4 gap-2">
                    {tertiaryItems.map(item => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg text-[10px] font-medium transition-colors ${active
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon size={16} />
                                <span>{item.label}</span>
                            </Link>
                        )
                    })}
                    {/* Feedback button fits in tertiary row */}
                    <button
                        onClick={() => setFeedbackOpen(true)}
                        className="flex flex-col items-center gap-0.5 px-1 py-2 rounded-lg text-[10px] font-medium bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors"
                    >
                        <MessageSquarePlus size={16} />
                        <span>Feedback</span>
                    </button>
                </div>
            </nav>

            {/* Desktop Navigation: Vertical list with groups */}
            <nav className="hidden lg:flex lg:flex-col gap-1">
                {/* Primary */}
                {primaryItems.map(item => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active
                                ? 'bg-slate-900 text-white'
                                : 'text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Icon size={18} />
                            {item.label}
                            {!active && item.status && item.status !== 'not-started' && (
                                <span className="ml-auto">
                                    {item.status === 'complete' ? (
                                        <span className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                            <Check size={12} className="text-green-600" strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <span className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center">
                                            <Circle size={6} className="text-amber-500 fill-amber-500" />
                                        </span>
                                    )}
                                </span>
                            )}
                        </Link>
                    )
                })}

                {/* Secondary - with divider */}
                <div className="border-t border-slate-100 my-2 pt-2">
                    {secondaryItems.map(item => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-500 hover:bg-slate-100'
                                    }`}
                            >
                                <Icon size={16} />
                                {item.label}
                                {'done' in item && (item as any).done !== undefined && (
                                    <span className="ml-auto">
                                        {(item as any).done ? (
                                            <Check size={14} className="text-green-500" strokeWidth={2.5} />
                                        ) : null}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Tertiary - with divider */}
                <div className="border-t border-slate-100 my-2 pt-2">
                    {tertiaryItems.map(item => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${active
                                    ? 'bg-slate-900 text-white'
                                    : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                                    }`}
                            >
                                <Icon size={16} />
                                {item.label}
                            </Link>
                        )
                    })}
                </div>

                <div className="pt-2 mt-2 border-t border-slate-200">
                    <button
                        onClick={() => setFeedbackOpen(true)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        <MessageSquarePlus size={18} />
                        Give Feedback
                    </button>
                </div>
            </nav>

            <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
        </aside>
    )
}
