'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText,
    Plus,
    Wifi,
    Zap,
    Flame,
    Car,
    Shield,
    Package,
    Calendar,
    Bell,
    Trash2,
    Loader2,
    Lock,
    ExternalLink
} from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'

interface RelatedContract {
    contract_id: string
    contract_type: string
    custom_type?: string
    provider_name?: string
    start_date?: string
    end_date?: string
    notice_period_days?: number
    notice_period_source?: string
    file_name?: string
    created_at: string
}

interface RelatedContractsSectionProps {
    caseId: string
}

const CONTRACT_TYPES = [
    { value: 'internet', label: 'Internet', icon: Wifi },
    { value: 'electricity', label: 'Electricity', icon: Zap },
    { value: 'gas', label: 'Gas', icon: Flame },
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'insurance', label: 'Insurance', icon: Shield },
    { value: 'storage', label: 'Storage unit', icon: Package },
    { value: 'other', label: 'Other', icon: FileText },
]

export function RelatedContractsSection({ caseId }: RelatedContractsSectionProps) {
    const [contracts, setContracts] = useState<RelatedContract[]>([])
    const [purchased, setPurchased] = useState(false)
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Form state
    const [newContract, setNewContract] = useState({
        contractType: 'internet',
        customType: '',
        providerName: '',
        startDate: '',
        endDate: '',
        noticePeriodDays: '',
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        loadContracts()
    }, [caseId])

    const loadContracts = async () => {
        try {
            const res = await fetch(`/api/related-contracts?caseId=${caseId}`)
            const data = await res.json()
            setContracts(data.contracts || [])
            setPurchased(data.purchased || false)
        } catch (err) {
            console.error('Failed to load related contracts:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        setPurchasing(true)
        try {
            const res = await fetch('/api/checkout/related-contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Failed to start checkout:', err)
        } finally {
            setPurchasing(false)
        }
    }

    const handleAddContract = async () => {
        if (!newContract.contractType) return

        setSaving(true)
        try {
            const res = await fetch('/api/related-contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    contractType: newContract.contractType,
                    customType: newContract.customType || null,
                    providerName: newContract.providerName || null,
                    startDate: newContract.startDate || null,
                    endDate: newContract.endDate || null,
                    noticePeriodDays: newContract.noticePeriodDays ? parseInt(newContract.noticePeriodDays) : null,
                    noticePeriodSource: newContract.noticePeriodDays ? 'manual' : null
                })
            })

            if (res.ok) {
                await loadContracts()
                setShowAddModal(false)
                setNewContract({
                    contractType: 'internet',
                    customType: '',
                    providerName: '',
                    startDate: '',
                    endDate: '',
                    noticePeriodDays: '',
                })
            }
        } catch (err) {
            console.error('Failed to add contract:', err)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            await fetch(`/api/related-contracts/${deleteId}`, { method: 'DELETE' })
            await loadContracts()
        } catch (err) {
            console.error('Failed to delete contract:', err)
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    const getTypeIcon = (type: string) => {
        const found = CONTRACT_TYPES.find(t => t.value === type)
        return found ? found.icon : FileText
    }

    const getTypeLabel = (type: string, customType?: string) => {
        if (type === 'other' && customType) return customType
        const found = CONTRACT_TYPES.find(t => t.value === type)
        return found ? found.label : type
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                    <span className="text-slate-500">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-slate-400" />
                            Related contracts
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">optional</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Track contracts like internet or utilities.
                        </p>
                    </div>
                    {purchased && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} />
                            Add contract
                        </button>
                    )}
                </div>

                {/* REQUIRED DISCLAIMER */}
                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <Bell size={12} />
                    Stored for reference and reminders only. Not sealed evidence.
                </p>
            </div>

            {/* Content */}
            <div className="p-6">
                {!purchased ? (
                    // Upsell state
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Lock size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">Track your utility contracts</h3>
                        <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                            Store internet, electricity, and other service contracts.
                            Get reminders for notice periods before they auto-renew.
                        </p>
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {purchasing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                'Unlock for €9'
                            )}
                        </button>
                        <p className="text-xs text-slate-400 mt-2">One-time payment</p>
                    </div>
                ) : contracts.length === 0 ? (
                    // Empty state
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-blue-500" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">No contracts added yet</h3>
                        <p className="text-sm text-slate-500 mb-4">
                            Add your utility and service contracts to track them.
                        </p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus size={16} className="inline mr-1" />
                            Add your first contract
                        </button>
                    </div>
                ) : (
                    // Contract list
                    <div className="space-y-3">
                        {contracts.map((contract) => {
                            const Icon = getTypeIcon(contract.contract_type)
                            return (
                                <div
                                    key={contract.contract_id}
                                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200">
                                            <Icon size={20} className="text-slate-600" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">
                                                {getTypeLabel(contract.contract_type, contract.custom_type)}
                                                {contract.provider_name && (
                                                    <span className="text-slate-500 font-normal"> — {contract.provider_name}</span>
                                                )}
                                            </p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                                {contract.end_date && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        Ends {new Date(contract.end_date).toLocaleDateString('en-GB')}
                                                    </span>
                                                )}
                                                {contract.notice_period_days && (
                                                    <span className="flex items-center gap-1">
                                                        <Bell size={12} />
                                                        {contract.notice_period_days} days notice
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDeleteId(contract.contract_id)}
                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-slate-900 mb-4">Add related contract</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                <select
                                    value={newContract.contractType}
                                    onChange={(e) => setNewContract({ ...newContract, contractType: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {CONTRACT_TYPES.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {newContract.contractType === 'other' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Custom type</label>
                                    <input
                                        type="text"
                                        value={newContract.customType}
                                        onChange={(e) => setNewContract({ ...newContract, customType: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. Water, Gym membership"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Provider name</label>
                                <input
                                    type="text"
                                    value={newContract.providerName}
                                    onChange={(e) => setNewContract({ ...newContract, providerName: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. Vodafone, EDF"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
                                    <input
                                        type="date"
                                        value={newContract.startDate}
                                        onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
                                    <input
                                        type="date"
                                        value={newContract.endDate}
                                        onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Notice period (days)</label>
                                <input
                                    type="number"
                                    value={newContract.noticePeriodDays}
                                    onChange={(e) => setNewContract({ ...newContract, noticePeriodDays: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. 30"
                                />
                                <p className="text-xs text-slate-500 mt-1">Only enter if explicitly stated in your contract</p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddContract}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {saving ? 'Saving...' : 'Add contract'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete contract"
                description="Are you sure you want to delete this contract? This is a reference document only (not evidence)."
            />
        </div>
    )
}
