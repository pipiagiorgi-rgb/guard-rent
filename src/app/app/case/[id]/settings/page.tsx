'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Shield, Trash2, AlertTriangle, Lock,
    Clock, FileText, Loader2, Check
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DataState {
    rentalLabel: string
    photoCount: number
    retentionUntil: string | null
    createdAt: string
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
        createdAt: ''
    })
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
                .select('label, retention_until, created_at')
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
                    retentionUntil: caseData.retention_until,
                    createdAt: caseData.created_at
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

            router.push('/app')
        } catch (err) {
            console.error('Delete error:', err)
            setDeleting(false)
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
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold mb-1">Data & retention</h1>
                <p className="text-slate-500">
                    Understand how your data is stored and manage deletion.
                </p>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION A: STORAGE OVERVIEW
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Shield className="text-blue-600" size={20} />
                    </div>
                    <h2 className="font-semibold text-lg">How your data is stored</h2>
                </div>

                <div className="space-y-3 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                        <Lock size={16} className="text-slate-400" />
                        <span>All files are stored in a private, encrypted bucket</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Shield size={16} className="text-slate-400" />
                        <span>Data is encrypted in transit (TLS) and at rest</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <FileText size={16} className="text-slate-400" />
                        <span>Only you can access your files</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION B: RETENTION STATUS
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                        <Clock className="text-amber-600" size={20} />
                    </div>
                    <h2 className="font-semibold text-lg">Retention status</h2>
                </div>

                {data.retentionUntil ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-700">
                            <Check size={18} />
                            <span className="font-medium">Secure retention active</span>
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                            Your data is securely stored until{' '}
                            <span className="font-medium">
                                {new Date(data.retentionUntil).toLocaleDateString('en-GB', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </span>
                        </p>
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-amber-800">
                            Your data is stored temporarily. Purchase a pack in Exports to extend secure retention for 12 months.
                        </p>
                    </div>
                )}

                <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500">
                    <div className="flex justify-between">
                        <span>Rental created</span>
                        <span>{new Date(data.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                        <span>Files stored</span>
                        <span>{data.photoCount} files</span>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION C: DELETION CONTROLS
            ═══════════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Trash2 className="text-red-600" size={20} />
                    </div>
                    <h2 className="font-semibold text-lg">Delete data</h2>
                </div>

                <p className="text-sm text-slate-600 mb-6">
                    You have full control over your data. Deletion is permanent and cannot be undone.
                </p>

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

            {/* Disclaimer */}
            <p className="text-xs text-slate-400 text-center pt-4">
                RentVault securely stores and organises your rental documents. Not legal advice.
            </p>
        </div>
    )
}
