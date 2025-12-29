'use client'

import { useState } from 'react'
import { Shield, CheckCircle, ArrowRight } from 'lucide-react'

interface UpgradeBannerProps {
    caseId: string
    currentPack?: string | null
    isAdmin?: boolean  // Admin users get full access
    stayType?: 'long_term' | 'short_stay' | null  // Determines which packs to show
}

export function UpgradeBanner({ caseId, currentPack, isAdmin = false, stayType = 'long_term' }: UpgradeBannerProps) {
    const [loading, setLoading] = useState<string | null>(null)

    const handlePurchase = async (packType: 'checkin' | 'bundle' | 'moveout' | 'short_stay') => {
        setLoading(packType)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, packType })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Checkout failed. Please try again.')
                setLoading(null)
            }
        } catch (error) {
            console.error('Checkout error:', error)
            alert('Something went wrong. Please try again.')
            setLoading(null)
        }
    }

    // CASE 0: Admin users always get full access
    if (isAdmin) {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">Full Access</h3>
                        <p className="text-sm text-green-700">
                            You have unlimited access to all features for this rental.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 1: Full Bundle purchased - Show "Full Access" success banner
    if (currentPack === 'bundle') {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">Full Access</h3>
                        <p className="text-sm text-green-700">
                            You have unlimited access to all features for this rental.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 2: Check-In pack purchased - Upsell Move-Out pack
    if (currentPack === 'checkin') {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Shield size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Check-In Pack Active</span>
                        </div>
                        <h3 className="font-semibold text-slate-900 mb-1">Complete your protection</h3>
                        <p className="text-sm text-slate-600 mb-3">
                            Add move-out evidence collection and deposit recovery tools.
                        </p>
                        <button
                            onClick={() => handlePurchase('moveout')}
                            disabled={loading === 'moveout'}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading === 'moveout' ? 'Loading...' : (
                                <>Add Move-Out Pack €29 <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 3: Move-Out pack purchased - Just show active badge (no point upselling check-in after move-out)
    if (currentPack === 'moveout') {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">Move-Out Pack Active</h3>
                        <p className="text-sm text-green-700">
                            You have full access to move-out and deposit recovery features.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 3.5: Short-Stay pack purchased - Show success banner
    if (currentPack === 'short_stay') {
        return (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 flex-shrink-0">
                        <CheckCircle size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-green-900">Short-Stay Pack Active</h3>
                        <p className="text-sm text-green-700">
                            Your arrival and departure evidence is protected for 30 days after check-out.
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 3.6: Short-stay case with no pack - Show short-stay specific upsell
    if (stayType === 'short_stay' && !currentPack) {
        return (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Shield size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1 text-slate-900">Protect your short-stay evidence</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            Save your arrival and departure photos with timestamps. Stored for 30 days after check-out.
                        </p>
                        <button
                            onClick={() => handlePurchase('short_stay')}
                            disabled={loading === 'short_stay'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center gap-2"
                        >
                            {loading === 'short_stay' ? 'Loading...' : (
                                <>Short-Stay Pack €5.99 <ArrowRight size={16} /></>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // CASE 4: No pack (Free/Preview) - Show all options
    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Shield size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-slate-900">Save and protect your data</h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Get unlimited contract questions, translations, PDF exports, and 12 months of secure storage.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => handlePurchase('checkin')}
                            disabled={loading === 'checkin'}
                            className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading === 'checkin' ? 'Loading...' : 'Check-In Pack €19'}
                        </button>
                        <button
                            onClick={() => handlePurchase('bundle')}
                            disabled={loading === 'bundle'}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading === 'bundle' ? 'Loading...' : 'Full Pack €39'}
                        </button>
                        <button
                            onClick={() => handlePurchase('moveout')}
                            disabled={loading === 'moveout'}
                            className="px-4 py-2 bg-white border-2 border-blue-200 text-blue-700 rounded-lg font-medium hover:bg-blue-50 hover:border-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {loading === 'moveout' ? 'Loading...' : 'Move-Out Pack €29'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
