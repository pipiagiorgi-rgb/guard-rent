'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Plus, Check, Loader2, Upload, Trash2, AlertCircle, Gauge, ChevronDown, ChevronUp, X, ImageIcon, Eye, Lock, ShieldCheck } from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { LockConfirmationModal } from '@/components/ui/LockConfirmationModal'
import { canUploadPreviewPhoto, getPhotosRemaining, recordPreviewPhoto, isPurchased } from '@/lib/preview-limits'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'
import { WalkthroughVideoUpload } from '@/components/features/WalkthroughVideoUpload'

interface Room {
    room_id: string
    name: string
    checkin_photos: number
    photos: Asset[]
}

interface Asset {
    asset_id: string
    storage_path: string
    created_at: string
    room_name?: string
    signedUrl?: string
}

interface MeterReading {
    value: string
    asset_id?: string
    photo_url?: string
}

type MeterReadings = {
    electricity?: MeterReading
    gas?: MeterReading
    water?: MeterReading
}

export default function CheckInPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [rooms, setRooms] = useState<Room[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState<string | null>(null)
    const [addingRoom, setAddingRoom] = useState(false)
    const [newRoomName, setNewRoomName] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [hasPack, setHasPack] = useState(false)
    const [isLocked, setIsLocked] = useState(false)
    const [locking, setLocking] = useState(false)
    const [showLockModal, setShowLockModal] = useState(false)

    // Meter readings state
    const [meterReadings, setMeterReadings] = useState<MeterReadings>({})
    const [saving, setSaving] = useState(false)
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['photos', 'meters']))

    // Lightbox state
    const [lightboxOpen, setLightboxOpen] = useState(false)

    // Delete confirmation state
    const [photoToDelete, setPhotoToDelete] = useState<Asset | null>(null)
    const [lightboxImages, setLightboxImages] = useState<{ src: string; caption: string; subcaption: string }[]>([])

    // Walkthrough video state
    const [existingVideo, setExistingVideo] = useState<{
        assetId: string
        fileName: string
        durationSeconds?: number
        uploadedAt: string
        fileHash?: string
    } | undefined>(undefined)

    // Default rooms for new rentals
    const DEFAULT_ROOMS = ['Living Room', 'Kitchen', 'Bathroom', 'Bedroom']

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

            // Fetch case data (meter readings and purchase status)
            const { data: caseData } = await supabase
                .from('cases')
                .select('checkin_meter_readings, purchase_type, checkin_completed_at')
                .eq('case_id', id)
                .single()

            // Check if user has purchased a pack (or is admin)
            if (caseData) {
                try {
                    const statusRes = await fetch(`/api/exports/status?caseId=${id}`)
                    if (statusRes.ok) {
                        const status = await statusRes.json()
                        // Admin or has any pack unlocks check-in features
                        const hasAccess = status.isAdmin || status.purchasedPacks?.length > 0
                        setHasPack(hasAccess)
                    } else {
                        // Fallback to purchase_type column
                        setHasPack(isPurchased(caseData.purchase_type))
                    }
                } catch {
                    // Fallback to purchase_type column
                    setHasPack(isPurchased(caseData.purchase_type))
                }
                setIsLocked(!!caseData.checkin_completed_at)
            }

            if (caseData?.checkin_meter_readings) {
                const raw = caseData.checkin_meter_readings
                const normalized: MeterReadings = {}
                const normalize = (val: any): MeterReading | undefined => {
                    if (!val) return undefined
                    if (typeof val === 'string') return { value: val }
                    return val as MeterReading
                }
                if (raw.electricity) normalized.electricity = normalize(raw.electricity)
                if (raw.gas) normalized.gas = normalize(raw.gas)
                if (raw.water) normalized.water = normalize(raw.water)
                setMeterReadings(normalized)
            }

            // Fetch rooms
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('room_id, name, room_type')
                .eq('case_id', id)
                .order('created_at')

            if (!roomsData || roomsData.length === 0) {
                await createDefaultRooms(id)
                return
            }

            // Fetch assets for all rooms
            const { data: assets } = await supabase
                .from('assets')
                .select('*')
                .eq('case_id', id)
                .in('type', ['checkin_photo', 'photo'])
                .order('created_at', { ascending: false })

            // Generate signed URLs for ALL photos
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

            // Map photos to rooms with signed URLs
            const roomsWithPhotos = roomsData.map(room => {
                const roomAssets = assets?.filter(a => a.room_id === room.room_id) || []
                const assetsWithUrls = roomAssets.map(a => ({
                    ...a,
                    signedUrl: signedMap.get(a.storage_path) || ''
                }))
                return {
                    ...room,
                    checkin_photos: roomAssets.length,
                    photos: assetsWithUrls
                }
            })

            setRooms(roomsWithPhotos)

            // Fetch existing walkthrough video for check-in
            const { data: videoAsset } = await supabase
                .from('assets')
                .select('asset_id, storage_path, duration_seconds, file_hash, created_at')
                .eq('case_id', id)
                .eq('type', 'walkthrough_video')
                .eq('phase', 'check-in')
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
        } catch (err: any) {
            console.error('Failed to load data:', err)
            setError('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const createDefaultRooms = async (id: string) => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const roomInserts = DEFAULT_ROOMS.map(name => ({
            case_id: id,
            name,
            room_type: name.toLowerCase().replace(' ', '_')
        }))

        await supabase.from('rooms').insert(roomInserts)
        await loadData(id)
    }

    const getNextRoomName = (baseName: string): string => {
        // Find all rooms with similar names
        const sameTypeRooms = rooms.filter(r =>
            r.name === baseName || r.name.startsWith(`${baseName} `)
        )

        if (sameTypeRooms.length === 0) {
            return baseName
        }

        // Find the highest number
        let maxNum = 1
        sameTypeRooms.forEach(r => {
            if (r.name === baseName) {
                maxNum = Math.max(maxNum, 1)
            } else {
                const match = r.name.match(new RegExp(`^${baseName} (\\d+)$`))
                if (match) {
                    maxNum = Math.max(maxNum, parseInt(match[1]))
                }
            }
        })

        return `${baseName} ${maxNum + 1}`
    }

    const handleQuickAddRoom = async (baseName: string) => {
        if (isLocked) return
        const roomName = getNextRoomName(baseName)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('rooms')
                .insert({
                    case_id: caseId,
                    name: roomName,
                    room_type: baseName.toLowerCase().replace(' ', '_')
                })

            if (error) throw error
            await loadData(caseId)
        } catch (err) {
            console.error('Failed to add room:', err)
        }
    }

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return
        setAddingRoom(true)

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('rooms')
                .insert({
                    case_id: caseId,
                    name: newRoomName.trim(),
                    room_type: 'custom'
                })

            if (error) throw error
            setNewRoomName('')
            await loadData(caseId)
        } catch (err) {
            console.error('Failed to add room:', err)
        } finally {
            setAddingRoom(false)
        }
    }

    const handleSaveMeters = async (newReadings?: MeterReadings) => {
        setSaving(true)
        try {
            const readingsToSave = newReadings || meterReadings
            const supabase = createClient()
            await supabase
                .from('cases')
                .update({ checkin_meter_readings: readingsToSave })
                .eq('case_id', caseId)
        } catch (err) {
            console.error('Failed to save meters:', err)
        } finally {
            setSaving(false)
        }
    }

    const updateMeterValue = (type: keyof MeterReadings, value: string) => {
        setMeterReadings(prev => {
            const current = prev[type] || { value: '' }
            const next = { ...prev, [type]: { ...current, value } }
            return next
        })
    }

    const toggleSection = (section: string) => {
        const next = new Set(expandedSections)
        next.has(section) ? next.delete(section) : next.add(section)
        setExpandedSections(next)
    }

    const handleMeterPhotoUpload = async (type: keyof MeterReadings, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        const file = files[0]
        setUploading(`meter-${type}`)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const res = await fetch('/api/assets/upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    filename: file.name,
                    mimeType: file.type,
                    type: 'meter_photo',
                })
            })

            if (!res.ok) throw new Error('Failed to get upload URL')
            const { signedUrl, assetId } = await res.json()

            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            if (!uploadRes.ok) throw new Error('Upload failed')

            const previewUrl = URL.createObjectURL(file)

            const updatedReadings = {
                ...meterReadings,
                [type]: {
                    ...(meterReadings[type] || { value: '' }),
                    asset_id: assetId,
                    photo_url: previewUrl
                }
            }

            setMeterReadings(updatedReadings)
            await handleSaveMeters(updatedReadings)

        } catch (err) {
            console.error('Meter upload error:', err)
            setError('Failed to upload meter photo')
        } finally {
            setUploading(null)
            e.target.value = ''
        }
    }

    const handleLockCheckIn = async () => {
        setLocking(true)
        try {
            const res = await fetch(`/api/cases/${caseId}/lock-checkin`, { method: 'POST' })
            if (!res.ok) throw new Error('Failed to lock check-in')

            setIsLocked(true)
            await loadData(caseId)
        } catch (err) {
            console.error('Lock error:', err)
            setError('Failed to lock check-in')
        } finally {
            setLocking(false)
            setShowLockModal(false)
        }
    }



    const removeMeterPhoto = async (type: keyof MeterReadings) => {
        const updated = {
            ...meterReadings,
            [type]: {
                ...meterReadings[type]!,
                asset_id: undefined,
                photo_url: undefined
            }
        }
        setMeterReadings(updated)
        await handleSaveMeters(updated)
    }

    const handlePhotoUpload = async (roomId: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files || files.length === 0) return

        // Check photo limits for preview mode
        if (!hasPack && !canUploadPreviewPhoto(caseId)) {
            setError(`Preview mode allows 3 photos total. Unlock a pack for unlimited photos.`)
            e.target.value = ''
            return
        }

        setUploading(roomId)
        setError(null)

        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            for (const file of Array.from(files)) {
                // Check limit before each file if in preview mode
                if (!hasPack && !canUploadPreviewPhoto(caseId)) {
                    setError(`Photo limit reached. Unlock a pack for unlimited uploads.`)
                    break
                }

                const res = await fetch('/api/assets/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId,
                        filename: file.name,
                        mimeType: file.type,
                        type: 'checkin_photo',
                        roomId
                    })
                })

                if (!res.ok) throw new Error('Failed to get upload URL')
                const { signedUrl, assetId } = await res.json()

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

                // Record usage in preview mode
                if (!hasPack) {
                    recordPreviewPhoto(caseId)
                }
            }

            await loadData(caseId)
        } catch (err: any) {
            console.error('Upload error:', err)
            setError('Failed to upload photo. Please try again.')
        } finally {
            setUploading(null)
            e.target.value = ''
        }
    }

    const openRoomGallery = async (room: Room, startIndex: number = 0) => {
        const supabase = createClient()

        // Generate signed URLs for better viewing if needed, 
        // or just use public paths if your bucket is public.
        // Assuming we need signed URLs for security:
        const imagesWithUrls = await Promise.all(room.photos.map(async (p) => {
            const { data } = await supabase.storage.from('guard-rent').createSignedUrl(p.storage_path, 3600)
            return {
                src: data?.signedUrl || '',
                caption: room.name,
                subcaption: `Check-in • ${new Date(p.created_at).toLocaleString()}`
            }
        }))

        setLightboxImages(imagesWithUrls.filter(i => i.src))
        setLightboxOpen(true)
        // If Lightbox supports startIndex, we'd pass it here, but current Lightbox impl defaults to 0. 
        // We'll update lightbox later to support index if needed, for now just open.
    }

    const handleDeletePhoto = async (photo: Asset) => {
        if (isLocked) return
        // Show confirmation modal instead of browser confirm
        setPhotoToDelete(photo)
    }

    const confirmDeletePhoto = async () => {
        if (!photoToDelete) return

        try {
            const supabase = createClient()

            // Delete from storage
            await supabase.storage
                .from('guard-rent')
                .remove([photoToDelete.storage_path])

            // Delete from database
            await supabase
                .from('assets')
                .delete()
                .eq('asset_id', photoToDelete.asset_id)

            // Reload data
            await loadData(caseId)
        } catch (err) {
            console.error('Failed to delete photo:', err)
            setError('Failed to delete photo')
        } finally {
            setPhotoToDelete(null)
        }
    }

    const totalPhotos = rooms.reduce((sum, r) => sum + r.checkin_photos, 0)
    const hasMeterReadings = Object.values(meterReadings).some(r => r?.value || r?.asset_id)
    const isComplete = totalPhotos > 0

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>

    return (
        <div className="space-y-6">
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
                context="check-in"
            />

            <LockConfirmationModal
                isOpen={showLockModal}
                onClose={() => setShowLockModal(false)}
                onConfirm={handleLockCheckIn}
                type="check-in"
            />

            <div>
                <h1 className="text-2xl font-bold mb-1">Check-in photos</h1>
                <p className="text-slate-500">
                    Document the condition of each room when you move in.
                </p>
            </div>

            {/* Upgrade Banner */}
            {!hasPack && <UpgradeBanner caseId={caseId} currentPack={null} />}

            {/* Photo limit warning for preview mode */}
            {!hasPack && totalPhotos > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                        <strong>{getPhotosRemaining(caseId)} preview photo{getPhotosRemaining(caseId) !== 1 ? 's' : ''} remaining.</strong>
                        {' '}Photos are not saved in preview mode. Buy a pack to save everything permanently.
                    </p>
                </div>
            )}

            {/* Walkthrough Video Section */}
            <WalkthroughVideoUpload
                caseId={caseId}
                phase="check-in"
                isLocked={isLocked}
                isPaid={hasPack}
                existingVideo={existingVideo}
                onVideoUploaded={() => loadData(caseId)}
                onVideoDeleted={() => loadData(caseId)}
            />

            {/* Status banner */}
            {isLocked ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="p-2 bg-slate-100 rounded-full">
                        <ShieldCheck className="text-slate-700" size={24} />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-900">Check-in Evidence Locked</p>
                        <p className="text-sm text-slate-600">
                            Photos are sealed with system timestamps and cannot be changed.
                        </p>
                    </div>
                </div>
            ) : isComplete ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <Check className="text-green-600" size={20} />
                        <div>
                            <p className="font-medium text-green-900">Check-in evidence recorded</p>
                            <p className="text-sm text-green-700">
                                {totalPhotos} photos across {rooms.filter(r => r.checkin_photos > 0).length} rooms
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLockModal(true)}
                        disabled={locking}
                        className="w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                        {locking ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                        Complete & Lock Check-in
                    </button>
                    <p className="text-xs text-green-600 mt-2 text-center">
                        This seals your evidence with immutable timestamps.
                    </p>
                </div>
            ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
                    <Camera className="text-amber-600" size={20} />
                    <div>
                        <p className="font-medium text-amber-900">Add photos to document move-in condition</p>
                        <p className="text-sm text-amber-700">Upload at least one photo per room</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* ROOM PHOTOs */}
            <div className="space-y-4">
                {rooms.map(room => (
                    <div key={room.room_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <Camera size={16} className="text-slate-600" />
                                </div>
                                <h3 className="font-semibold">{room.name}</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                {room.checkin_photos > 0 && (
                                    <span className="text-sm text-slate-500">{room.checkin_photos} photos</span>
                                )}
                                {(() => {
                                    const canUpload = !isLocked && (hasPack || canUploadPreviewPhoto(caseId))
                                    const isUploading = uploading === room.room_id
                                    return (
                                        <label className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium transition-colors ${!canUpload || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'
                                            }`}>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={(e) => handlePhotoUpload(room.room_id, e)}
                                                disabled={!canUpload || isUploading}
                                                className="hidden"
                                            />
                                            {isUploading ? (
                                                <Loader2 size={14} className="animate-spin" />
                                            ) : (
                                                <Plus size={14} />
                                            )}
                                            {!canUpload && !hasPack ? 'Limit reached' : isUploading ? 'Uploading...' : 'Add photo'}
                                        </label>
                                    )
                                })()}
                            </div>
                        </div>

                        <div className="p-5">
                            {room.photos.length > 0 ? (
                                <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
                                    <div className="flex gap-3 min-w-max">
                                        {room.photos.map((photo, i) => (
                                            <div
                                                key={photo.asset_id}
                                                className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200 group"
                                            >
                                                <button
                                                    onClick={() => openRoomGallery(room, i)}
                                                    className="w-full h-full"
                                                >
                                                    {photo.signedUrl ? (
                                                        <img src={photo.signedUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                                            Photo {i + 1}
                                                        </div>
                                                    )}
                                                </button>
                                                {/* Delete button */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleDeletePhoto(photo)
                                                    }}
                                                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                                                    title="Delete photo"
                                                >
                                                    <X size={12} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-6 text-center border-2 border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                                    <div className="flex flex-col items-center gap-2">
                                        <Camera size={24} className="text-slate-300" />
                                        <p className="text-slate-500 text-sm font-medium">Document this room&apos;s condition</p>
                                        <p className="text-slate-400 text-xs max-w-[200px]">
                                            Photos create timestamped proof for deposit disputes
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add room card */}
                <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-6">
                    {isLocked ? (
                        <p className="text-center text-slate-400 text-sm">Check-in is locked</p>
                    ) : addingRoom ? (
                        <div className="flex flex-col items-center gap-3">
                            <p className="text-sm text-slate-500">Enter custom room name</p>
                            <div className="w-full max-w-md flex gap-2">
                                <input
                                    type="text"
                                    value={newRoomName}
                                    onChange={(e) => setNewRoomName(e.target.value)}
                                    placeholder="e.g. Laundry, Garage, Balcony"
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    autoFocus
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddRoom()}
                                />
                                <button onClick={handleAddRoom} disabled={!newRoomName.trim()} className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium disabled:opacity-50">Add</button>
                                <button onClick={() => setAddingRoom(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <p className="text-sm text-slate-500">Add more rooms to document</p>
                            <div className="flex flex-wrap justify-center gap-2">
                                <button
                                    onClick={() => handleQuickAddRoom('Bedroom')}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Bedroom
                                </button>
                                <button
                                    onClick={() => handleQuickAddRoom('Bathroom')}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Bathroom
                                </button>
                                <button
                                    onClick={() => setAddingRoom(true)}
                                    className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2"
                                >
                                    <Plus size={16} /> Other room
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div >
    )
}
