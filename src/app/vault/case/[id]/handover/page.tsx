'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Camera, Check, Loader2, Upload, FileText,
    Key, Gauge, ChevronDown, ChevronUp, AlertCircle,
    X, ImageIcon, Eye, Lock, CheckCircle2, Plus, ShieldCheck, ArrowRight
} from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { LockConfirmationModal } from '@/components/ui/LockConfirmationModal'
import { isPurchased } from '@/lib/preview-limits'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'
import { WalkthroughVideoUpload } from '@/components/features/WalkthroughVideoUpload'

interface Room {
    room_id: string
    name: string
    handover_photos: number
    checkin_photos: number
    photos: Asset[]
}

interface Asset {
    asset_id: string
    storage_path: string
    created_at: string
    room_name?: string
}

interface MeterReading {
    value: string
    asset_id?: string
    photo_url?: string
}

interface HandoverState {
    keysReturned: boolean
    keysConfirmedAt: string | null
    meterReadings: {
        electricity?: MeterReading
        gas?: MeterReading
        water?: MeterReading
    }
    notes: string
    completedAt: string | null
}

export default function HandoverPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [rooms, setRooms] = useState<Room[]>([])
    const [handover, setHandover] = useState<HandoverState>({
        keysReturned: false,
        keysConfirmedAt: null,
        meterReadings: {},
        notes: '',
        completedAt: null
    })
    const [uploading, setUploading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
    const [hasPack, setHasPack] = useState(false)
    const [showEditWarning, setShowEditWarning] = useState(false)
    const [allowEdit, setAllowEdit] = useState(false)
    const [depositProof, setDepositProof] = useState<Asset | null>(null)

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<{ src: string; caption: string; subcaption: string }[]>([])

    // Delete confirmation state
    const [photoToDelete, setPhotoToDelete] = useState<Asset | null>(null)

    // Lock confirmation modals
    const [showKeysModal, setShowKeysModal] = useState(false)
    const [showLockModal, setShowLockModal] = useState(false)

    // Walkthrough video state
    const [existingVideo, setExistingVideo] = useState<{
        assetId: string
        fileName: string
        durationSeconds?: number
        uploadedAt: string
        fileHash?: string
    } | undefined>(undefined)

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

            // Fetch case handover data and purchase status
            const { data: caseData } = await supabase
                .from('cases')
                .select('handover_notes, handover_completed_at, keys_returned_at, meter_readings, purchase_type')
                .eq('case_id', id)
                .single()


            if (caseData) {
                // Check if user has purchased a pack (or is admin)
                try {
                    const statusRes = await fetch(`/api/exports/status?caseId=${id}`)
                    if (statusRes.ok) {
                        const status = await statusRes.json()
                        // Admin or has deposit_pack or bundle_pack unlocks handover
                        const hasHandoverAccess = status.isAdmin ||
                            status.purchasedPacks?.includes('deposit_pack') ||
                            status.purchasedPacks?.includes('bundle_pack')
                        setHasPack(hasHandoverAccess)
                    } else {
                        // Fallback to purchase_type column
                        setHasPack(caseData.purchase_type === 'bundle' || caseData.purchase_type === 'moveout')
                    }
                } catch {
                    // Fallback to purchase_type column
                    setHasPack(caseData.purchase_type === 'bundle' || caseData.purchase_type === 'moveout')
                }
            }

            // Fetch rooms
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('room_id, name')
                .eq('case_id', id)
                .order('created_at')

            if (roomsData) {
                // Fetch assets separately and map (including meter photos)
                const { data: assets } = await supabase
                    .from('assets')
                    .select('*')
                    .eq('case_id', id)
                    .in('type', ['handover_photo', 'deposit_proof', 'meter_photo'])
                    .order('created_at', { ascending: false })

                const dp = assets?.find(a => a.type === 'deposit_proof') || null
                setDepositProof(dp)

                const meterPhotoAssets = assets?.filter(a => a.type === 'meter_photo') || []

                // Generate signed URLs for all assets
                let signedMap = new Map<string, string>()
                if (assets && assets.length > 0) {
                    const paths = assets.map(a => a.storage_path)
                    const { data: signedData } = await supabase.storage
                        .from('guard-rent')
                        .createSignedUrls(paths, 3600) // 1 hour

                    if (signedData) {
                        signedData.forEach(item => {
                            if (item.path && item.signedUrl) {
                                signedMap.set(item.path, item.signedUrl)
                            }
                        })
                    }
                }

                // Update meter readings with signed URLs
                if (caseData) {
                    const rawMeters = caseData.meter_readings || {}
                    const updatedMeterReadings: HandoverState['meterReadings'] = {}

                    const processReading = (val: any): MeterReading | undefined => {
                        if (!val) return undefined
                        if (typeof val === 'string') return { value: val }
                        const reading = val as MeterReading
                        // Find the meter photo asset and get its signed URL
                        if (reading.asset_id) {
                            const meterAsset = meterPhotoAssets.find(a => a.asset_id === reading.asset_id)
                            if (meterAsset) {
                                reading.photo_url = signedMap.get(meterAsset.storage_path) || undefined
                            }
                        }
                        return reading
                    }

                    if (rawMeters.electricity) updatedMeterReadings.electricity = processReading(rawMeters.electricity)
                    if (rawMeters.gas) updatedMeterReadings.gas = processReading(rawMeters.gas)
                    if (rawMeters.water) updatedMeterReadings.water = processReading(rawMeters.water)

                    setHandover({
                        keysReturned: !!caseData.keys_returned_at,
                        keysConfirmedAt: caseData.keys_returned_at,
                        meterReadings: updatedMeterReadings,
                        notes: caseData.handover_notes || '',
                        completedAt: caseData.handover_completed_at
                    })
                }

                // Also fetch check-in photos to show count for before/after comparison
                const { data: checkinAssets } = await supabase
                    .from('assets')
                    .select('room_id')
                    .eq('case_id', id)
                    .eq('type', 'photo')

                const roomsWithPhotos = roomsData.map(room => {
                    const roomAssets = assets?.filter(a => a.room_id === room.room_id && a.type === 'handover_photo') || []
                    const checkinCount = checkinAssets?.filter(a => a.room_id === room.room_id).length || 0
                    return {
                        ...room,
                        handover_photos: roomAssets.length,
                        checkin_photos: checkinCount,
                        photos: roomAssets
                    }
                })
                setRooms(roomsWithPhotos)

                // Fetch existing walkthrough video for handover
                const { data: videoAsset } = await supabase
                    .from('assets')
                    .select('asset_id, storage_path, duration_seconds, file_hash, created_at')
                    .eq('case_id', id)
                    .eq('type', 'walkthrough_video')
                    .eq('phase', 'handover')
                    .single()

                if (videoAsset) {
                    setExistingVideo({
                        assetId: videoAsset.asset_id,
                        fileName: videoAsset.storage_path.split('/').pop() || 'walkthrough.mp4',
                        durationSeconds: videoAsset.duration_seconds,
                        uploadedAt: videoAsset.created_at,
                        fileHash: videoAsset.file_hash
                    })
                } else {
                    setExistingVideo(undefined)
                }
            }
        } catch (err) {
            console.error('Failed to load handover data:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleSection = (section: string) => {
        const next = new Set(expandedSections)
        next.has(section) ? next.delete(section) : next.add(section)
        setExpandedSections(next)
    }

    const handlePhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        setUploading(roomId)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            for (const file of Array.from(files)) {
                const res = await fetch('/api/assets/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId,
                        filename: file.name,
                        mimeType: file.type,
                        type: 'handover_photo',
                        roomId
                    })
                })

                if (!res.ok) throw new Error('Failed to get upload URL')
                const { signedUrl, assetId, storagePath } = await res.json()

                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    body: file,
                    headers: { 'Content-Type': file.type }
                })

                if (!uploadRes.ok) throw new Error('Upload failed')

                await supabase
                    .from('assets')
                    .update({ room_id: roomId })
                    .eq('asset_id', assetId)

                // Optimistic update: add photo to local state
                const previewUrl = URL.createObjectURL(file)
                setRooms(prev => prev.map(room =>
                    room.room_id === roomId
                        ? {
                            ...room,
                            handover_photos: room.handover_photos + 1,
                            photos: [...room.photos, {
                                asset_id: assetId,
                                storage_path: storagePath || '',
                                created_at: new Date().toISOString()
                            }]
                        }
                        : room
                ))
            }
        } catch (err: any) {
            setError('Failed to upload photo')
        } finally {
            setUploading(null)
            e.target.value = ''
        }
    }

    const handleMeterPhotoUpload = async (type: keyof HandoverState['meterReadings'], e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        setUploading(`meter-${type}`)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Get signed upload URL
            const res = await fetch('/api/assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    filename: file.name,
                    mimeType: file.type,
                    type: 'meter_photo', // Reuse same type or 'handover_meter_photo' if we want distinction? 'meter_photo' is generic enough.
                })
            })

            if (!res.ok) throw new Error('Failed to get upload URL')
            const { signedUrl, assetId } = await res.json()

            // Upload directly to storage
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const previewUrl = URL.createObjectURL(file)

            setHandover(prev => {
                const current = prev.meterReadings[type] || { value: '' }
                const updated = {
                    ...prev,
                    meterReadings: {
                        ...prev.meterReadings,
                        [type]: { ...current, asset_id: assetId, photo_url: previewUrl }
                    }
                }

                // Trigger save
                handleSaveMeters(updated.meterReadings)
                return updated
            })

        } catch (err) {
            console.error('Meter upload error:', err)
            setError('Failed to upload meter photo')
        } finally {
            setUploading(null)
            e.target.value = ''
        }
    }

    const handleDepositUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return
        const file = files[0]
        setUploading('deposit')
        setError(null)

        try {
            const res = await fetch('/api/assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    filename: file.name,
                    mimeType: file.type,
                    type: 'deposit_proof',
                })
            })

            if (!res.ok) throw new Error('Failed to get upload URL')
            const { signedUrl, assetId, storagePath } = await res.json()

            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            // Verify
            await fetch('/api/assets/confirm-upload', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ assetId, caseId })
            })

            // Optimistic update: set deposit proof in local state
            setDepositProof({
                asset_id: assetId,
                storage_path: storagePath || '',
                created_at: new Date().toISOString()
            })

        } catch (err: any) {
            console.error('Deposit upload error:', err)
            setError('Failed to upload proof of deposit')
        } finally {
            setUploading(null)
            e.target.value = ''
        }
    }

    const removeMeterPhoto = async (type: keyof HandoverState['meterReadings']) => {
        setHandover(prev => {
            const current = prev.meterReadings[type]
            if (!current) return prev

            const updated = {
                ...prev,
                meterReadings: {
                    ...prev.meterReadings,
                    [type]: { ...current, asset_id: undefined, photo_url: undefined }
                }
            }
            handleSaveMeters(updated.meterReadings)
            return updated
        })
    }

    const handleSaveNotes = async () => {
        setSaving(true)
        try {
            const supabase = createClient()
            await supabase
                .from('cases')
                .update({ handover_notes: handover.notes })
                .eq('case_id', caseId)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleSaveMeters = async (readingsOverride?: HandoverState['meterReadings']) => {
        setSaving(true)
        try {
            const readings = readingsOverride || handover.meterReadings
            const supabase = createClient()
            await supabase
                .from('cases')
                .update({ meter_readings: readings })
                .eq('case_id', caseId)
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const updateMeterValue = (type: keyof HandoverState['meterReadings'], value: string) => {
        setHandover(prev => {
            const current = prev.meterReadings[type] || { value: '' }
            return {
                ...prev,
                meterReadings: {
                    ...prev.meterReadings,
                    [type]: { ...current, value }
                }
            }
        })
    }

    const handleConfirmKeys = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/cases/${caseId}/confirm-keys`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to confirm keys')
            const { timestamp } = await res.json()
            setHandover(prev => ({ ...prev, keysReturned: true, keysConfirmedAt: timestamp }))
        } catch (err) {
            console.error(err)
            setError('Failed to confirm keys')
        } finally {
            setSaving(false)
            setShowKeysModal(false)
        }
    }

    const handleMarkComplete = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/cases/${caseId}/lock-handover`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to lock handover')
            const { timestamp } = await res.json()
            setHandover(prev => ({ ...prev, completedAt: timestamp }))
        } catch (err) {
            console.error(err)
            setError('Failed to lock handover')
        } finally {
            setSaving(false)
            setShowLockModal(false)
        }
    }

    const openRoomGallery = async (room: Room, startIndex: number = 0) => {
        const supabase = createClient()

        const imagesWithUrls = await Promise.all(room.photos.map(async (p) => {
            const { data } = await supabase.storage.from('guard-rent').createSignedUrl(p.storage_path, 3600)
            return {
                src: data?.signedUrl || '',
                caption: room.name,
                subcaption: `Handover • ${new Date(p.created_at).toLocaleString()}`
            }
        }))

        setLightboxImages(imagesWithUrls.filter(i => i.src))
        setLightboxOpen(true)
    }

    const handleDeletePhoto = async (photo: Asset) => {
        // Show confirmation modal instead of browser confirm
        setPhotoToDelete(photo)
    }

    const confirmDeletePhoto = async () => {
        if (!photoToDelete) return

        const deletedPhoto = photoToDelete
        setPhotoToDelete(null)

        // Optimistic update: remove photo from local state immediately
        setRooms(prev => prev.map(room => ({
            ...room,
            photos: room.photos.filter(p => p.asset_id !== deletedPhoto.asset_id),
            handover_photos: room.photos.some(p => p.asset_id === deletedPhoto.asset_id)
                ? room.handover_photos - 1
                : room.handover_photos
        })))

        try {
            const supabase = createClient()

            // Delete from storage
            await supabase.storage
                .from('guard-rent')
                .remove([deletedPhoto.storage_path])

            // Delete from database
            await supabase
                .from('assets')
                .delete()
                .eq('asset_id', deletedPhoto.asset_id)

        } catch (err) {
            console.error('Failed to delete photo:', err)
            setError('Failed to delete photo')
            // Reload to restore state if delete failed
            await loadData(caseId)
        }
    }

    const totalHandoverPhotos = rooms.reduce((sum, r) => sum + r.handover_photos, 0)
    const hasMeterReadings = Object.values(handover.meterReadings).some(r => r?.value || r?.asset_id)
    const canComplete = totalHandoverPhotos > 0 && handover.keysReturned

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>

    // Lock handover for preview mode
    if (!hasPack) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Handover</h1>
                    <p className="text-slate-500">
                        Document the move-out condition and confirm key return.
                    </p>
                </div>

                <UpgradeBanner caseId={caseId} currentPack={null} />

                <div className="bg-white rounded-xl border-2 border-slate-200 p-12 text-center">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Lock className="text-slate-400" size={40} />
                    </div>
                    <h3 className="font-semibold text-xl mb-3">Handover requires a pack</h3>
                    <p className="text-slate-600 mb-6 max-w-md mx-auto">
                        Buy the <strong>Move-Out Pack</strong> or <strong>Full Bundle</strong> to record your handover evidence and protect your deposit.
                    </p>
                    <div className="text-sm text-slate-500  space-y-1">
                        <p>✓ Unlimited handover photos</p>
                        <p>✓ Walkthrough video upload</p>
                        <p>✓ Meter readings with photo proof</p>
                        <p>✓ Keys return confirmation</p>
                        <p>✓ Generate official Deposit Recovery Pack</p>
                    </div>
                </div>
            </div>
        )
    }

    // Edit warning modal
    const EditWarningModal = () => (
        showEditWarning && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 max-w-md w-full">
                    <h3 className="font-semibold text-lg mb-2">Edit completed handover?</h3>
                    <p className="text-slate-600 mb-6">
                        This handover was already marked complete on {new Date(handover.completedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}. Are you sure you want to make changes?
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowEditWarning(false)}
                            className="flex-1 px-4 py-2 border-2 border-slate-200 rounded-lg font-medium hover:bg-slate-50"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                setShowEditWarning(false)
                                setAllowEdit(true)
                            }}
                            className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                        >
                            Yes, edit
                        </button>
                    </div>
                </div>
            </div>
        )
    )

    // If handover is complete, show summary or allow edit
    if (handover.completedAt) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold mb-1">Handover complete</h1>
                    <p className="text-slate-500">
                        Completed on {new Date(handover.completedAt).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Check className="text-green-600" size={24} />
                        <h2 className="font-semibold text-green-900 text-lg">Evidence recorded</h2>
                    </div>
                    <ul className="space-y-2 text-green-800">
                        <li className="flex items-center gap-2">
                            <Check size={16} /> {totalHandoverPhotos} handover photos
                        </li>
                        {handover.keysReturned && (
                            <li className="flex items-center gap-2">
                                <Check size={16} /> Keys returned confirmed
                            </li>
                        )}
                        {hasMeterReadings && (
                            <li className="flex items-center gap-2">
                                <Check size={16} /> Meter readings recorded
                            </li>
                        )}
                    </ul>
                </div>

                <p className="text-sm text-slate-500 text-center">
                    Go to Exports to generate your Deposit Recovery Pack.
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <EditWarningModal />

            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={lightboxImages}
            />

            <DeleteConfirmationModal
                isOpen={!!photoToDelete}
                onClose={() => setPhotoToDelete(null)}
                onConfirm={confirmDeletePhoto}
                itemType="photo"
                context="handover"
            />

            <LockConfirmationModal
                isOpen={showKeysModal}
                onClose={() => setShowKeysModal(false)}
                onConfirm={handleConfirmKeys}
                type="keys"
            />

            <LockConfirmationModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
                onConfirm={handleMarkComplete}
                type="handover"
            />

            <div>
                <h1 className="text-2xl font-bold mb-1">Handover</h1>
                <p className="text-slate-500">
                    Document the move-out condition and confirm key return.
                </p>
            </div>

            {/* Completion protection banner */}
            {handover.completedAt && !allowEdit && (
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-green-600" size={24} />
                            <div>
                                <p className="font-semibold text-green-900">Handover completed</p>
                                <p className="text-sm text-green-700">
                                    Completed on {new Date(handover.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEditWarning(true)}
                            className="text-sm text-green-700 underline hover:text-green-800 font-medium"
                        >
                            Edit anyway
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* Walkthrough Video Section */}
            <WalkthroughVideoUpload
                caseId={caseId}
                phase="handover"
                isLocked={!!handover.completedAt}
                isPaid={hasPack}
                existingVideo={existingVideo}
                onVideoUploaded={() => loadData(caseId)}
                onVideoDeleted={() => loadData(caseId)}
            />

            {/* ═══════════════════════════════════════════════════════════
                STEP A: FINAL PHOTOS
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('photos')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${totalHandoverPhotos > 0 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {totalHandoverPhotos > 0 ? <Check size={16} /> : <Camera size={16} />}
                        </div>
                        <div className="text-left">
                            <h2 className="font-medium">Final photos</h2>
                            <p className="text-sm text-slate-500">
                                {totalHandoverPhotos > 0
                                    ? `${totalHandoverPhotos} photos uploaded`
                                    : 'Document move-out condition'}
                            </p>
                        </div>
                    </div>
                    {expandedSections.has('photos') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.has('photos') && (
                    <div className="px-6 pb-6 space-y-4">
                        {rooms.map(room => (
                            <div key={room.room_id} className="bg-slate-50 rounded-xl p-4 overflow-hidden">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <span className="font-medium">{room.name}</span>
                                        {room.checkin_photos > 0 && (
                                            <span className="text-xs text-slate-400 bg-slate-200 px-2 py-0.5 rounded">
                                                {room.checkin_photos} check-in
                                            </span>
                                        )}
                                        {room.handover_photos > 0 && (
                                            <span className="text-sm text-green-600 flex items-center gap-1">
                                                <Check size={14} /> {room.handover_photos}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {/* Camera button - mobile-first */}
                                        <label className={`px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2 ${uploading === room.room_id
                                            ? 'bg-blue-400 text-white'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={(e) => handlePhotoUpload(room.room_id, e)}
                                                disabled={uploading === room.room_id}
                                                className="hidden"
                                            />
                                            {uploading === room.room_id ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
                                                <Camera size={16} />
                                            )}
                                            <span className="hidden sm:inline">Take photo</span>
                                        </label>
                                        {/* File picker for gallery */}
                                        <label className={`px-3 py-2 rounded-lg font-medium cursor-pointer transition-colors flex items-center gap-2 ${uploading === room.room_id
                                            ? 'bg-slate-200 text-slate-400'
                                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handlePhotoUpload(room.room_id, e)}
                                                disabled={uploading === room.room_id}
                                                className="hidden"
                                            />
                                            <Plus size={16} />
                                            <span className="hidden sm:inline">Gallery</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Before/after prompt if check-in has photos but handover doesn't */}
                                {room.photos.length === 0 && room.checkin_photos > 0 && (
                                    <div className="py-4 text-center border-2 border-dashed border-blue-100 rounded-xl bg-blue-50/50 mb-3">
                                        <div className="flex flex-col items-center gap-1">
                                            <Camera size={20} className="text-blue-300" />
                                            <p className="text-blue-600 text-sm font-medium">Add move-out photos</p>
                                            <p className="text-blue-400 text-xs">
                                                Compare with your {room.checkin_photos} check-in photo{room.checkin_photos > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Thumbnails */}
                                {room.photos.length > 0 && (
                                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                        {room.photos.slice(0, 5).map((photo, i) => (
                                            <div
                                                key={photo.asset_id}
                                                className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group"
                                            >
                                                <button
                                                    onClick={() => openRoomGallery(room, i)}
                                                    className="w-full h-full bg-slate-200 flex items-center justify-center text-xs text-slate-400"
                                                >
                                                    Photo {i + 1}
                                                </button>
                                                {/* Delete button - visible on mobile, more visible on hover */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeletePhoto(photo)
                                                    }}
                                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md"
                                                    title="Delete photo"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {room.photos.length > 5 && (
                                            <button
                                                onClick={() => openRoomGallery(room)}
                                                className="aspect-square rounded-lg border border-slate-200 bg-white flex flex-col items-center justify-center hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="font-medium text-slate-600">+{room.photos.length - 5}</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                STEP B: DOCUMENT CHANGES (NOTES)
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('notes')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${handover.notes ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <FileText size={16} />
                        </div>
                        <div className="text-left">
                            <h2 className="font-medium">Move-out notes (optional)</h2>
                            <p className="text-sm text-slate-500">Note any damage, issues, or property condition</p>
                        </div>
                    </div>
                    {expandedSections.has('notes') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.has('notes') && (
                    <div className="px-6 pb-6">
                        <textarea
                            value={handover.notes}
                            onChange={(e) => setHandover(prev => ({ ...prev, notes: e.target.value }))}
                            onBlur={handleSaveNotes}
                            placeholder="Describe any changes, damage, or issues noticed..."
                            rows={4}
                            className="w-full p-4 border border-slate-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-slate-400 mt-2">Auto-saved</p>
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                STEP C: METER READINGS
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                    onClick={() => toggleSection('meters')}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${Object.keys(handover.meterReadings).length > 0
                            ? 'bg-green-100 text-green-600'
                            : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Gauge size={16} />
                        </div>
                        <div className="text-left">
                            <h2 className="font-medium">Meter readings (optional)</h2>
                            <p className="text-sm text-slate-500">Record final utility readings</p>
                        </div>
                    </div>
                    {expandedSections.has('meters') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.has('meters') && (
                    <div className="px-6 pb-6 space-y-6">
                        {(['electricity', 'gas', 'water'] as const).map(meter => {
                            const data = handover.meterReadings[meter] || { value: '' }
                            const isUploadingThis = uploading === `meter-${meter}`

                            return (
                                <div key={meter} className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-4 items-start sm:items-center">
                                    <label className="text-sm font-medium capitalize pt-2 sm:pt-0">{meter}</label>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={data.value}
                                            onChange={(e) => updateMeterValue(meter, e.target.value)}
                                            onBlur={() => handleSaveMeters()}
                                            placeholder={`Enter ${meter} reading`}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg"
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {data.asset_id ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={async () => {
                                                        if (!data.photo_url) return
                                                        setLightboxImages([{
                                                            src: data.photo_url,
                                                            caption: `${meter.charAt(0).toUpperCase() + meter.slice(1)} Meter`,
                                                            subcaption: data.value || ''
                                                        }])
                                                        setLightboxOpen(true)
                                                    }}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1 rounded-md"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => removeMeterPhoto(meter)}
                                                    className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-md"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ) : (
                                            <label className={`w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors ${isUploadingThis ? 'opacity-50' : ''}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={isUploadingThis}
                                                    onChange={(e) => handleMeterPhotoUpload(meter, e)}
                                                />
                                                {isUploadingThis ? (
                                                    <Loader2 size={16} className="animate-spin text-slate-400" />
                                                ) : (
                                                    <ImageIcon size={18} className="text-slate-400" />
                                                )}
                                            </label>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>


            {/* ═══════════════════════════════════════════════════════════
                STEP D: KEYS RETURNED
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${handover.keysReturned ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <Key size={16} />
                        </div>
                        <div>
                            <h2 className="font-medium">Keys returned</h2>
                            <p className="text-sm text-slate-500">
                                {handover.keysReturned
                                    ? `Confirmed ${new Date(handover.keysConfirmedAt!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                    : 'Confirm when keys are handed over'}
                            </p>
                        </div>
                    </div>
                    {!handover.keysReturned && (
                        <button
                            onClick={() => setShowKeysModal(true)}
                            disabled={saving}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50"
                        >
                            Confirm
                        </button>
                    )}
                </div>
            </div>

            {/* Walkthrough Video Section */}
            <WalkthroughVideoUpload
                caseId={caseId}
                phase="handover"
                isLocked={!!handover.completedAt}
                isPaid={hasPack}
                existingVideo={existingVideo}
                onVideoUploaded={() => loadData(caseId)}
                onVideoDeleted={() => loadData(caseId)}
            />

            {/* ═══════════════════════════════════════════════════════════
                COMPLETE HANDOVER BUTTON
            ═══════════════════════════════════════════════════════════ */}
            {/* ═══════════════════════════════════════════════════════════
                COMPLETE HANDOVER BUTTON
            ═══════════════════════════════════════════════════════════ */}
            {handover.completedAt ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={24} className="text-slate-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Handover evidence sealed</h3>
                            <div className="space-y-2 text-slate-600">
                                <p className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <span>Evidence has been completed and timestamped</span>
                                </p>
                                <p className="flex items-start gap-2">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                    <span>A confirmation email has been sent as a backup record</span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* What happens next */}
                    <div className="pl-0 sm:pl-16 space-y-4">
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <h4 className="font-medium text-slate-900 mb-2">What happens next</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Your evidence is now sealed and stored exactly as recorded.
                                You can generate a PDF snapshot at any time from Exports.
                                Exporting creates a portable copy you can keep or share if needed.
                            </p>
                        </div>

                        {/* CTA with helper text */}
                        <div className="text-center space-y-3">
                            <a
                                href={`/vault/case/${caseId}/exports`}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                            >
                                Go to Exports
                                <ArrowRight size={18} />
                            </a>
                            <p className="text-sm text-slate-500">
                                Most tenants export a copy for their records once evidence is sealed.
                            </p>
                            <p className="text-sm text-slate-500">
                                Exporting combines your move-in and move-out records into one document.
                            </p>
                            <a
                                href={`/vault/case/${caseId}/exports`}
                                className="text-sm text-slate-500 underline hover:text-slate-700"
                            >
                                Preview what the PDF includes
                            </a>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="pt-4">
                    <button
                        onClick={() => setShowLockModal(true)}
                        disabled={!canComplete || saving}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${canComplete
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {saving ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Lock size={20} />
                                Complete & Lock Handover
                            </>
                        )}
                    </button>
                    {!canComplete && (
                        <p className="text-sm text-amber-600 text-center mt-2 flex items-center justify-center gap-2">
                            <AlertCircle size={16} />
                            {totalHandoverPhotos === 0 && !handover.keysReturned
                                ? 'Add photos and confirm keys returned to complete'
                                : totalHandoverPhotos === 0
                                    ? 'Add at least one handover photo to complete'
                                    : 'Confirm keys returned before completing handover'}
                        </p>
                    )}
                    {canComplete && (
                        <p className="text-xs text-slate-500 text-center mt-2">
                            Seals evidence with immutable timestamps.
                        </p>
                    )}
                </div>
            )}
        </div>
    )
}
