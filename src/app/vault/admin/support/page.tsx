'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { isAdminEmail } from '@/lib/admin'
import { useRouter } from 'next/navigation'
import {
    Wrench,
    Activity,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Mail,
    RefreshCw,
    Loader2,
    Copy,
    Search,
    FileText,
    Video,
    Stamp
} from 'lucide-react'

interface SupportIssue {
    caseId: string
    stayType: string
    issueType: string
    ageHours: number
    severity: 'low' | 'medium' | 'high'
}

interface SupportData {
    systemHealth: {
        activeCases: number
        pendingSeals: number
        pendingPdfs: number
        emailErrors24h: number
        status: 'healthy' | 'warning' | 'critical'
    }
    operationalToday: {
        sealedToday: number
        pdfsGeneratedToday: number
        videosUploadedToday: number
        emailsSentToday: number
        failedActions24h: number
    }
    supportQueue: SupportIssue[]
    emailHealth: {
        sent24h: number
        failed24h: number
        sent7d: number
        failed7d: number
        successRate24h: string
        successRate7d: string
        lastFailureTimestamp: string | null
    }
    orphanAssetCount: number
    generatedAt: string
}

export default function AdminSupportPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [data, setData] = useState<SupportData | null>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [copied, setCopied] = useState<string | null>(null)

    const fetchData = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/admin/support')
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error || 'Failed to load support data')
            }
            const d = await res.json()
            setData(d)
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
            fetchData()
        }
        checkAdmin()
    }, [router])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 2000)
    }

    const formatAge = (hours: number) => {
        if (hours < 24) return `${hours}h`
        const days = Math.floor(hours / 24)
        return `${days}d`
    }

    if (!isAdmin) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="animate-spin" size={32} />
            </div>
        )
    }

    const filteredQueue = data?.supportQueue.filter(issue =>
        searchQuery === '' ||
        issue.caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        issue.issueType.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Wrench size={24} />
                        Support Dashboard
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Operational health and troubleshooting (admin only)
                    </p>
                </div>
                <button
                    onClick={fetchData}
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

            {loading && !data && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin" size={40} />
                </div>
            )}

            {data && (
                <>
                    {/* System Health Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                        <div className={`border rounded-xl p-4 ${data.systemHealth.status === 'healthy' ? 'bg-green-50 border-green-200' :
                                data.systemHealth.status === 'warning' ? 'bg-amber-50 border-amber-200' :
                                    'bg-red-50 border-red-200'
                            }`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Activity size={16} />
                                <span className="text-xs font-medium">System Status</span>
                            </div>
                            <p className={`text-lg font-bold ${data.systemHealth.status === 'healthy' ? 'text-green-600' :
                                    data.systemHealth.status === 'warning' ? 'text-amber-600' :
                                        'text-red-600'
                                }`}>
                                {data.systemHealth.status === 'healthy' ? '✓ Healthy' :
                                    data.systemHealth.status === 'warning' ? '⚠ Attention' : '✗ Critical'}
                            </p>
                        </div>

                        <div className="bg-white border rounded-xl p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <CheckCircle size={16} />
                                <span className="text-xs font-medium">Active Cases</span>
                            </div>
                            <p className="text-2xl font-bold">{data.systemHealth.activeCases}</p>
                        </div>

                        <div className={`border rounded-xl p-4 ${data.systemHealth.pendingSeals > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'
                            }`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Clock size={16} />
                                <span className="text-xs font-medium">Pending Seals</span>
                            </div>
                            <p className="text-2xl font-bold">{data.systemHealth.pendingSeals}</p>
                        </div>

                        <div className={`border rounded-xl p-4 ${data.systemHealth.pendingPdfs > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white'
                            }`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <FileText size={16} />
                                <span className="text-xs font-medium">Pending PDFs</span>
                            </div>
                            <p className="text-2xl font-bold">{data.systemHealth.pendingPdfs}</p>
                        </div>

                        <div className={`border rounded-xl p-4 ${data.systemHealth.emailErrors24h > 0 ? 'bg-red-50 border-red-200' : 'bg-white'
                            }`}>
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Mail size={16} />
                                <span className="text-xs font-medium">Email Errors (24h)</span>
                            </div>
                            <p className={`text-2xl font-bold ${data.systemHealth.emailErrors24h > 0 ? 'text-red-600' : ''
                                }`}>{data.systemHealth.emailErrors24h}</p>
                        </div>
                    </div>

                    {/* Operational Today */}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4 text-blue-800">📊 Today&apos;s Activity</h2>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Stamp size={14} />
                                    <span className="text-xs">Sealed</span>
                                </div>
                                <p className="text-xl font-bold">{data.operationalToday.sealedToday}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <FileText size={14} />
                                    <span className="text-xs">PDFs Generated</span>
                                </div>
                                <p className="text-xl font-bold">{data.operationalToday.pdfsGeneratedToday}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Video size={14} />
                                    <span className="text-xs">Videos Uploaded</span>
                                </div>
                                <p className="text-xl font-bold">{data.operationalToday.videosUploadedToday}</p>
                            </div>
                            <div className="bg-white rounded-lg p-3">
                                <div className="flex items-center gap-2 text-blue-600 mb-1">
                                    <Mail size={14} />
                                    <span className="text-xs">Emails Sent</span>
                                </div>
                                <p className="text-xl font-bold">{data.operationalToday.emailsSentToday}</p>
                            </div>
                            <div className={`rounded-lg p-3 ${data.operationalToday.failedActions24h > 0 ? 'bg-red-100' : 'bg-white'}`}>
                                <div className={`flex items-center gap-2 mb-1 ${data.operationalToday.failedActions24h > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                    <XCircle size={14} />
                                    <span className="text-xs">Failed (24h)</span>
                                </div>
                                <p className={`text-xl font-bold ${data.operationalToday.failedActions24h > 0 ? 'text-red-600' : ''}`}>
                                    {data.operationalToday.failedActions24h}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Support Queue */}
                    <div className="bg-white border rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold flex items-center gap-2">
                                <AlertTriangle size={20} />
                                Support Queue
                                <span className="text-sm font-normal text-slate-500">
                                    ({data.supportQueue.length} issues)
                                </span>
                            </h2>
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search case ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-4 py-2 text-sm border rounded-lg w-48"
                                />
                            </div>
                        </div>

                        {filteredQueue.length === 0 ? (
                            <div className="text-center py-8 text-slate-500">
                                <CheckCircle size={32} className="mx-auto mb-2 text-green-500" />
                                <p>No issues requiring attention</p>
                            </div>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-slate-500 border-b">
                                        <th className="pb-2 font-medium">Case ID</th>
                                        <th className="pb-2 font-medium">Type</th>
                                        <th className="pb-2 font-medium">Issue</th>
                                        <th className="pb-2 font-medium text-right">Age</th>
                                        <th className="pb-2 font-medium text-center">Severity</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredQueue.map((issue, i) => (
                                        <tr key={i} className="border-b last:border-0">
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <code className="text-xs bg-slate-100 px-2 py-1 rounded">
                                                        {issue.caseId.slice(0, 8)}...
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(issue.caseId)}
                                                        className="text-slate-400 hover:text-slate-600"
                                                    >
                                                        {copied === issue.caseId ? (
                                                            <CheckCircle size={14} className="text-green-500" />
                                                        ) : (
                                                            <Copy size={14} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="py-3">
                                                <span className={`text-xs px-2 py-1 rounded ${issue.stayType === 'short_stay'
                                                        ? 'bg-purple-100 text-purple-700'
                                                        : issue.stayType === 'unknown'
                                                            ? 'bg-slate-100 text-slate-600'
                                                            : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {issue.stayType === 'short_stay' ? 'Short' : issue.stayType === 'unknown' ? '?' : 'Long'}
                                                </span>
                                            </td>
                                            <td className="py-3 font-medium">{issue.issueType}</td>
                                            <td className="py-3 text-right text-slate-500">
                                                {formatAge(issue.ageHours)}
                                            </td>
                                            <td className="py-3 text-center">
                                                {issue.severity === 'high' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-red-100 text-red-700">
                                                        <XCircle size={12} /> High
                                                    </span>
                                                )}
                                                {issue.severity === 'medium' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-amber-100 text-amber-700">
                                                        <AlertTriangle size={12} /> Med
                                                    </span>
                                                )}
                                                {issue.severity === 'low' && (
                                                    <span className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-slate-100 text-slate-600">
                                                        Low
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Email Health */}
                    <div className="bg-white border rounded-xl p-6 mb-8">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Mail size={20} />
                            Email System Confidence
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className={`p-4 rounded-lg ${parseFloat(data.emailHealth.successRate24h) >= 95
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-amber-50 border border-amber-200'
                                }`}>
                                <p className="text-sm text-slate-600 mb-1">Success Rate (24h)</p>
                                <p className={`text-3xl font-bold ${parseFloat(data.emailHealth.successRate24h) >= 95 ? 'text-green-600' : 'text-amber-600'
                                    }`}>{data.emailHealth.successRate24h}%</p>
                            </div>
                            <div className={`p-4 rounded-lg ${parseFloat(data.emailHealth.successRate7d) >= 95
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-amber-50 border border-amber-200'
                                }`}>
                                <p className="text-sm text-slate-600 mb-1">Success Rate (7d)</p>
                                <p className={`text-3xl font-bold ${parseFloat(data.emailHealth.successRate7d) >= 95 ? 'text-green-600' : 'text-amber-600'
                                    }`}>{data.emailHealth.successRate7d}%</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-lg">
                                <p className="text-sm text-slate-600 mb-1">Sent (7d)</p>
                                <p className="text-3xl font-bold">{data.emailHealth.sent7d}</p>
                            </div>
                            <div className={`p-4 rounded-lg ${data.emailHealth.failed7d > 0
                                    ? 'bg-red-50 border border-red-200'
                                    : 'bg-green-50 border border-green-200'
                                }`}>
                                <p className="text-sm text-slate-600 mb-1">Failed (7d)</p>
                                <p className={`text-3xl font-bold ${data.emailHealth.failed7d > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {data.emailHealth.failed7d}
                                </p>
                            </div>
                        </div>
                        {data.emailHealth.lastFailureTimestamp && (
                            <p className="text-sm text-slate-500">
                                Last failure: {new Date(data.emailHealth.lastFailureTimestamp).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Orphan Assets Alert */}
                    {data.orphanAssetCount > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={20} className="text-amber-600" />
                                <span className="font-medium text-amber-700">
                                    {data.orphanAssetCount} orphan assets detected (assets without a valid case)
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="text-center text-xs text-slate-400">
                        Last updated: {new Date(data.generatedAt).toLocaleString()}
                    </div>
                </>
            )}
        </div>
    )
}
