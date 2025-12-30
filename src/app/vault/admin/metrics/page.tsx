'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isAdminEmail } from '@/lib/admin'
import { useRouter } from 'next/navigation'
import {
    BarChart3,
    Users,
    Home,
    DollarSign,
    TrendingUp,
    Download,
    AlertTriangle,
    CheckCircle,
    XCircle,
    RefreshCw,
    Loader2,
    ShieldCheck
} from 'lucide-react'

interface MetricsData {
    overview: {
        totalUsers: number
        signupsLast24h: number
        signupsLast7Days: number
        totalCases: number
        longTermCases: number
        shortStayCases: number
        activeCases: number
        totalRevenueCents: number
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

export default function AdminMetricsPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [metrics, setMetrics] = useState<MetricsData | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)

    const fetchMetrics = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/metrics')
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
            fetchMetrics()
        }
        checkAdmin()
    }, [router])

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <BarChart3 size={24} />
                        Admin Metrics Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Conversion, revenue, and system health (admin only)
                    </p>
                </div>
                <button
                    onClick={fetchMetrics}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                    Refresh
                </button>
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
                    {/* Funnel Health Badge */}
                    <div className={`border rounded-xl p-4 mb-6 ${metrics.funnelHealth.status === 'healthy'
                            ? 'bg-green-50 border-green-200'
                            : metrics.funnelHealth.status === 'attention'
                                ? 'bg-amber-50 border-amber-200'
                                : 'bg-red-50 border-red-200'
                        }`}>
                        <div className="flex items-center gap-3">
                            {metrics.funnelHealth.status === 'healthy' && (
                                <CheckCircle size={24} className="text-green-600" />
                            )}
                            {metrics.funnelHealth.status === 'attention' && (
                                <AlertTriangle size={24} className="text-amber-600" />
                            )}
                            {metrics.funnelHealth.status === 'action_needed' && (
                                <XCircle size={24} className="text-red-600" />
                            )}
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
                                +{metrics.overview.signupsLast24h} (24h) · +{metrics.overview.signupsLast7Days} (7d)
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
                            <span className="text-blue-700">
                                <strong>{metrics.conversions.casesPerSignup}</strong> cases/signup
                            </span>
                            <span className="text-blue-700">
                                <strong>{metrics.conversions.sealedPerCase}%</strong> sealed
                            </span>
                            <span className="text-blue-700">
                                <strong>{metrics.conversions.paidPerSealed}%</strong> paid
                            </span>
                            <span className="text-blue-700">
                                <strong>{metrics.conversions.downloadsPerPurchase}%</strong> downloaded
                            </span>
                        </div>
                    </div>

                    {/* Conversion Drop-Off */}
                    <div className="bg-white border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4">📉 Conversion Drop-Off</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                            <div className={`p-3 rounded-lg ${metrics.conversionDropOff.casesNoUploads > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500">No uploads</p>
                                <p className="text-xl font-bold">{metrics.conversionDropOff.casesNoUploads}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.conversionDropOff.uploadsNeverSealed > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500">Never sealed</p>
                                <p className="text-xl font-bold">{metrics.conversionDropOff.uploadsNeverSealed}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.conversionDropOff.sealedNoPurchase7d > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500">Sealed, unpaid (7d+)</p>
                                <p className="text-xl font-bold">{metrics.conversionDropOff.sealedNoPurchase7d}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.conversionDropOff.paidNoDownload > 0 ? 'bg-amber-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500">Paid, not downloaded</p>
                                <p className="text-xl font-bold">{metrics.conversionDropOff.paidNoDownload}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.conversionDropOff.downloadedNoReturn > 0 ? 'bg-slate-50' : 'bg-green-50'}`}>
                                <p className="text-xs text-slate-500">No handover (LT)</p>
                                <p className="text-xl font-bold">{metrics.conversionDropOff.downloadedNoReturn}</p>
                            </div>
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

                    {/* Downloads */}
                    <div className="bg-white border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Download size={20} />
                            Downloads
                        </h2>
                        <div className="text-sm">
                            <div className="flex justify-between py-2 border-b">
                                <span>Video Downloads</span>
                                <span className="font-bold">{metrics.downloads.videoDownloads}</span>
                            </div>
                        </div>
                    </div>

                    {/* Email Health */}
                    <div className="bg-white border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4">📧 Email Health</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                                <p className="text-green-700 mb-1">Sent (24h)</p>
                                <p className="text-xl font-bold text-green-700">{metrics.emailHealth.sent24h}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.emailHealth.failed24h > 0
                                    ? 'bg-red-50 border border-red-100'
                                    : 'bg-green-50 border border-green-100'
                                }`}>
                                <p className={metrics.emailHealth.failed24h > 0 ? 'text-red-700' : 'text-green-700'}>Failed (24h)</p>
                                <p className={`text-xl font-bold ${metrics.emailHealth.failed24h > 0 ? 'text-red-700' : 'text-green-700'}`}>
                                    {metrics.emailHealth.failed24h}
                                </p>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg">
                                <p className="text-slate-600 mb-1">Sent (7d)</p>
                                <p className="text-xl font-bold">{metrics.emailHealth.sent7d}</p>
                            </div>
                            <div className={`p-3 rounded-lg ${metrics.emailHealth.failed7d > 0
                                    ? 'bg-amber-50 border border-amber-100'
                                    : 'bg-slate-50 border border-slate-100'
                                }`}>
                                <p className={metrics.emailHealth.failed7d > 0 ? 'text-amber-700' : 'text-slate-600'}>Failed (7d)</p>
                                <p className={`text-xl font-bold ${metrics.emailHealth.failed7d > 0 ? 'text-amber-700' : ''}`}>
                                    {metrics.emailHealth.failed7d}
                                </p>
                            </div>
                            <div className={`p-3 rounded-lg ${parseFloat(metrics.emailHealth.successRate24h) < 95
                                    ? 'bg-amber-50 border border-amber-100'
                                    : 'bg-green-50 border border-green-100'
                                }`}>
                                <p className="text-slate-600 mb-1">Success Rate</p>
                                <p className="text-xl font-bold">{metrics.emailHealth.successRate24h}%</p>
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
                                        ? (item.error ? 'bg-red-50' : item.warn ? 'bg-amber-50' : 'bg-slate-100')
                                        : 'bg-green-50'
                                    }`}>
                                    <div className="flex items-center gap-2">
                                        {item.value > 0 ? (
                                            item.error ? <XCircle size={16} className="text-red-500" /> :
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

                    {/* System Readiness & Security */}
                    <div className="bg-slate-50 border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck size={20} />
                            Security & System Readiness
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-slate-600">Scale bucket:</span>
                                <span className="font-bold">{metrics.systemReadiness.caseBucket}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {metrics.systemReadiness.rlsEnabled ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                <span>RLS enabled on all tables</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {metrics.systemReadiness.storageBucketPrivate ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                <span>Storage bucket private</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {metrics.systemReadiness.adminRoutesProtected ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                <span>Admin routes protected</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {metrics.systemReadiness.noPiiExposed ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                <span>No PII exposed</span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-400">
                        Data cached. Last generated: {new Date(metrics.generatedAt).toLocaleString()}
                    </div>
                </>
            )}
        </div>
    )
}
