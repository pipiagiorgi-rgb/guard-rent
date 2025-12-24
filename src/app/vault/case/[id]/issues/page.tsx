'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Plus,
    AlertTriangle,
    Calendar,
    Camera,
    Video,
    Loader2,
    ChevronDown,
    ChevronUp,
    X,
    Trash2,
    Play,
    Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import Lightbox from "yet-another-react-lightbox"
import "yet-another-react-lightbox/styles.css"

interface Room {
    room_id: string
    name: string
}

interface IssueMedia {
    asset_id: string
    storage_path: string
    signedUrl?: string
    type: 'issue_photo' | 'issue_video'
    mime_type?: string
}

interface Issue {
    issue_id: string
    room_name: string
    description: string
    incident_date: string
    created_at: string
    media: IssueMedia[]
}

export default function IssuesPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState('')
    const [loading, setLoading] = useState(true)
    const [rooms, setRooms] = useState<Room[]>([])
    const [issues, setIssues] = useState<Issue[]>([])
    const [isPaid, setIsPaid] = useState(false)

    // Add issue modal state
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const [customRoomName, setCustomRoomName] = useState('')
    const [showCustomRoom, setShowCustomRoom] = useState(false)
    const [issueDescription, setIssueDescription] = useState('')
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
    const [pendingVideo, setPendingVideo] = useState<File | null>(null)
    const [videoError, setVideoError] = useState<string | null>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    // Delete state
    const [deleteIssue, setDeleteIssue] = useState<Issue | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<{ src: string }[]>([])

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

            // Check purchase status
            const { data: caseData } = await supabase
                .from('cases')
                .select('purchase_type')
                .eq('case_id', id)
                .single()

            const purchaseType = caseData?.purchase_type
            const hasPaid = purchaseType === 'checkin' || purchaseType === 'bundle' || purchaseType === 'moveout'
            setIsPaid(hasPaid)

            // Fetch rooms from check-in
            const { data: roomsData } = await supabase
                .from('rooms')
                .select('room_id, name')
                .eq('case_id', id)
                .order('created_at', { ascending: true })

            setRooms(roomsData || [])

            // Fetch issues for this case
            const { data: issuesData } = await supabase
                .from('issues')
                .select('*')
                .eq('case_id', id)
                .order('incident_date', { ascending: false })

            if (issuesData) {
                // Fetch media (photos + videos) for each issue
                const issuesWithMedia = await Promise.all(
                    issuesData.map(async (issue) => {
                        const { data: mediaAssets } = await supabase
                            .from('assets')
                            .select('asset_id, storage_path, type, mime_type')
                            .eq('issue_id', issue.issue_id)
                            .in('type', ['issue_photo', 'issue_video'])

                        // Generate signed URLs for all media
                        let signedMedia: IssueMedia[] = []
                        if (mediaAssets && mediaAssets.length > 0) {
                            const paths = mediaAssets.map(m => m.storage_path)
                            const { data: signedData } = await supabase.storage
                                .from('guard-rent')
                                .createSignedUrls(paths, 3600)

                            signedMedia = mediaAssets.map(m => ({
                                asset_id: m.asset_id,
                                storage_path: m.storage_path,
                                type: m.type as 'issue_photo' | 'issue_video',
                                mime_type: m.mime_type,
                                signedUrl: signedData?.find(s => s.path === m.storage_path)?.signedUrl
                            }))
                        }

                        return {
                            ...issue,
                            media: signedMedia
                        }
                    })
                )
                setIssues(issuesWithMedia)
            }
        } catch (err) {
            console.error('Failed to load issues:', err)
        } finally {
            setLoading(false)
        }
    }

    const openAddIssue = (roomName?: string) => {
        setSelectedRoom(roomName || null)
        setCustomRoomName('')
        setShowCustomRoom(!roomName)
        setIssueDescription('')
        setIssueDate(new Date().toISOString().split('T')[0])
        setPendingPhotos([])
        setPendingVideo(null)
        setVideoError(null)
        setShowAddModal(true)
    }

    const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (files) {
            setPendingPhotos(prev => [...prev, ...Array.from(files)])
        }
    }

    const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setVideoError(null)

        // Check duration using video element
        const video = document.createElement('video')
        video.preload = 'metadata'
        video.src = URL.createObjectURL(file)

        video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src)
            if (video.duration > 60) {
                setVideoError('Video must be 1 minute or less')
                setPendingVideo(null)
                if (videoInputRef.current) videoInputRef.current.value = ''
            } else {
                setPendingVideo(file)
            }
        }
    }

    const removePhoto = (index: number) => {
        setPendingPhotos(prev => prev.filter((_, i) => i !== index))
    }

    const removeVideo = () => {
        setPendingVideo(null)
        setVideoError(null)
        if (videoInputRef.current) videoInputRef.current.value = ''
    }

    const handleSaveIssue = async () => {
        const roomName = showCustomRoom ? customRoomName.trim() : selectedRoom
        if (!roomName || !issueDescription.trim()) return

        setSaving(true)
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Create the issue
            const { data: newIssue, error: issueError } = await supabase
                .from('issues')
                .insert({
                    case_id: caseId,
                    user_id: user.id,
                    room_name: roomName,
                    description: issueDescription.trim(),
                    incident_date: issueDate
                })
                .select()
                .single()

            if (issueError) throw issueError

            // Upload photos
            if (pendingPhotos.length > 0 && newIssue) {
                for (const file of pendingPhotos) {
                    const ext = file.name.split('.').pop() || 'jpg'
                    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`
                    const storagePath = `${user.id}/${caseId}/issues/${newIssue.issue_id}/${fileName}`

                    await supabase.storage
                        .from('guard-rent')
                        .upload(storagePath, file)

                    await supabase.from('assets').insert({
                        case_id: caseId,
                        user_id: user.id,
                        issue_id: newIssue.issue_id,
                        type: 'issue_photo',
                        original_name: file.name,
                        storage_path: storagePath,
                        file_size: file.size,
                        mime_type: file.type
                    })
                }
            }

            // Upload video
            if (pendingVideo && newIssue) {
                const ext = pendingVideo.name.split('.').pop() || 'mp4'
                const fileName = `video_${Date.now()}.${ext}`
                const storagePath = `${user.id}/${caseId}/issues/${newIssue.issue_id}/${fileName}`

                await supabase.storage
                    .from('guard-rent')
                    .upload(storagePath, pendingVideo)

                await supabase.from('assets').insert({
                    case_id: caseId,
                    user_id: user.id,
                    issue_id: newIssue.issue_id,
                    type: 'issue_video',
                    original_name: pendingVideo.name,
                    storage_path: storagePath,
                    file_size: pendingVideo.size,
                    mime_type: pendingVideo.type
                })
            }

            setShowAddModal(false)
            await loadData(caseId)
        } catch (err) {
            console.error('Failed to save issue:', err)
        } finally {
            setSaving(false)
        }
    }

    const confirmDeleteIssue = async () => {
        if (!deleteIssue) return
        setDeleting(true)
        try {
            const supabase = createClient()

            // Delete photos from storage
            const { data: photos } = await supabase
                .from('assets')
                .select('storage_path')
                .eq('issue_id', deleteIssue.issue_id)

            if (photos && photos.length > 0) {
                await supabase.storage
                    .from('guard-rent')
                    .remove(photos.map(p => p.storage_path))
            }

            // Delete asset records
            await supabase
                .from('assets')
                .delete()
                .eq('issue_id', deleteIssue.issue_id)

            // Delete issue
            await supabase
                .from('issues')
                .delete()
                .eq('issue_id', deleteIssue.issue_id)

            setIssues(prev => prev.filter(i => i.issue_id !== deleteIssue.issue_id))
            setDeleteIssue(null)
        } catch (err) {
            console.error('Failed to delete issue:', err)
        } finally {
            setDeleting(false)
        }
    }

    const openPhotoLightbox = (media: IssueMedia[]) => {
        const images = media
            .filter(m => m.type === 'issue_photo' && m.signedUrl)
            .map(m => ({ src: m.signedUrl! }))
        setLightboxImages(images)
        setLightboxOpen(true)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Issues Log</h1>
                <p className="text-slate-500 mt-1">
                    Document incidents that happen during your tenancy
                </p>
            </div>

            {/* Rooms Grid */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Log an issue by room</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {rooms.map(room => (
                        <button
                            key={room.room_id}
                            onClick={() => openAddIssue(room.name)}
                            className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-orange-300 hover:bg-orange-50 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900">{room.name}</span>
                                <Plus size={18} className="text-slate-400 group-hover:text-orange-500" />
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Add issue</p>
                        </button>
                    ))}

                    {/* Add new room/area */}
                    <button
                        onClick={() => openAddIssue()}
                        className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 text-left hover:border-slate-300 hover:bg-slate-100 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Plus size={18} className="text-slate-400" />
                            <span className="font-medium text-slate-600">Other area</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">Balcony, garden, etc.</p>
                    </button>
                </div>
            </div>

            {/* Issues Timeline */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Logged issues {issues.length > 0 && <span className="text-slate-400 font-normal">({issues.length})</span>}
                </h2>

                {issues.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <AlertTriangle className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-slate-500">No issues logged yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Use the room buttons above to log an issue
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {issues.map(issue => (
                            <div key={issue.issue_id} className="bg-white border border-slate-200 rounded-xl p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                                                {issue.room_name}
                                            </span>
                                            <span className="text-sm text-slate-500 flex items-center gap-1">
                                                <Calendar size={14} />
                                                {new Date(issue.incident_date).toLocaleDateString('en-GB', {
                                                    day: 'numeric', month: 'short', year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-slate-700">{issue.description}</p>

                                        {/* Media */}
                                        {issue.media.length > 0 && (
                                            <div className="flex gap-2 mt-3 flex-wrap">
                                                {issue.media.map((item) => (
                                                    item.type === 'issue_photo' ? (
                                                        <button
                                                            key={item.asset_id}
                                                            onClick={() => openPhotoLightbox(issue.media)}
                                                            className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-100 group"
                                                        >
                                                            {item.signedUrl && (
                                                                <img
                                                                    src={item.signedUrl}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            )}
                                                            <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1">
                                                                <ImageIcon size={10} className="text-white" />
                                                            </div>
                                                        </button>
                                                    ) : (
                                                        <a
                                                            key={item.asset_id}
                                                            href={item.signedUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="relative w-16 h-16 rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center group"
                                                        >
                                                            <Play size={20} className="text-white" />
                                                            <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1">
                                                                <Video size={10} className="text-white" />
                                                            </div>
                                                        </a>
                                                    )
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => setDeleteIssue(issue)}
                                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Add Issue Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Log an issue</h3>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Room selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Area / Room
                                </label>
                                {showCustomRoom ? (
                                    <input
                                        type="text"
                                        value={customRoomName}
                                        onChange={e => setCustomRoomName(e.target.value)}
                                        placeholder="e.g., Balcony, Storage, Garden..."
                                        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 px-4 py-3 border border-slate-200 rounded-lg bg-slate-50">
                                        <span className="font-medium">{selectedRoom}</span>
                                        <button
                                            onClick={() => setShowCustomRoom(true)}
                                            className="text-sm text-blue-600 ml-auto"
                                        >
                                            Change
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    When did this happen?
                                </label>
                                <input
                                    type="date"
                                    value={issueDate}
                                    onChange={e => setIssueDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    What happened?
                                </label>
                                <textarea
                                    value={issueDescription}
                                    onChange={e => setIssueDescription(e.target.value)}
                                    placeholder="Describe the issue, damage, or incident..."
                                    rows={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                                />
                            </div>

                            {/* Photos */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Photos
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {pendingPhotos.map((file, idx) => (
                                        <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removePhoto(idx)}
                                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50">
                                        <Camera size={20} className="text-slate-400" />
                                        <span className="text-xs text-slate-500 mt-1">Add</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                    </label>
                                </div>
                            </div>

                            {/* Video */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Video <span className="font-normal text-slate-400">(1 min max)</span>
                                </label>
                                {pendingVideo ? (
                                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                                        <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center">
                                            <Play size={20} className="text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{pendingVideo.name}</p>
                                            <p className="text-xs text-slate-500">{(pendingVideo.size / 1024 / 1024).toFixed(1)} MB</p>
                                        </div>
                                        <button
                                            onClick={removeVideo}
                                            className="p-2 text-slate-400 hover:text-red-500"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-slate-300 hover:bg-slate-50">
                                        <Video size={24} className="text-slate-400" />
                                        <span className="text-sm text-slate-500">Add a video clip</span>
                                        <input
                                            ref={videoInputRef}
                                            type="file"
                                            accept="video/*"
                                            onChange={handleVideoSelect}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {videoError && (
                                    <p className="text-sm text-red-500 mt-2">{videoError}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="flex-1 px-4 py-3 border border-slate-200 rounded-lg font-medium text-slate-700 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveIssue}
                                    disabled={saving || (!selectedRoom && !customRoomName.trim()) || !issueDescription.trim()}
                                    className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 size={18} className="animate-spin" /> : null}
                                    Save issue
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!deleteIssue}
                onClose={() => setDeleteIssue(null)}
                onConfirm={confirmDeleteIssue}
                itemType="issue"
                context="issues"
            />

            {/* Lightbox */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxImages}
            />
        </div>
    )
}
