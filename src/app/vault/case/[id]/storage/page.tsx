'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Calendar, Clock, Plus, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StorageInfo {
    yearsTotal: number
    expiresAt: Date | null
    daysRemaining: number
    status: 'active' | 'warning' | 'critical' | 'expired'
}

export default function StoragePage() {
    const params = useParams()
    const router = useRouter()
    const caseId = params.id as string

    const [loading, setLoading] = useState(true)
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
    const [rentalLabel, setRentalLabel] = useState('')
    const [purchasing, setPurchasing] = useState(false)

    useEffect(() => {
        loadStorageInfo()
    }, [caseId])

    const loadStorageInfo = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('cases')
            .select('label, address, storage_years_purchased, storage_expires_at')
            .eq('case_id', caseId)
            .single()

        if (error || !data) {
            console.error('Failed to load storage info:', error)
            setLoading(false)
            return
        }

        setRentalLabel(data.label || data.address || 'Untitled rental')

        const expiresAt = data.storage_expires_at ? new Date(data.storage_expires_at) : null
        const now = new Date()
        const daysRemaining = expiresAt
            ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 365

        let status: StorageInfo['status'] = 'active'
        if (daysRemaining <= 0) status = 'expired'
        else if (daysRemaining <= 30) status = 'critical'
        else if (daysRemaining <= 60) status = 'warning'

        setStorageInfo({
            yearsTotal: data.storage_years_purchased || 1,
            expiresAt,
            daysRemaining,
            status
        })
        setLoading(false)
    }

    const handleExtendStorage = async (years: number) => {
        setPurchasing(true)
        try {
            const res = await fetch('/api/checkout/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, years })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                console.error('No checkout URL returned')
            }
        } catch (err) {
            console.error('Failed to start checkout:', err)
        } finally {
            setPurchasing(false)
        }
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="animate-pulse text-slate-400">Loading...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back Link */}
                <Link
                    href={`/vault/case/${caseId}`}
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to {rentalLabel}
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Storage & Retention</h1>
                    <p className="text-slate-600">
                        Manage how long your rental records are securely stored.
                    </p>
                </div>

                {/* Current Status Card */}
                <div className={`bg-white rounded-2xl border p-6 mb-6 ${storageInfo?.status === 'expired' ? 'border-red-200 bg-red-50' :
                    storageInfo?.status === 'critical' ? 'border-red-200' :
                        storageInfo?.status === 'warning' ? 'border-amber-200' :
                            'border-slate-200'
                    }`}>
                    <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${storageInfo?.status === 'expired' ? 'bg-red-100' :
                            storageInfo?.status === 'critical' ? 'bg-red-100' :
                                storageInfo?.status === 'warning' ? 'bg-amber-100' :
                                    'bg-green-100'
                            }`}>
                            {storageInfo?.status === 'expired' || storageInfo?.status === 'critical' ? (
                                <AlertTriangle className="text-red-600" size={24} />
                            ) : storageInfo?.status === 'warning' ? (
                                <Clock className="text-amber-600" size={24} />
                            ) : (
                                <Shield className="text-green-600" size={24} />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-semibold text-slate-900 mb-1">
                                {storageInfo?.status === 'expired' ? 'Storage Expired' :
                                    storageInfo?.status === 'critical' ? 'Storage Expiring Soon' :
                                        storageInfo?.status === 'warning' ? 'Storage Expiring' :
                                            'Storage Active'}
                            </h2>

                            {storageInfo?.expiresAt && (
                                <p className="text-slate-600 mb-3">
                                    {storageInfo.status === 'expired' ? (
                                        <>Your storage expired on <strong>{formatDate(storageInfo.expiresAt)}</strong>.</>
                                    ) : (
                                        <>Expires on <strong>{formatDate(storageInfo.expiresAt)}</strong> ({storageInfo.daysRemaining} days remaining)</>
                                    )}
                                </p>
                            )}

                            {/* Progress bar */}
                            {storageInfo?.status !== 'expired' && storageInfo?.expiresAt && (
                                <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                                    <div
                                        className={`h-2 rounded-full transition-all ${storageInfo.status === 'critical' ? 'bg-red-500' :
                                            storageInfo.status === 'warning' ? 'bg-amber-500' :
                                                'bg-green-500'
                                            }`}
                                        style={{ width: `${Math.min(100, Math.max(0, (storageInfo.daysRemaining / 365) * 100))}%` }}
                                    />
                                </div>
                            )}

                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {storageInfo?.yearsTotal} year{storageInfo?.yearsTotal !== 1 ? 's' : ''} purchased
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Warning message for expiring storage */}
                    {(storageInfo?.status === 'expired' || storageInfo?.status === 'critical') && (
                        <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                            <p className="text-sm text-red-800">
                                <strong>Important:</strong> When storage expires, your rental documents, photos, and records
                                may be permanently deleted. We cannot recover deleted data. Extend your storage to keep your records safe.
                            </p>
                        </div>
                    )}
                </div>

                {/* Extend Storage Section */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Extend Storage</h3>
                    <p className="text-slate-600 mb-6">
                        Your pack includes 1 year of storage. Add more time to keep your records accessible beyond the initial period.
                    </p>

                    <div className="grid gap-3">
                        {[
                            { years: 1, price: 9, label: 'Add 1 Year', sublabel: null },
                            { years: 2, price: 16, label: 'Add 2 Years', sublabel: 'Save €2' },
                            { years: 3, price: 21, label: 'Add 3 Years', sublabel: 'Save €6 · Best value' }
                        ].map((option) => (
                            <button
                                key={option.years}
                                onClick={() => handleExtendStorage(option.years)}
                                disabled={purchasing}
                                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                                        <Plus size={20} className="text-slate-600" />
                                    </div>
                                    <div className="text-left">
                                        <span className="font-semibold text-slate-900">{option.label}</span>
                                        {option.sublabel && (
                                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                                                {option.sublabel}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-slate-900">€{option.price}</span>
                            </button>
                        ))}
                    </div>

                    <p className="text-xs text-slate-400 mt-4 text-center">
                        Secure payment via Stripe. One-time payment, no subscription.
                    </p>
                </div>

                {/* FAQ */}
                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>

                    <details className="group bg-white rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-medium text-slate-900 list-none flex items-center justify-between">
                            What happens when storage expires?
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
                        </summary>
                        <p className="mt-3 text-sm text-slate-600">
                            After your storage period ends, your rental documents, photos, and records may be permanently deleted after a 30-day grace period. We send reminder emails at 60, 30, and 7 days before expiry.
                        </p>
                    </details>

                    <details className="group bg-white rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-medium text-slate-900 list-none flex items-center justify-between">
                            Can I download my data before it expires?
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
                        </summary>
                        <p className="mt-3 text-sm text-slate-600">
                            Yes! You can download your PDFs and photos anytime from the Exports page. We recommend downloading your records before storage expires.
                        </p>
                    </details>

                    <details className="group bg-white rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-medium text-slate-900 list-none flex items-center justify-between">
                            Is extended storage automatic?
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
                        </summary>
                        <p className="mt-3 text-sm text-slate-600">
                            No. Storage extensions are one-time purchases — no subscriptions or automatic charges. You choose if and when to extend.
                        </p>
                    </details>
                </div>
            </div>
        </div>
    )
}
