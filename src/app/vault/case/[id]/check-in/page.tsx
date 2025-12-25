'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Plus, Check, Loader2, Upload, Trash2, AlertCircle, Gauge, ChevronDown, ChevronUp, X, ImageIcon, Eye, Lock, ShieldCheck, FileText, ArrowRight } from 'lucide-react'
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
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
    const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())

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

    // Deposit proof state
    const [depositProof, setDepositProof] = useState<Asset | null>(null)
    const [hasContract, setHasContract] = useState(false)

    // Room deletion state
    const [roomToDelete, setRoomToDelete] = useState<Room | null>(null)
    const [deletingRoom, setDeletingRoom] = useState(false)

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

            // Fetch assets for all rooms (including meter photos)
            const { data: assets } = await supabase
                .from('assets')
                .select('*')
                .eq('case_id', id)
                .in('type', ['checkin_photo', 'photo', 'deposit_proof', 'meter_photo'])
                .order('created_at', { ascending: false })

            // Check if contract has been uploaded (locks deposit proof deletion)
            const { count: contractCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', id)
                .eq('type', 'contract_pdf')
            setHasContract((contractCount || 0) > 0)

            // Separate deposit proof from room photos
            const depositProofAsset = assets?.find(a => a.type === 'deposit_proof') || null
            setDepositProof(depositProofAsset)
            const roomAssets = assets?.filter(a => a.type !== 'deposit_proof' && a.type !== 'meter_photo') || []
            const meterPhotoAssets = assets?.filter(a => a.type === 'meter_photo') || []

            // Generate signed URLs for ALL photos (including meter photos)
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
            if (caseData?.checkin_meter_readings) {
                const raw = caseData.checkin_meter_readings
                const updatedMeterReadings: MeterReadings = {}

                const processReading = (key: keyof MeterReadings, val: any): MeterReading | undefined => {
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

                if (raw.electricity) updatedMeterReadings.electricity = processReading('electricity', raw.electricity)
                if (raw.gas) updatedMeterReadings.gas = processReading('gas', raw.gas)
                if (raw.water) updatedMeterReadings.water = processReading('water', raw.water)
                setMeterReadings(updatedMeterReadings)
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
            const { data: newRoom, error } = await supabase
                .from('rooms')
                .insert({
                    case_id: caseId,
                    name: roomName,
                    room_type: baseName.toLowerCase().replace(' ', '_')
                })
                .select()
                .single()

            if (error) throw error

            // Optimistically add to local state - no full reload
            if (newRoom) {
                setRooms(prev => [...prev, {
                    room_id: newRoom.room_id,
                    name: newRoom.name,
                    room_type: newRoom.room_type,
                    photos: [],
                    checkin_photos: 0
                }])
                // Auto-expand the new room
                setExpandedRooms(prev => new Set(Array.from(prev).concat(newRoom.room_id)))
            }
        } catch (err) {
            console.error('Failed to add room:', err)
        }
    }

    const handleAddRoom = async () => {
        if (!newRoomName.trim()) return

        const roomToAdd = newRoomName.trim()
        setNewRoomName('')
        setAddingRoom(false)

        try {
            const supabase = createClient()
            const { data: newRoom, error } = await supabase
                .from('rooms')
                .insert({
                    case_id: caseId,
                    name: roomToAdd,
                    room_type: 'custom'
                })
                .select()
                .single()

            if (error) throw error

            // Optimistically add to local state - no full reload
            if (newRoom) {
                setRooms(prev => [...prev, {
                    room_id: newRoom.room_id,
                    name: newRoom.name,
                    room_type: newRoom.room_type,
                    photos: [],
                    checkin_photos: 0
                }])
                // Auto-expand the new room
                setExpandedRooms(prev => new Set(Array.from(prev).concat(newRoom.room_id)))
            }
        } catch (err) {
            console.error('Failed to add room:', err)
            setError('Failed to add room')
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
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId, caseId })
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

    const handleDeleteRoom = (room: Room) => {
        // If room has photos, show confirmation
        if (room.photos && room.photos.length > 0) {
            setRoomToDelete(room)
        } else {
            // Empty room - delete immediately
            confirmDeleteRoom(room)
        }
    }

    const confirmDeleteRoom = async (room: Room) => {
        setDeletingRoom(true)
        setRoomToDelete(null)

        // Optimistic update: remove room from state immediately
        setRooms(prev => prev.filter(r => r.room_id !== room.room_id))

        try {
            // Delete room (cascade deletes assets via FK)
            const res = await fetch(`/api/rooms/${room.room_id}`, {
                method: 'DELETE',
            })

            if (!res.ok) throw new Error('Failed to delete room')

        } catch (err) {
            console.error('Delete room error:', err)
            setError('Failed to delete room')
            // Reload to restore state if delete failed
            await loadData(caseId)
        } finally {
            setDeletingRoom(false)
        }
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

                // Record usage in preview mode
                if (!hasPack) {
                    recordPreviewPhoto(caseId)
                }

                // Optimistic update: add photo to local state
                const previewUrl = URL.createObjectURL(file)
                setRooms(prev => prev.map(room =>
                    room.room_id === roomId
                        ? {
                            ...room,
                            checkin_photos: room.checkin_photos + 1,
                            photos: [...room.photos, {
                                asset_id: assetId,
                                storage_path: storagePath || '',
                                created_at: new Date().toISOString(),
                                signedUrl: previewUrl
                            }]
                        }
                        : room
                ))
            }
        } catch (err: any) {
            console.error('Upload error:', err)
            // More specific error messages for mobile debugging
            if (err?.message?.includes('Failed to get upload URL')) {
                setError('Could not prepare upload. Please check your connection and try again.')
            } else if (err?.message?.includes('Upload failed')) {
                setError('Photo upload failed. Try taking a smaller photo or using a different format.')
            } else if (err?.message?.includes('Not authenticated')) {
                setError('Session expired. Please refresh the page and try again.')
            } else {
                setError('Failed to upload photo. Please try again.')
            }
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

        const deletedPhoto = photoToDelete
        setPhotoToDelete(null)

        // Optimistic update: remove photo from local state immediately
        setRooms(prev => prev.map(room => ({
            ...room,
            photos: room.photos.filter(p => p.asset_id !== deletedPhoto.asset_id),
            checkin_photos: room.photos.some(p => p.asset_id === deletedPhoto.asset_id)
                ? room.checkin_photos - 1
                : room.checkin_photos
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

            {/* Room deletion confirmation */}
            <DeleteConfirmationModal
                isOpen={!!roomToDelete}
                onClose={() => setRoomToDelete(null)}
                onConfirm={async () => { if (roomToDelete) await confirmDeleteRoom(roomToDelete) }}
                itemType="room"
                itemName={roomToDelete?.name}
                context="check-in"
                customMessage={roomToDelete?.photos?.length ? `This room has ${roomToDelete.photos.length} photo${roomToDelete.photos.length > 1 ? 's' : ''}. Deleting it will permanently remove all photos.` : undefined}
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

            <WalkthroughVideoUpload
                caseId={caseId}
                phase="check-in"
                isLocked={isLocked}
                isPaid={hasPack}
                existingVideo={existingVideo}
                onVideoUploaded={() => loadData(caseId)}
                onVideoDeleted={() => loadData(caseId)}
            />

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
                    <AlertCircle size={20} />
                    <span className="text-sm">{error}</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                DEPOSIT PROOF SECTION
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={async () => {
                            if (!depositProof?.storage_path) return
                            const supabase = createClient()
                            const { data } = await supabase.storage.from('guard-rent').createSignedUrl(depositProof.storage_path, 3600)
                            if (data?.signedUrl) {
                                setLightboxImages([{
                                    src: data.signedUrl,
                                    caption: 'Deposit Payment Proof',
                                    subcaption: `Uploaded ${new Date(depositProof.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                }])
                                setLightboxOpen(true)
                            }
                        }}
                        className={`flex items-center gap-3 text-left ${depositProof ? 'hover:opacity-75 cursor-pointer' : 'cursor-default'}`}
                        disabled={!depositProof}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${depositProof ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText size={16} />
                        </div>
                        <div>
                            <h2 className="font-medium">Deposit payment proof</h2>
                            <p className="text-sm text-slate-500">
                                {depositProof
                                    ? `Uploaded ${new Date(depositProof.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} • Click to view`
                                    : 'Upload proof of deposit payment (bank transfer, receipt)'}
                            </p>
                        </div>
                    </button>
                    {isLocked ? (
                        depositProof ? (
                            <button
                                onClick={async () => {
                                    if (!depositProof?.storage_path) return
                                    const supabase = createClient()
                                    const { data } = await supabase.storage.from('guard-rent').createSignedUrl(depositProof.storage_path, 3600)
                                    if (data?.signedUrl) {
                                        setLightboxImages([{
                                            src: data.signedUrl,
                                            caption: 'Deposit Payment Proof',
                                            subcaption: `Uploaded ${new Date(depositProof.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        }])
                                        setLightboxOpen(true)
                                    }
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1 rounded-md"
                            >
                                View
                            </button>
                        ) : (
                            <span className="text-sm text-slate-400">Not uploaded</span>
                        )
                    ) : depositProof ? (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={async () => {
                                    if (!depositProof?.storage_path) return
                                    const supabase = createClient()
                                    const { data } = await supabase.storage.from('guard-rent').createSignedUrl(depositProof.storage_path, 3600)
                                    if (data?.signedUrl) {
                                        setLightboxImages([{
                                            src: data.signedUrl,
                                            caption: 'Deposit Payment Proof',
                                            subcaption: `Uploaded ${new Date(depositProof.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                                        }])
                                        setLightboxOpen(true)
                                    }
                                }}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium bg-blue-50 px-3 py-1 rounded-md"
                            >
                                View
                            </button>
                            {!hasContract && (
                                <button
                                    onClick={() => setPhotoToDelete(depositProof)}
                                    className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-md"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    ) : (
                        <label className={`px-4 py-2 bg-white border border-slate-200 rounded-lg font-medium cursor-pointer hover:bg-slate-50 flex items-center gap-2 ${uploading === 'deposit' ? 'opacity-50' : ''}`}>
                            <input
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleDepositUpload}
                                disabled={!!uploading}
                                className="hidden"
                            />
                            {uploading === 'deposit' ? <Loader2 size={16} className="animate-spin" /> : 'Upload'}
                        </label>
                    )}
                </div>
            </div>

            {/* ROOM PHOTOs */}
            <div className="space-y-4">
                {rooms.map(room => (
                    <div key={room.room_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                            {/* Clickable left section - toggles photo visibility */}
                            <button
                                onClick={() => {
                                    const next = new Set(expandedRooms)
                                    if (next.has(room.room_id)) {
                                        next.delete(room.room_id)
                                    } else {
                                        next.add(room.room_id)
                                    }
                                    setExpandedRooms(next)
                                }}
                                className="flex items-center gap-3 hover:bg-slate-100 -ml-2 px-2 py-1 rounded-lg transition-colors"
                            >
                                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                                    <Camera size={16} className="text-slate-600" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold">{room.name}</h3>
                                    {room.checkin_photos > 0 && (
                                        <span className="text-sm text-slate-500">({room.checkin_photos})</span>
                                    )}
                                </div>
                                {expandedRooms.has(room.room_id) ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </button>
                            {/* Action buttons - always visible */}
                            <div className="flex items-center gap-3">
                                {(() => {
                                    const canUpload = !isLocked && (hasPack || canUploadPreviewPhoto(caseId))
                                    const isUploading = uploading === room.room_id
                                    return (
                                        <div className="flex items-center gap-2">
                                            {/* Camera button - mobile-first */}
                                            <label className={`flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white border border-blue-600 rounded-lg text-sm font-medium transition-colors ${!canUpload || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-blue-700'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    capture="environment"
                                                    onChange={(e) => handlePhotoUpload(room.room_id, e)}
                                                    disabled={!canUpload || isUploading}
                                                    className="hidden"
                                                />
                                                {isUploading ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Camera size={14} />
                                                )}
                                                <span className="hidden sm:inline">Take photo</span>
                                            </label>
                                            {/* File picker for gallery/desktop */}
                                            <label className={`flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium transition-colors ${!canUpload || isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-50'}`}>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    multiple
                                                    onChange={(e) => handlePhotoUpload(room.room_id, e)}
                                                    disabled={!canUpload || isUploading}
                                                    className="hidden"
                                                />
                                                <Plus size={14} />
                                                <span className="hidden sm:inline">{!canUpload && !hasPack ? 'Limit' : 'Gallery'}</span>
                                            </label>
                                        </div>
                                    )
                                })()}
                                {/* Delete room button - only when not locked */}
                                {!isLocked && (
                                    <button
                                        onClick={() => handleDeleteRoom(room)}
                                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete room"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Collapsible photo section */}
                        {expandedRooms.has(room.room_id) && (
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
                                                            <img src={photo.signedUrl} alt={`Photo ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                                                                Photo {i + 1}
                                                            </div>
                                                        )}
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
                        )}
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

            {/* ═══════════════════════════════════════════════════════════
                METER READINGS SECTION (Initial readings at move-in)
            ═══════════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <button
                    onClick={() => {
                        const next = new Set(expandedSections)
                        if (next.has('meters')) {
                            next.delete('meters')
                        } else {
                            next.add('meters')
                        }
                        setExpandedSections(next)
                    }}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${hasMeterReadings ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Gauge size={20} />
                        </div>
                        <div className="text-left">
                            <h2 className="font-medium">Meter readings (optional)</h2>
                            <p className="text-sm text-slate-500">Record initial utility readings at move-in</p>
                        </div>
                    </div>
                    {expandedSections.has('meters') ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </button>

                {expandedSections.has('meters') && (
                    <div className="px-6 pb-6 space-y-6">
                        {(['electricity', 'gas', 'water'] as const).map(meter => {
                            const data = meterReadings[meter] || { value: '' }
                            const isUploadingThis = uploading === `meter-${meter}`

                            return (
                                <div key={meter} className="grid grid-cols-1 sm:grid-cols-[100px_1fr_auto] gap-4 items-start sm:items-center">
                                    <label className="text-sm font-medium capitalize pt-2 sm:pt-0">{meter}</label>

                                    <div className="flex-1">
                                        <input
                                            type="text"
                                            value={data.value || ''}
                                            onChange={(e) => updateMeterValue(meter, e.target.value)}
                                            onBlur={() => handleSaveMeters()}
                                            placeholder={`Enter ${meter} reading`}
                                            disabled={isLocked}
                                            className="w-full px-4 py-2 border border-slate-200 rounded-lg disabled:bg-slate-50 disabled:text-slate-500"
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
                                                {!isLocked && (
                                                    <button
                                                        onClick={() => removeMeterPhoto(meter)}
                                                        className="text-sm text-red-600 hover:text-red-700 font-medium bg-red-50 px-3 py-1 rounded-md"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        ) : !isLocked ? (
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
                                        ) : null}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* ═══════════════════════════════════════════════════════════
                COMPLETE & LOCK SECTION (matching handover pattern)
            ═══════════════════════════════════════════════════════════ */}
            {isLocked ? (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                    <div className="flex items-start gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <ShieldCheck size={24} className="text-slate-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 text-lg mb-2">Check-in evidence sealed</h3>
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
                        disabled={!isComplete || locking}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${isComplete
                            ? 'bg-slate-900 text-white hover:bg-slate-800'
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                    >
                        {locking ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                <Lock size={20} />
                                Complete & Lock Check-in
                            </>
                        )}
                    </button>
                    {!isComplete ? (
                        <p className="text-sm text-slate-500 text-center mt-2">
                            Add at least one photo to complete check-in
                        </p>
                    ) : (
                        <p className="text-xs text-slate-500 text-center mt-2">
                            Seals evidence with immutable timestamps.
                        </p>
                    )}
                </div>
            )}
        </div >
    )
}
