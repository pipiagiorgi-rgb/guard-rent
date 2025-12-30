'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isAdminEmail } from '@/lib/admin'
import { useRouter, useSearchParams } from 'next/navigation'
import {
    BarChart3,
    Users,
    Wrench,
    Home,
    DollarSign,
    TrendingUp,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Loader2,
    ShieldCheck,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'

// Types
interface MetricsData {
    overview: {
        totalUsers: number
        signupsLast24h: number
        signupsLast7Days: number
        signupsLast30Days: number
        totalCases: number
        longTermCases: number
        shortStayCases: number
        activeCases: number
        totalRevenueCents: number
    }
    users: {
        list: Array<{
            email: string
            createdAt: string
            hasCases: boolean
            stayTypes: 'long_term' | 'short_stay' | 'both' | null
        }>
        total: number
        page: number
        perPage: number
        totalPages: number
    }
    conversions: {
        casesPerSignup: string
        sealedPerCase: string
        paidPerSealed: string
        downloadsPerPurchase: string
    }
    conversionDropOff: {
        casesNoUploads: number
        uploadsNeverSealed: number
        sealedNoPurchase7d: number
        paidNoDownload: number
        downloadedNoReturn: number
    }
    revenue: Record<string, { count: number; revenue: number; percent?: string }>
    revenueAttribution: {
        totalRevenueCents: number
        longTermRevenueCents: number
        shortStayRevenueCents: number
        avgRevenuePerCaseCents: number
        longTermPercent: string
        shortStayPercent: string
    }
    funnelLongTerm: {
        casesCreated: number
        checkinSealed: number
        handoverSealed: number
        packsPurchased: number
        pdfDownloads: number
    }
    funnelShortStay: {
        casesCreated: number
        arrivalSealed: number
        departureSealed: number
        packsPurchased: number
        pdfDownloads: number
    }
    funnelHealth: {
        status: 'healthy' | 'attention' | 'action_needed'
        reason: string
    }
    downloads: {
        videoDownloads: number
    }
    emailHealth: {
        sent24h: number
        failed24h: number
        sent7d: number
        failed7d: number
        successRate24h: string
    }
    health: {
        paidNoDownload: number
        paidNoSeal: number
        sealedNoPurchase7d: number
        orphanPurchases: number
    }
    systemReadiness: {
        caseBucket: string
        rlsEnabled: boolean
        storageBucketPrivate: boolean
        adminRoutesProtected: boolean
        noPiiExposed: boolean
    }
    generatedAt: string
}

const packLabels: Record<string, string> = {
    'checkin': 'Check-In Pack',
    'moveout': 'Move-Out Pack',
    'bundle': 'Full Bundle',
    'short_stay': 'Short-Stay Pack',
    'storage_1': 'Storage +1yr',
    'storage_2': 'Storage +2yr',
    'related_contracts': 'Document Vault',
}

const tabs = [
    { id: 'metrics', label: 'Metrics', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'support', label: 'Support', icon: Wrench },
]

export default function AdminDashboard() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const activeTab = searchParams.get('tab') || 'metrics'
    const usersPage = parseInt(searchParams.get('usersPage') || '1', 10)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<MetricsData | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    const setTab = (tabId: string) => {
        router.push(`/vault/admin?tab=${tabId}`)
    }

    const setUsersPage = (page: number) => {
        router.push(`/vault/admin?tab=users&usersPage=${page}`)
    }

    const fetchMetrics = async (page = 1) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`/api/admin/metrics?usersPage=${page}`)
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error || 'Failed to load metrics')
            }
            const data = await res.json()
            setMetrics(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const checkAdmin = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (!user || !isAdminEmail(user.email)) {
                router.push('/vault')
                return
            }

            setIsAdmin(true)
            fetchMetrics(usersPage)
        }
        checkAdmin()
    }, [router, usersPage])

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <ShieldCheck size={24} />
                        Admin Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Conversion, revenue, users, and system health
                    </p>
                </div>
                <button
                    onClick={() => fetchMetrics(usersPage)}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6 w-fit">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {loading && !metrics && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            )}

            {metrics && (
                <>
                    {/* METRICS TAB */}
                    {activeTab === 'metrics' && (
                        <MetricsTab metrics={metrics} />
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && (
                        <UsersTab
                            metrics={metrics}
                            currentPage={usersPage}
                            onPageChange={setUsersPage}
                        />
                    )}

                    {/* SUPPORT TAB */}
                    {activeTab === 'support' && (
                        <SupportTab />
                    )}
                </>
            )}
        </div>
    )
}

