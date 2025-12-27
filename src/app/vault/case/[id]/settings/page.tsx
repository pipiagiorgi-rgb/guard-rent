'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Shield, Trash2, AlertTriangle, Lock,
    Clock, FileText, Loader2, Check, Pencil
} from 'lucide-react'
import { Footer } from '@/components/layout/Footer'
import { useRouter } from 'next/navigation'

interface DataState {
    rentalLabel: string
    photoCount: number
    retentionUntil: string | null
    createdAt: string
    purchaseType: string | null
    storageYears: number
}

export default function DataRetentionPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [deleting, setDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<'rental' | 'files' | null>(null)
    const [confirmText, setConfirmText] = useState('')
    const [data, setData] = useState<DataState>({
        rentalLabel: '',
        photoCount: 0,
        retentionUntil: null,
        createdAt: '',
        purchaseType: null,
        storageYears: 0
    })
    const [editingName, setEditingName] = useState(false)
    const [newName, setNewName] = useState('')
    const [savingName, setSavingName] = useState(false)
    const [nameSaved, setNameSaved] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function load() {
            const { id } = await params
            setCaseId(id)
            await loadData(id)
        }
        load()
    }, [params])

    const loadData = async (id: string) => {
        setLoading(true)
        try {
            const supabase = createClient()

            const { data: caseData } = await supabase
                .from('cases')
                .select('label, retention_until, created_at, purchase_type, storage_years_purchased, storage_expires_at')
                .eq('case_id', id)
                .single()

            const { count } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', id)

            if (caseData) {
                setData({
                    rentalLabel: caseData.label,
                    photoCount: count || 0,
                    retentionUntil: caseData.storage_expires_at || caseData.retention_until,
                    createdAt: caseData.created_at,
                    purchaseType: caseData.purchase_type,
                    storageYears: caseData.storage_years_purchased || 0
                })
            }
        } catch (err) {
            console.error('Failed to load data:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteFiles = async () => {
        if (confirmText !== 'DELETE') return
        setDeleting(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get all assets for this case
            const { data: assets } = await supabase
                .from('assets')
                .select('asset_id, storage_path')
                .eq('case_id', caseId)

            if (assets && assets.length > 0) {
                // Delete from storage
                const paths = assets.map(a => a.storage_path)
                await supabase.storage.from('guard-rent').remove(paths)

                // Delete asset records
                await supabase
                    .from('assets')
                    .delete()
                    .eq('case_id', caseId)



                // Log to audit
                await supabase.from('deletion_audit').insert({
                    case_id: caseId,
                    reason: 'user_request',
                    objects_deleted: assets.length
                })
            }

            // Reset completion timestamps to unlock flow (ALWAYS run this)
            await supabase
                .from('cases')
                .update({
                    checkin_completed_at: null,
                    handover_completed_at: null
                })
                .eq('case_id', caseId)

            setShowDeleteConfirm(null)
            setConfirmText('')
            await loadData(caseId)
        } catch (err) {
            console.error('Delete error:', err)
        } finally {
            setDeleting(false)
        }
    }

    const handleDeleteRental = async () => {
        if (confirmText !== 'DELETE') return
        setDeleting(true)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get all assets
            const { data: assets } = await supabase
                .from('assets')
                .select('storage_path')
                .eq('case_id', caseId)

            // Delete from storage
            if (assets && assets.length > 0) {
                await supabase.storage.from('guard-rent').remove(assets.map(a => a.storage_path))
            }

            // Delete the case (cascades to rooms, assets, deadlines, etc.)
            await supabase
                .from('cases')
                .delete()
                .eq('case_id', caseId)

            // Log to audit
            await supabase.from('deletion_audit').insert({
                case_id: caseId,
                reason: 'user_request',
                objects_deleted: (assets?.length || 0) + 1
            })

            router.push('/vault')
        } catch (err) {
            console.error('Delete error:', err)
            setDeleting(false)
        }
    }

    const handleRename = async () => {
        if (!newName.trim() || newName.trim() === data.rentalLabel) {
            setEditingName(false)
            return
        }
        setSavingName(true)
        try {
            const supabase = createClient()
            await supabase
                .from('cases')
                .update({ label: newName.trim() })
                .eq('case_id', caseId)

            setData(prev => ({ ...prev, rentalLabel: newName.trim() }))
            setEditingName(false)
            setNameSaved(true)
            setTimeout(() => setNameSaved(false), 2000)
        } catch (err) {
            console.error('Rename error:', err)
        } finally {
            setSavingName(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">Data</h1>
                <p className="text-slate-500">
                    Your rental data, retention status, and control options.
                </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 1: RENTAL METADATA (Context, not action)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Pencil className="text-slate-600" size={18} />
                        </div>
                        <div>
                            {editingName ? (
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter rental name"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                    />
                                    <button
                                        onClick={handleRename}
                                        disabled={savingName}
                                        className="p-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {savingName ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setEditingName(false)}
                                        className="p-1.5 text-slate-400 hover:text-slate-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="font-semibold text-slate-900">{data.rentalLabel}</p>
                                    <p className="text-sm text-slate-500">
                                        Created {new Date(data.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} · {data.photoCount} files
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {!editingName && (
                        <button
                            onClick={() => {
                                setNewName(data.rentalLabel)
                                setEditingName(true)
                            }}
                            className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                            <Pencil size={14} />
                            Rename
                        </button>
                    )}
                </div>
                {nameSaved && (
                    <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                        <Check size={12} /> Name saved
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 2: RETENTION STATUS (Primary focus)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${data.purchaseType ? 'bg-blue-50' : 'bg-slate-100'}`}>
                        <Clock className={data.purchaseType ? 'text-blue-600' : 'text-slate-500'} size={20} />
                    </div>
                    <h2 className="font-semibold text-lg">Retention status</h2>
                </div>

                {(() => {
                    const now = new Date()
                    const retentionExpiry = data.retentionUntil ? new Date(data.retentionUntil) : null
                    const formatDate = (date: Date) => date.toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'long', year: 'numeric'
                    })

                    // STATE A: Preview (no pack purchased)
                    if (!data.purchaseType) {
                        return (
                            <div className="bg-slate-50 border border-slate-100 rounded-lg p-4">
                                <p className="font-medium text-slate-700 mb-1">Preview mode</p>
                                <p className="text-sm text-slate-600">
                                    Your records are stored temporarily while you explore RentVault.
                                </p>
                                <p className="text-sm text-slate-500 mt-2">
                                    Purchase a pack in Exports to unlock 12-month secure retention.
                                </p>
                            </div>
                        )
                    }

                    // STATE D: Expired
                    if (retentionExpiry && retentionExpiry < now) {
                        return (
                            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                                <p className="font-medium text-amber-800 mb-1">Retention expired</p>
                                <p className="text-sm text-amber-700">
                                    Your retention period ended on {formatDate(retentionExpiry)}.
                                    Download any remaining files or extend storage.
                                </p>
                            </div>
                        )
                    }

                    // STATE B: Active
                    return (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                            <p className="font-medium text-blue-800 mb-1">Storage active</p>
                            <p className="text-sm text-blue-700">
                                Stored securely until{' '}
                                <span className="font-medium">
                                    {retentionExpiry ? formatDate(retentionExpiry) : 'your retention period ends'}
                                </span>.
                                {data.storageYears > 1 && ` (${data.storageYears} years total)`}
                            </p>
                            <p className="text-xs text-blue-600 mt-2">
                                You'll be notified in advance if any action is needed.
                            </p>
                        </div>
                    )
                })()}
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 3: STORAGE & SECURITY (Collapsible, informational)
            ═══════════════════════════════════════════════════════════════ */}
            <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                <summary className="p-5 cursor-pointer list-none flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Shield className="text-slate-500" size={20} />
                        </div>
                        <span className="font-semibold text-lg text-slate-900">How your data is stored</span>
                    </div>
                    <span className="text-slate-400 group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <div className="px-5 pb-5 pt-2 border-t border-slate-100">
                    <div className="space-y-3 text-sm text-slate-600">
                        <div className="flex items-center gap-3">
                            <Lock size={16} className="text-slate-400 flex-shrink-0" />
                            <span>All files are stored in a private, encrypted bucket</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Shield size={16} className="text-slate-400 flex-shrink-0" />
                            <span>Data is encrypted in transit (TLS) and at rest</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <FileText size={16} className="text-slate-400 flex-shrink-0" />
                            <span>Only you can access your files</span>
                        </div>
                    </div>
                </div>
            </details>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION 4: DATA CONTROL (Destructive actions, isolated)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="pt-4 border-t border-slate-200">
                <div className="bg-white rounded-xl border border-slate-200 p-5">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                            <Trash2 className="text-red-600" size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg">Data control</h2>
                            <p className="text-sm text-slate-500">Permanent actions — cannot be undone</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowDeleteConfirm('files')}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-left hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium text-slate-900">Delete all files</span>
                                    <p className="text-sm text-slate-500">Remove all photos and documents</p>
                                </div>
                                <Trash2 className="text-slate-400" size={18} />
                            </div>
                        </button>

                        <button
                            onClick={() => setShowDeleteConfirm('rental')}
                            className="w-full px-4 py-3 border border-red-200 bg-red-50 rounded-xl text-left hover:bg-red-100 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="font-medium text-red-900">Delete this rental</span>
                                    <p className="text-sm text-red-700">Permanently remove all data for "{data.rentalLabel}"</p>
                                </div>
                                <Trash2 className="text-red-600" size={18} />
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">
                                    {showDeleteConfirm === 'rental' ? 'Delete rental?' : 'Delete all files?'}
                                </h3>
                                <p className="text-sm text-slate-500">This action cannot be undone</p>
                            </div>
                        </div>

                        <p className="text-slate-600 mb-4">
                            {showDeleteConfirm === 'rental'
                                ? `This will permanently delete "${data.rentalLabel}" and all associated data including photos, contract analysis, and reminders.`
                                : `This will permanently delete all ${data.photoCount} files associated with this rental.`}
                        </p>

                        <div className="mb-4">
                            <label className="text-sm text-slate-600 block mb-2">
                                Type <span className="font-mono font-bold">DELETE</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={confirmText}
                                onChange={(e) => setConfirmText(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-red-500"
                                placeholder="DELETE"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowDeleteConfirm(null); setConfirmText('') }}
                                className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={showDeleteConfirm === 'rental' ? handleDeleteRental : handleDeleteFiles}
                                disabled={confirmText !== 'DELETE' || deleting}
                                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {deleting ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Trash2 size={18} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </div>
    )
}
