'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Camera, Eye, Loader2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'

interface Asset {
    asset_id: string
    storage_path: string
    room_id: string | null
    type: string
    created_at: string
}

interface RoomWithPhotos {
    room_id: string
    name: string
    checkinPhotos: Asset[]
    handoverPhotos: Asset[]
    hasBothPhases: boolean
}

interface PhotoComparisonProps {
    caseId: string
}

interface PhotoAsset {
    src: string
    caption: string
    subcaption: string
}

export function PhotoComparison({ caseId }: PhotoComparisonProps) {
    const [rooms, setRooms] = useState<RoomWithPhotos[]>([])
    const [loading, setLoading] = useState(true)
    const [comparisonMode, setComparisonMode] = useState<Record<string, boolean>>({})
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<PhotoAsset[]>([])
    const [loadingPhotos, setLoadingPhotos] = useState(false)
    const [expandedRooms, setExpandedRooms] = useState<Set<string>>(new Set())

    useEffect(() => {
        loadRoomPhotos()
    }, [caseId])

    const loadRoomPhotos = async () => {
        if (!caseId) return
        setLoading(true)
        try {
            const supabase = createClient()

            // Fetch rooms
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('room_id, name')
                .eq('case_id', caseId)
                .order('created_at')

            // Fetch all photos for this case
            const { data: assets } = await supabase
                .from('assets')
                .select('asset_id, storage_path, room_id, type, created_at')
                .eq('case_id', caseId)
                .in('type', ['checkin_photo', 'photo', 'handover_photo'])
                .order('created_at')

            if (!roomsData || !assets) {
                setRooms([])
                return
            }

            // Group photos by room
            const roomsWithPhotos: RoomWithPhotos[] = roomsData.map(room => {
                const checkinPhotos = assets.filter(a =>
                    a.room_id === room.room_id &&
                    (a.type === 'checkin_photo' || a.type === 'photo')
                )
                const handoverPhotos = assets.filter(a =>
                    a.room_id === room.room_id &&
                    a.type === 'handover_photo'
                )

                return {
                    room_id: room.room_id,
                    name: room.name,
                    checkinPhotos,
                    handoverPhotos,
                    hasBothPhases: checkinPhotos.length > 0 && handoverPhotos.length > 0
                }
            })

            // Filter to only rooms with at least one photo
            const roomsWithAnyPhotos = roomsWithPhotos.filter(
                r => r.checkinPhotos.length > 0 || r.handoverPhotos.length > 0
            )

            // Initialize comparison mode for rooms with both phases
            const initialComparisonMode: Record<string, boolean> = {}
            roomsWithAnyPhotos.forEach(room => {
                if (room.hasBothPhases) {
                    initialComparisonMode[room.room_id] = true
                }
            })

            setRooms(roomsWithAnyPhotos)
            setComparisonMode(initialComparisonMode)
        } catch (err) {
            console.error('Error loading room photos:', err)
        } finally {
            setLoading(false)
        }
    }

    const toggleComparisonMode = (roomId: string) => {
        setComparisonMode(prev => ({
            ...prev,
            [roomId]: !prev[roomId]
        }))
    }

    const openPhotoLightbox = async (photos: Asset[], roomName: string, phase: string) => {
        setLoadingPhotos(true)
        try {
            const supabase = createClient()
            const photosWithUrls: PhotoAsset[] = []

            for (const photo of photos) {
                const { data } = await supabase.storage
                    .from('guard-rent')
                    .createSignedUrl(photo.storage_path, 3600)

                if (data?.signedUrl) {
                    photosWithUrls.push({
                        src: data.signedUrl,
                        caption: `${roomName} - ${phase}`,
                        subcaption: new Date(photo.created_at).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    })
                }
            }

            setLightboxImages(photosWithUrls)
            setLightboxOpen(true)
        } finally {
            setLoadingPhotos(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
        )
    }

    if (rooms.length === 0) {
        return (
            <div className="bg-slate-50 rounded-xl p-6 text-center">
                <p className="text-sm text-slate-500">No photos recorded yet.</p>
            </div>
        )
    }

    const roomsWithComparison = rooms.filter(r => r.hasBothPhases)

    return (
        <div className="space-y-4">
            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={lightboxImages}
            />

            {roomsWithComparison.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    <strong>{roomsWithComparison.length}</strong> room{roomsWithComparison.length > 1 ? 's have' : ' has'} both check-in and handover photos for comparison.
                </div>
            )}

            <div className="space-y-3">
                {rooms.map(room => (
                    <div key={room.room_id} className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        {/* Clickable header to toggle */}
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
                            className="w-full p-4 border-b border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                                    <Camera size={16} className="text-slate-600" />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-medium">{room.name}</h4>
                                    <p className="text-xs text-slate-500">
                                        {room.checkinPhotos.length} check-in · {room.handoverPhotos.length} handover
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {room.hasBothPhases && (
                                    <span className="text-xs text-blue-600 font-medium">Comparison</span>
                                )}
                                {expandedRooms.has(room.room_id) ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                            </div>
                        </button>

                        {/* Collapsible photo section */}
                        {expandedRooms.has(room.room_id) && (
                            <div className="p-4">
                                {/* Comparison mode toggle - only when expanded */}
                                {room.hasBothPhases && (
                                    <div className="flex justify-end mb-3">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleComparisonMode(room.room_id) }}
                                            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                                        >
                                            {comparisonMode[room.room_id] ? (
                                                <>
                                                    <ToggleRight size={20} className="text-blue-600" />
                                                    <span>Comparison</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft size={20} />
                                                    <span>Separate</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                                {room.hasBothPhases && comparisonMode[room.room_id] ? (
                                    // Side-by-side comparison view
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Check-in</p>
                                            <button
                                                onClick={() => openPhotoLightbox(room.checkinPhotos, room.name, 'Check-in')}
                                                disabled={loadingPhotos}
                                                className="w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden relative group hover:ring-2 hover:ring-blue-500 transition-all"
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {loadingPhotos ? (
                                                        <Loader2 size={20} className="animate-spin text-slate-400" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Camera size={24} className="mx-auto text-slate-400 mb-1" />
                                                            <span className="text-sm text-slate-600">{room.checkinPhotos.length} photos</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View all
                                                </div>
                                            </button>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(room.checkinPhotos[0]?.created_at).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-500 mb-2 uppercase tracking-wide">Handover</p>
                                            <button
                                                onClick={() => openPhotoLightbox(room.handoverPhotos, room.name, 'Handover')}
                                                disabled={loadingPhotos}
                                                className="w-full aspect-[4/3] bg-slate-100 rounded-lg overflow-hidden relative group hover:ring-2 hover:ring-blue-500 transition-all"
                                            >
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {loadingPhotos ? (
                                                        <Loader2 size={20} className="animate-spin text-slate-400" />
                                                    ) : (
                                                        <div className="text-center">
                                                            <Camera size={24} className="mx-auto text-slate-400 mb-1" />
                                                            <span className="text-sm text-slate-600">{room.handoverPhotos.length} photos</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="absolute bottom-2 right-2 bg-white/90 rounded px-2 py-1 text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    View all
                                                </div>
                                            </button>
                                            <p className="text-xs text-slate-400 mt-1">
                                                {new Date(room.handoverPhotos[0]?.created_at).toLocaleDateString('en-GB')}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    // Separate sections fallback
                                    <div className="space-y-3">
                                        {room.checkinPhotos.length > 0 && (
                                            <button
                                                onClick={() => openPhotoLightbox(room.checkinPhotos, room.name, 'Check-in')}
                                                disabled={loadingPhotos}
                                                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Camera size={16} className="text-slate-500" />
                                                    <span className="text-sm">Check-in photos</span>
                                                    <span className="text-xs text-slate-400">({room.checkinPhotos.length})</span>
                                                </div>
                                                <Eye size={16} className="text-slate-400" />
                                            </button>
                                        )}
                                        {room.handoverPhotos.length > 0 && (
                                            <button
                                                onClick={() => openPhotoLightbox(room.handoverPhotos, room.name, 'Handover')}
                                                disabled={loadingPhotos}
                                                className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Camera size={16} className="text-slate-500" />
                                                    <span className="text-sm">Handover photos</span>
                                                    <span className="text-xs text-slate-400">({room.handoverPhotos.length})</span>
                                                </div>
                                                <Eye size={16} className="text-slate-400" />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