// ============================================================
// METRICS TAB
// ============================================================
function MetricsTab({ metrics }: { metrics: MetricsData }) {
    return (
        <>
            {/* Funnel Health Badge */}
            <div className={`border rounded-xl p-4 mb-6 ${metrics.funnelHealth.status === 'healthy'
                    ? 'bg-green-50 border-green-200'
                    : metrics.funnelHealth.status === 'attention'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-red-50 border-red-200'
                }`}>
                <div className="flex items-center gap-3">
                    {metrics.funnelHealth.status === 'healthy' && <CheckCircle size={24} className="text-green-600" />}
                    {metrics.funnelHealth.status === 'attention' && <AlertTriangle size={24} className="text-amber-600" />}
                    {metrics.funnelHealth.status === 'action_needed' && <XCircle size={24} className="text-red-600" />}
                    <div>
                        <p className="font-bold">
                            Funnel Health: {
                                metrics.funnelHealth.status === 'healthy' ? '🟢 Healthy' :
                                    metrics.funnelHealth.status === 'attention' ? '🟡 Attention' :
                                        '🔴 Action Needed'
                            }
                        </p>
                        {metrics.funnelHealth.reason && (
                            <p className="text-sm text-slate-600">{metrics.funnelHealth.reason}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Users size={16} />
                        <span className="text-xs font-medium">Total Signups</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.overview.totalUsers}</p>
                    <p className="text-xs text-green-600">
                        +{metrics.overview.signupsLast24h} (24h) · +{metrics.overview.signupsLast7Days} (7d) · +{metrics.overview.signupsLast30Days} (30d)
                    </p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <Home size={16} />
                        <span className="text-xs font-medium">Total Cases</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.overview.totalCases}</p>
                    <p className="text-xs text-slate-500">
                        {metrics.overview.longTermCases} LT · {metrics.overview.shortStayCases} SS
                    </p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium">Active Cases</span>
                    </div>
                    <p className="text-2xl font-bold">{metrics.overview.activeCases}</p>
                </div>
                <div className="bg-white border rounded-xl p-4">
                    <div className="flex items-center gap-2 text-slate-500 mb-1">
                        <DollarSign size={16} />
                        <span className="text-xs font-medium">Total Revenue</span>
                    </div>
                    <p className="text-2xl font-bold">
                        €{(metrics.overview.totalRevenueCents / 100).toFixed(0)}
                    </p>
                </div>
            </div>

            {/* Conversion Summary */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8">
                <p className="text-sm font-medium text-blue-800 mb-2">Conversion Summary</p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-blue-700"><strong>{metrics.conversions.casesPerSignup}</strong> cases/signup</span>
                    <span className="text-blue-700"><strong>{metrics.conversions.sealedPerCase}%</strong> sealed</span>
                    <span className="text-blue-700"><strong>{metrics.conversions.paidPerSealed}%</strong> paid</span>
                    <span className="text-blue-700"><strong>{metrics.conversions.downloadsPerPurchase}%</strong> downloaded</span>
                </div>
            </div>

            {/* Revenue Attribution */}
            <div className="bg-white border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <DollarSign size={20} />
                    Revenue Attribution
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div className="bg-slate-50 p-3 rounded-lg">
                        <p className="text-xs text-slate-500">Long-Term</p>
                        <p className="text-xl font-bold">€{(metrics.revenueAttribution.longTermRevenueCents / 100).toFixed(0)}</p>
                        <p className="text-xs text-slate-500">{metrics.revenueAttribution.longTermPercent}%</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-600">Short-Stay</p>
                        <p className="text-xl font-bold text-purple-700">€{(metrics.revenueAttribution.shortStayRevenueCents / 100).toFixed(0)}</p>
                        <p className="text-xs text-purple-600">{metrics.revenueAttribution.shortStayPercent}%</p>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-xs text-blue-600">Avg/Case</p>
                        <p className="text-xl font-bold text-blue-700">€{(metrics.revenueAttribution.avgRevenuePerCaseCents / 100).toFixed(2)}</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-lg">
                        <p className="text-xs text-green-600">Total</p>
                        <p className="text-xl font-bold text-green-700">€{(metrics.revenueAttribution.totalRevenueCents / 100).toFixed(0)}</p>
                    </div>
                </div>
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-slate-500 border-b">
                            <th className="pb-2 font-medium">Pack Type</th>
                            <th className="pb-2 font-medium text-right">Count</th>
                            <th className="pb-2 font-medium text-right">Revenue</th>
                            <th className="pb-2 font-medium text-right">%</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(metrics.revenue).map(([packType, data]) => (
                            <tr key={packType} className="border-b last:border-0">
                                <td className="py-2">{packLabels[packType] || packType}</td>
                                <td className="py-2 text-right">{data.count}</td>
                                <td className="py-2 text-right font-medium">€{(data.revenue / 100).toFixed(2)}</td>
                                <td className="py-2 text-right text-slate-500">{data.percent}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Funnels */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Long-Term Funnel</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Cases Created</span><span className="font-bold">{metrics.funnelLongTerm.casesCreated}</span></div>
                        <div className="flex justify-between"><span>Check-In Sealed</span><span className="font-bold">{metrics.funnelLongTerm.checkinSealed}</span></div>
                        <div className="flex justify-between"><span>Handover Sealed</span><span className="font-bold">{metrics.funnelLongTerm.handoverSealed}</span></div>
                        <div className="flex justify-between"><span>Packs Purchased</span><span className="font-bold">{metrics.funnelLongTerm.packsPurchased}</span></div>
                        <div className="flex justify-between"><span>PDF Downloads</span><span className="font-bold">{metrics.funnelLongTerm.pdfDownloads}</span></div>
                    </div>
                </div>
                <div className="bg-white border rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4">Short-Stay Funnel</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span>Cases Created</span><span className="font-bold">{metrics.funnelShortStay.casesCreated}</span></div>
                        <div className="flex justify-between"><span>Arrival Sealed</span><span className="font-bold">{metrics.funnelShortStay.arrivalSealed}</span></div>
                        <div className="flex justify-between"><span>Departure Sealed</span><span className="font-bold">{metrics.funnelShortStay.departureSealed}</span></div>
                        <div className="flex justify-between"><span>Packs Purchased</span><span className="font-bold">{metrics.funnelShortStay.packsPurchased}</span></div>
                        <div className="flex justify-between"><span>PDF Downloads</span><span className="font-bold">{metrics.funnelShortStay.pdfDownloads}</span></div>
                    </div>
                </div>
            </div>

            {/* Health Alerts */}
            <div className="bg-white border rounded-xl p-6 mb-8">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} />
                    Health Alerts
                </h2>
                <div className="space-y-3">
                    {[
                        { label: 'Paid but No Download', value: metrics.health.paidNoDownload, warn: true },
                        { label: 'Paid but No Seal', value: metrics.health.paidNoSeal, warn: true },
                        { label: 'Sealed but No Purchase (7+ days)', value: metrics.health.sealedNoPurchase7d, warn: false },
                        { label: 'Orphan Purchases (no case)', value: metrics.health.orphanPurchases, error: true },
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-lg ${item.value > 0
                                ? ((item as any).error ? 'bg-red-50' : item.warn ? 'bg-amber-50' : 'bg-slate-100')
                                : 'bg-green-50'
                            }`}>
                            <div className="flex items-center gap-2">
                                {item.value > 0 ? (
                                    (item as any).error ? <XCircle size={16} className="text-red-500" /> :
                                        item.warn ? <AlertTriangle size={16} className="text-amber-500" /> :
                                            <AlertTriangle size={16} className="text-slate-500" />
                                ) : (
                                    <CheckCircle size={16} className="text-green-500" />
                                )}
                                <span>{item.label}</span>
                            </div>
                            <span className="font-bold">{item.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="text-center text-xs text-slate-400">
                Data cached. Last generated: {new Date(metrics.generatedAt).toLocaleString()}
            </div>
        </>
    )
}

// ============================================================
// USERS TAB
// ============================================================
function UsersTab({
    metrics,
    currentPage,
    onPageChange
}: {
    metrics: MetricsData
    currentPage: number
    onPageChange: (page: number) => void
}) {
    const { users } = metrics

    const stayTypeLabel = (st: string | null) => {
        if (!st) return <span className="text-slate-400">—</span>
        if (st === 'both') return <span className="text-purple-600 font-medium">Both</span>
        if (st === 'long_term') return <span className="text-blue-600">Long-Term</span>
        if (st === 'short_stay') return <span className="text-green-600">Short-Stay</span>
        return <span className="text-slate-400">{st}</span>
    }

    return (
        <>
            {/* Summary */}
            <div className="bg-white border rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500">Total Registered Users</p>
                        <p className="text-2xl font-bold">{users.total}</p>
                    </div>
                    <div className="text-right text-sm text-slate-500">
                        Page {users.page} of {users.totalPages}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white border rounded-xl overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-50 border-b">
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Email</th>
                            <th className="text-left px-4 py-3 font-medium text-slate-600">Registered</th>
                            <th className="text-center px-4 py-3 font-medium text-slate-600">Has Cases</th>
                            <th className="text-center px-4 py-3 font-medium text-slate-600">Stay Types</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.list.map((user, i) => (
                            <tr key={i} className="border-b last:border-0 hover:bg-slate-50">
                                <td className="px-4 py-3">{user.email}</td>
                                <td className="px-4 py-3 text-slate-500">
                                    {new Date(user.createdAt).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {user.hasCases ? (
                                        <CheckCircle size={16} className="text-green-500 inline" />
                                    ) : (
                                        <XCircle size={16} className="text-slate-300 inline" />
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    {stayTypeLabel(user.stayTypes)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {users.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={16} />
                        Previous
                    </button>
                    <span className="text-sm text-slate-500 px-4">
                        Page {currentPage} of {users.totalPages}
                    </span>
                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage >= users.totalPages}
                        className="flex items-center gap-1 px-3 py-2 text-sm bg-white border rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </>
    )
}

// ============================================================
// SUPPORT TAB (Placeholder — redirects to existing support page)
// ============================================================
function SupportTab() {
    const router = useRouter()

    useEffect(() => {
        // For now, redirect to existing support page
        // In future, content can be moved here
        router.push('/vault/admin/support')
    }, [router])

    return (
        <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin" size={32} />
            <span className="ml-2 text-slate-500">Loading support dashboard...</span>
        </div>
    )
}
