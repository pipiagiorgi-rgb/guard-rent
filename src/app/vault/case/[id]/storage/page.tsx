'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Shield, Calendar, Clock, Plus, AlertTriangle, Check, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface StorageInfo {
    hasPack: boolean
    storageExtensions: number  // Years explicitly purchased as extensions
    expiresAt: Date | null
    daysRemaining: number
    status: 'preview' | 'active' | 'warning' | 'critical' | 'expired'
}

export default function StoragePage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const caseId = params.id as string
    const success = searchParams.get('success')

    const [loading, setLoading] = useState(true)
    const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null)
    const [rentalLabel, setRentalLabel] = useState('')
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [showSuccess, setShowSuccess] = useState(false)
    const [isShortStay, setIsShortStay] = useState(false)

    useEffect(() => {
        loadStorageInfo()
        // Show success message if returning from Stripe
        if (success === 'true') {
            setShowSuccess(true)
            router.replace(`/vault/case/${caseId}/storage`, { scroll: false })
            setTimeout(() => setShowSuccess(false), 8000)
        }
    }, [caseId, success])

    const loadStorageInfo = async () => {
        const supabase = createClient()

        const { data, error } = await supabase
            .from('cases')
            .select('label, address, purchase_type, storage_years_purchased, storage_expires_at, stay_type')
            .eq('case_id', caseId)
            .single()

        if (error || !data) {
            console.error('Failed to load storage info:', error)
            setLoading(false)
            return
        }

        setRentalLabel(data.label || data.address || 'Untitled rental')
        setIsShortStay(data.stay_type === 'short_stay')

        // Determine if user has purchased ANY pack (including short_stay)
        const hasPack = !!(data.purchase_type && ['checkin', 'moveout', 'bundle', 'short_stay'].includes(data.purchase_type))

        const expiresAt = data.storage_expires_at ? new Date(data.storage_expires_at) : null
        const now = new Date()
        const daysRemaining = expiresAt
            ? Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
            : 0

        let status: StorageInfo['status'] = 'preview'
        if (!hasPack) {
            status = 'preview'
        } else if (daysRemaining <= 0) {
            status = 'expired'
        } else if (daysRemaining <= 30) {
            status = 'critical'
        } else if (daysRemaining <= 60) {
            status = 'warning'
        } else {
            status = 'active'
        }

        setStorageInfo({
            hasPack,
            storageExtensions: data.storage_years_purchased || 0,
            expiresAt,
            daysRemaining,
            status
        })
        setLoading(false)
    }

    const handleExtendStorage = async (years: number) => {
        setPurchasing(`storage-${years}`)
        try {
            const res = await fetch('/api/checkout/storage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, years })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Failed to start checkout:', err)
        } finally {
            setPurchasing(null)
        }
    }

    const handlePurchasePack = async (packType: string, amount: number) => {
        setPurchasing(packType)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, packType, amount })
            })

            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Failed to start checkout:', err)
        } finally {
            setPurchasing(null)
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

    const isPreview = storageInfo?.status === 'preview'

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
                        {isPreview
                            ? 'Secure your rental evidence with immutable timestamps and long-term storage.'
                            : 'Manage how long your rental records are securely stored.'}
                    </p>
                </div>

                {/* Success Banner */}
                {showSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="text-green-600" size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-green-900">Storage extended successfully</p>
                            <p className="text-sm text-green-700">
                                Your records are now stored until {storageInfo?.expiresAt ? formatDate(storageInfo.expiresAt) : 'the new expiry date'}.
                            </p>
                        </div>
                    </div>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    STATE A: PREVIEW MODE (NO PACK)
                ═══════════════════════════════════════════════════════════ */}
                {isPreview && (
                    <>
                        {/* Preview Status Card */}
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                                    <Clock className="text-amber-600" size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-1">
                                        Preview Mode
                                    </h2>
                                    <p className="text-slate-600 mb-3">
                                        Files visible, not yet secured
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        {isShortStay ? (
                                            <>Your files are saved while you explore. Purchase the Short-Stay Pack to seal your evidence with immutable timestamps and unlock <strong>30-day secure storage</strong> after checkout.</>
                                        ) : (
                                            <>Your files are saved while you explore. Purchase a pack to seal your evidence with immutable timestamps and unlock <strong>12-month secure storage</strong>.</>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Pack Purchase Options */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Secure Your Evidence</h3>
                            <p className="text-slate-600 mb-6">
                                {isShortStay
                                    ? 'Seal your arrival and departure photos for dispute protection.'
                                    : 'Choose a pack to seal your records and unlock 12-month storage.'}
                            </p>

                            <div className="grid gap-3">
                                {isShortStay ? (
                                    /* SHORT-STAY: Single €5.99 pack */
                                    <button
                                        onClick={() => handlePurchasePack('short_stay', 599)}
                                        disabled={purchasing !== null}
                                        className="flex items-center justify-between p-4 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50"
                                    >
                                        <div className="text-left">
                                            <span className="font-semibold text-slate-900">Short-Stay Pack</span>
                                            <p className="text-sm text-slate-500">Arrival + departure evidence · 30-day storage</p>
                                        </div>
                                        <span className="text-lg font-bold text-blue-600">
                                            {purchasing === 'short_stay' ? <Loader2 className="animate-spin" size={20} /> : '€5.99'}
                                        </span>
                                    </button>
                                ) : (
                                    /* LONG-TERM: Three pack options */
                                    <>
                                        <button
                                            onClick={() => handlePurchasePack('checkin', 1900)}
                                            disabled={purchasing !== null}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            <div className="text-left">
                                                <span className="font-semibold text-slate-900">Check-In Pack</span>
                                                <p className="text-sm text-slate-500">Move-in evidence + 12mo storage</p>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900">
                                                {purchasing === 'checkin' ? <Loader2 className="animate-spin" size={20} /> : '€19'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handlePurchasePack('moveout', 2900)}
                                            disabled={purchasing !== null}
                                            className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50"
                                        >
                                            <div className="text-left">
                                                <span className="font-semibold text-slate-900">Move-Out Pack</span>
                                                <p className="text-sm text-slate-500">Handover evidence + 12mo storage</p>
                                            </div>
                                            <span className="text-lg font-bold text-slate-900">
                                                {purchasing === 'moveout' ? <Loader2 className="animate-spin" size={20} /> : '€29'}
                                            </span>
                                        </button>

                                        <button
                                            onClick={() => handlePurchasePack('bundle', 3900)}
                                            disabled={purchasing !== null}
                                            className="flex items-center justify-between p-4 border-2 border-blue-500 bg-blue-50 rounded-xl hover:bg-blue-100 transition-all disabled:opacity-50 relative"
                                        >
                                            <span className="absolute -top-2 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full">
                                                BEST VALUE
                                            </span>
                                            <div className="text-left">
                                                <span className="font-semibold text-slate-900">Full Bundle</span>
                                                <p className="text-sm text-slate-500">Everything + Deposit Recovery</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-lg font-bold text-blue-600">
                                                    {purchasing === 'bundle' ? <Loader2 className="animate-spin" size={20} /> : '€39'}
                                                </span>
                                                <p className="text-xs text-slate-500">Save €9</p>
                                            </div>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* ═══════════════════════════════════════════════════════════
                    STATE B & C: PAID USER (WITH OR WITHOUT EXTENSIONS)
                ═══════════════════════════════════════════════════════════ */}
                {!isPreview && storageInfo && (
                    <>
                        {/* Current Status Card */}
                        <div className={`bg-white rounded-2xl border p-6 mb-6 ${storageInfo.status === 'expired' ? 'border-red-200 bg-red-50' :
                            storageInfo.status === 'critical' ? 'border-red-200' :
                                storageInfo.status === 'warning' ? 'border-amber-200' :
                                    'border-slate-200'
                            }`}>
                            <div className="flex items-start gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${storageInfo.status === 'expired' ? 'bg-red-100' :
                                    storageInfo.status === 'critical' ? 'bg-red-100' :
                                        storageInfo.status === 'warning' ? 'bg-amber-100' :
                                            'bg-green-100'
                                    }`}>
                                    {storageInfo.status === 'expired' || storageInfo.status === 'critical' ? (
                                        <AlertTriangle className="text-red-600" size={24} />
                                    ) : storageInfo.status === 'warning' ? (
                                        <Clock className="text-amber-600" size={24} />
                                    ) : (
                                        <Shield className="text-green-600" size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold text-slate-900 mb-1">
                                        {storageInfo.status === 'expired' ? 'Storage Expired' :
                                            storageInfo.status === 'critical' ? 'Storage Expiring Soon' :
                                                storageInfo.status === 'warning' ? 'Storage Expiring' :
                                                    'Secure Storage Active'}
                                    </h2>

                                    {/* Subtitle based on extensions */}
                                    <p className="text-sm text-slate-500 mb-3">
                                        {storageInfo.storageExtensions > 0
                                            ? `+${storageInfo.storageExtensions} year${storageInfo.storageExtensions > 1 ? 's' : ''} added`
                                            : 'Included with your pack'}
                                    </p>

                                    {storageInfo.expiresAt && (
                                        <p className="text-slate-600 mb-3">
                                            {storageInfo.status === 'expired' ? (
                                                <>Expired on <strong>{formatDate(storageInfo.expiresAt)}</strong>.</>
                                            ) : (
                                                <>Sealed until <strong>{formatDate(storageInfo.expiresAt)}</strong>
                                                    <span className="text-slate-400 ml-1">({storageInfo.daysRemaining} days)</span>
                                                </>
                                            )}
                                        </p>
                                    )}

                                    {/* Progress bar */}
                                    {storageInfo.status !== 'expired' && storageInfo.expiresAt && (
                                        <div className="w-full bg-slate-100 rounded-full h-2 mb-3">
                                            <div
                                                className={`h-2 rounded-full transition-all ${storageInfo.status === 'critical' ? 'bg-red-500' :
                                                    storageInfo.status === 'warning' ? 'bg-amber-500' :
                                                        'bg-green-500'
                                                    }`}
                                                style={{ width: `${Math.min(100, Math.max(5, (storageInfo.daysRemaining / 365) * 100))}%` }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Warning message for expiring storage */}
                            {(storageInfo.status === 'expired' || storageInfo.status === 'critical') && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl">
                                    <p className="text-sm text-red-800">
                                        <strong>Action required:</strong> You have a 30-day grace period to download your files or extend storage.
                                        After that, data is removed and cannot be recovered.
                                    </p>
                                </div>
                            )}

                            {/* Trust line for active storage */}
                            {storageInfo.status === 'active' && (
                                <p className="mt-4 text-xs text-slate-400">
                                    Evidence is immutable — storage only affects availability.
                                </p>
                            )}
                        </div>

                        {/* Extend Storage Section */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Add Storage Time</h3>
                            <p className="text-slate-600 mb-6">
                                Need to keep records longer? Extend your storage with a one-time payment.
                            </p>

                            <div className="grid gap-3">
                                {[
                                    { years: 1, price: 9, label: '+ 1 year', sublabel: null },
                                    { years: 2, price: 16, label: '+ 2 years', sublabel: 'Save €2' },
                                    { years: 3, price: 21, label: '+ 3 years', sublabel: 'Save €6 · Best value' }
                                ].map((option) => (
                                    <button
                                        key={option.years}
                                        onClick={() => handleExtendStorage(option.years)}
                                        disabled={purchasing !== null}
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
                                        <span className="text-lg font-bold text-slate-900">
                                            {purchasing === `storage-${option.years}`
                                                ? <Loader2 className="animate-spin" size={20} />
                                                : `€${option.price}`}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <p className="text-xs text-slate-400 mt-4 text-center">
                                Secure payment via Stripe. One-time payment, no subscription.
                            </p>
                        </div>
                    </>
                )}

                {/* FAQ */}
                <div className="mt-8 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900">Frequently Asked Questions</h3>

                    <details className="group bg-white rounded-xl border border-slate-200 p-4">
                        <summary className="cursor-pointer font-medium text-slate-900 list-none flex items-center justify-between">
                            What happens when storage expires?
                            <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
                        </summary>
                        <p className="mt-3 text-sm text-slate-600">
                            After your storage ends, you have a <strong>30-day grace period</strong> to download your files or extend storage. After that, data is removed and cannot be recovered. We send reminders at 60, 30, and 7 days before expiry.
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
                            No. Storage extensions are one-time purchases with no subscriptions or automatic charges. You choose if and when to extend.
                        </p>
                    </details>
                </div>
            </div>
        </div>
    )
}

