'use client'

import { useState } from 'react'
import { Shield } from 'lucide-react'

interface UpgradeBannerProps {
    caseId: string
    currentPack?: string | null
}

export function UpgradeBanner({ caseId, currentPack }: UpgradeBannerProps) {
    const [loading, setLoading] = useState<string | null>(null)

    // Don't show if already has a pack
    if (currentPack) {
        return null
    }

    const handlePurchase = async (packType: 'checkin' | 'bundle' | 'moveout') => {
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
                            {loading === 'bundle' ? 'Loading...' : 'Full Bundle €39'}
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
