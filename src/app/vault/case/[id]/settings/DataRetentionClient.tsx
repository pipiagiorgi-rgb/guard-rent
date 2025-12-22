'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Trash2, Download, Shield, Info, Clock, CheckCircle } from 'lucide-react'

interface DataRetentionClientProps {
    caseId: string
    retentionUntil: string
    showExtensionSuggestion: boolean
    retentionEndingSoon: boolean
    extensionCount: number
}

export default function DataRetentionClient({
    caseId,
    retentionUntil,
    showExtensionSuggestion,
    retentionEndingSoon,
    extensionCount
}: DataRetentionClientProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showExtendModal, setShowExtendModal] = useState(false)
    const [extending, setExtending] = useState(false)
    const searchParams = useSearchParams()
    const extended = searchParams.get('extended')

    const retentionDate = new Date(retentionUntil)

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const handleDelete = async () => {
        // Call server action to delete
        alert("Deletion initiated.")
        setShowDeleteModal(false)
    }

    const handleDownload = async () => {
        alert("Download all files coming soon.")
    }

    const handleExtendStorage = async () => {
        setExtending(true)
        try {
            const res = await fetch('/api/checkout/extend-storage', {
                method: 'POST',
                body: JSON.stringify({ caseId })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                alert('Failed to start checkout')
            }
        } catch (e) {
            console.error(e)
            alert('Error connecting to payment server')
        } finally {
            setExtending(false)
            setShowExtendModal(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">Data & retention</h1>
                <p className="text-slate-500 text-sm">Manage your rental data and privacy.</p>
            </div>

            {/* Extension success message */}
            {extended && (
                <div className="p-4 bg-green-50 text-green-800 rounded-xl flex items-center gap-3">
                    <CheckCircle size={20} />
                    <span className="font-medium">Storage extended until {formatDate(retentionDate)}</span>
                </div>
            )}

            {/* Privacy info */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                        <Shield size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold mb-1">Your data is private</h3>
                        <p className="text-slate-600 text-sm">
                            Your documents for this rental are stored securely for 12 months.
                        </p>
                        <p className="text-slate-600 text-sm mt-1">
                            You can delete this rental at any time.
                        </p>
                    </div>
                </div>
            </div>

            {/* Retention status - calm, neutral */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                        <Clock size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold">Storage status</h3>
                    </div>
                </div>
                <p className="text-slate-900 font-medium">
                    Your records are available until {formatDate(retentionDate)}
                </p>
                {extensionCount > 0 && (
                    <p className="text-sm text-slate-500 mt-1">
                        Extended {extensionCount} time{extensionCount > 1 ? 's' : ''}
                    </p>
                )}

                {/* Soft option - always available, not just when ending soon */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                    <button
                        onClick={() => setShowExtendModal(true)}
                        className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        Keep records longer — €9/year
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                        Adds 12 months. One-time payment per rental, no auto-renewal.
                    </p>
                </div>
            </div>

            {/* Gentle nudge only when ending soon - still calm */}
            {retentionEndingSoon && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 flex-shrink-0">
                            <Info size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-1">Your storage period ends soon</h3>
                            <p className="text-blue-700 text-sm mb-3">
                                Your documents remain fully accessible until then. If you'd like to keep them available after, you can extend anytime.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                <h3 className="font-semibold">Actions</h3>

                <button
                    onClick={handleDownload}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                >
                    <Download size={18} />
                    Download all files
                </button>
            </div>

            {/* Delete */}
            <div className="bg-white p-5 rounded-xl border-2 border-red-200">
                <h3 className="font-semibold text-red-600 mb-2">Delete this rental</h3>
                <p className="text-slate-600 text-sm mb-4">
                    This will permanently remove all files, photos, and data associated with this rental.
                </p>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                >
                    <Trash2 size={16} />
                    Delete rental
                </button>
            </div>

            {/* Delete Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-3">Delete this rental?</h2>
                        <p className="text-slate-600 mb-2">
                            This will permanently remove all documents, photos, and generated reports for this rental.
                        </p>
                        <p className="text-slate-600 text-sm mb-6">
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors"
                            >
                                Delete rental
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Extension Modal - value-driven, calm */}
            {showExtendModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
                        <h2 className="text-xl font-bold mb-3">Keep your rental records</h2>
                        <p className="text-slate-600 mb-4">
                            Continue secure storage for this rental so your documents stay available when you need them.
                        </p>
                        <div className="bg-slate-50 p-4 rounded-xl mb-4">
                            <div className="flex justify-between mb-2">
                                <span className="font-medium">Storage extension</span>
                                <span className="font-bold">€9/year</span>
                            </div>
                            <p className="text-sm text-slate-500">+12 months from today. Per rental.</p>
                        </div>
                        <p className="text-sm text-slate-500 mb-6">
                            One-time payment. No subscriptions, no auto-renewal.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExtendModal(false)}
                                className="flex-1 py-3 border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                            >
                                Maybe later
                            </button>
                            <button
                                onClick={handleExtendStorage}
                                disabled={extending}
                                className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                            >
                                {extending ? 'Processing...' : 'Continue storage'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
