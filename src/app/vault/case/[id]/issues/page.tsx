'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Plus,
    FileText,
    Calendar,
    Camera,
    Video,
    Loader2,
    ChevronDown,
    ChevronUp,
    X,
    Trash2,
    Play,
    Image as ImageIcon,
    Wrench,
    AlertCircle,
    StickyNote,
    Download
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
    original_name?: string
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

    // Add entry modal state
    const [showAddModal, setShowAddModal] = useState(false)
    const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
    const [customRoomName, setCustomRoomName] = useState('')
    const [showCustomRoom, setShowCustomRoom] = useState(false)
    const [issueDescription, setIssueDescription] = useState('')
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [entryType, setEntryType] = useState<'note' | 'maintenance' | 'damage' | 'other'>('note')
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
    const [pendingVideo, setPendingVideo] = useState<File | null>(null)
    const [videoError, setVideoError] = useState<string | null>(null)
    const videoInputRef = useRef<HTMLInputElement>(null)

    // Expanded issue for viewing details
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null)

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
                        const { data: mediaAssets, error: mediaError } = await supabase
                            .from('assets')
                            .select('asset_id, storage_path, type, mime_type, original_name')
                            .eq('issue_id', issue.issue_id)
                            .in('type', ['issue_photo', 'issue_video'])

                        // Debug logging
                        console.log('[Issues] Fetching media for issue:', issue.issue_id)
                        console.log('[Issues] Media query result:', { count: mediaAssets?.length, error: mediaError })

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
        setEntryType('note')
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

                    const { error: uploadError } = await supabase.storage
                        .from('guard-rent')
                        .upload(storagePath, file)

                    if (uploadError) {
                        console.error('[Issues] Photo upload failed:', uploadError)
                        continue
                    }

                    const { error: insertError } = await supabase.from('assets').insert({
                        case_id: caseId,
                        user_id: user.id,
                        issue_id: newIssue.issue_id,
                        type: 'issue_photo',
                        original_name: file.name,
                        storage_path: storagePath,
                        size_bytes: file.size,
                        mime_type: file.type
                    })

                    if (insertError) {
                        console.error('[Issues] Photo asset insert failed:', insertError)
                    } else {
                        console.log('[Issues] Photo saved successfully:', storagePath)
                    }
                }
            }

            // Upload video
            if (pendingVideo && newIssue) {
                const ext = pendingVideo.name.split('.').pop() || 'mp4'
                const fileName = `video_${Date.now()}.${ext}`
                const storagePath = `${user.id}/${caseId}/issues/${newIssue.issue_id}/${fileName}`

                const { error: videoUploadError } = await supabase.storage
                    .from('guard-rent')
                    .upload(storagePath, pendingVideo)

                if (videoUploadError) {
                    console.error('[Issues] Video upload failed:', videoUploadError)
                } else {
                    const { error: videoInsertError } = await supabase.from('assets').insert({
                        case_id: caseId,
                        user_id: user.id,
                        issue_id: newIssue.issue_id,
                        type: 'issue_video',
                        original_name: pendingVideo.name,
                        storage_path: storagePath,
                        size_bytes: pendingVideo.size,
                        mime_type: pendingVideo.type
                    })

                    if (videoInsertError) {
                        console.error('[Issues] Video asset insert failed:', videoInsertError)
                    } else {
                        console.log('[Issues] Video saved successfully:', storagePath)
                    }
                }
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

    // Entry type configuration
    const entryTypes = [
        { id: 'note' as const, label: 'General note', icon: StickyNote, color: 'bg-slate-100 text-slate-600' },
        { id: 'maintenance' as const, label: 'Maintenance', icon: Wrench, color: 'bg-blue-100 text-blue-600' },
        { id: 'damage' as const, label: 'Damage', icon: AlertCircle, color: 'bg-amber-100 text-amber-700' },
        { id: 'other' as const, label: 'Other', icon: FileText, color: 'bg-slate-100 text-slate-600' }
    ]

    const getEntryTypeStyle = (type: string) => {
        const found = entryTypes.find(t => t.id === type)
        return found?.color || 'bg-slate-100 text-slate-600'
    }

    const getEntryTypeLabel = (type: string) => {
        const found = entryTypes.find(t => t.id === type)
        return found?.label || 'Note'
    }

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Condition & Notes</h1>
                <p className="text-slate-500 mt-1">
                    Private notes for maintenance, observations, or incidents during your tenancy.
                </p>
            </div>

            {/* Trust line */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-sm text-slate-600">
                    These records are for your reference and are not sealed evidence.
                    Photos and videos help provide context. They remain private and editable.
                </p>
            </div>

            {/* Rooms Grid */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Add a note by room</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {rooms.map(room => (
                        <button
                            key={room.room_id}
                            onClick={() => openAddIssue(room.name)}
                            className="bg-white border border-slate-200 rounded-xl p-4 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="font-medium text-slate-900">{room.name}</span>
                                <Plus size={18} className="text-slate-400 group-hover:text-blue-500" />
                            </div>
                            <p className="text-sm text-slate-500 mt-1">Add entry</p>
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

            {/* Entries Timeline */}
            <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                    Recorded entries {issues.length > 0 && <span className="text-slate-400 font-normal">({issues.length})</span>}
                </h2>

                {issues.length === 0 ? (
                    <div className="bg-white border border-slate-200 rounded-xl p-8 text-center">
                        <FileText className="mx-auto text-slate-300 mb-3" size={40} />
                        <p className="text-slate-500">No entries recorded yet</p>
                        <p className="text-sm text-slate-400 mt-1">
                            Use the room buttons above to add a note or incident
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {issues.map(issue => {
                            const isExpanded = expandedIssue === issue.issue_id
                            const photos = issue.media.filter(m => m.type === 'issue_photo')
                            const videos = issue.media.filter(m => m.type === 'issue_video')

                            return (
                                <div key={issue.issue_id} className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                                    {/* Clickable header */}
                                    <button
                                        onClick={() => setExpandedIssue(isExpanded ? null : issue.issue_id)}
                                        className="w-full p-4 flex items-start justify-between gap-4 text-left hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                                    {issue.room_name}
                                                </span>
                                                <span className="text-sm text-slate-500 flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(issue.incident_date).toLocaleDateString('en-GB', {
                                                        day: 'numeric', month: 'short', year: 'numeric'
                                                    })}
                                                </span>
                                                {issue.media.length > 0 && (
                                                    <span className="text-xs text-slate-400 flex items-center gap-1">
                                                        {photos.length > 0 && <><ImageIcon size={12} /> {photos.length}</>}
                                                        {videos.length > 0 && <><Video size={12} className="ml-1" /> {videos.length}</>}
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-slate-700 ${isExpanded ? '' : 'line-clamp-2'}`}>
                                                {issue.description}
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {isExpanded ? (
                                                <ChevronUp size={20} className="text-slate-400" />
                                            ) : (
                                                <ChevronDown size={20} className="text-slate-400" />
                                            )}
                                        </div>
                                    </button>

                                    {/* Expanded details */}
                                    {isExpanded && (
                                        <div className="px-4 pb-4 border-t border-slate-100 bg-slate-50">
                                            {/* Title / short description */}
                                            <div className="py-4">
                                                <h4 className="text-sm font-medium text-slate-500 mb-2">Description</h4>
                                                <p className="text-slate-700 whitespace-pre-wrap">{issue.description}</p>
                                            </div>

                                            {/* Media gallery */}
                                            <div className="py-4 border-t border-slate-200">
                                                {issue.media.length > 0 ? (
                                                    <>
                                                        <h4 className="text-sm font-medium text-slate-500 mb-3">
                                                            Media ({photos.length} photo{photos.length !== 1 ? 's' : ''}{videos.length > 0 ? `, ${videos.length} video${videos.length !== 1 ? 's' : ''}` : ''})
                                                        </h4>
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                            {issue.media.map((item) => (
                                                                <div key={item.asset_id} className="relative group">
                                                                    {item.type === 'issue_photo' ? (
                                                                        <button
                                                                            onClick={() => openPhotoLightbox(issue.media)}
                                                                            className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-100 hover:ring-2 hover:ring-blue-500 transition-all"
                                                                        >
                                                                            {item.signedUrl && (
                                                                                <img
                                                                                    src={item.signedUrl}
                                                                                    alt=""
                                                                                    className="w-full h-full object-cover"
                                                                                />
                                                                            )}
                                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                                                        </button>
                                                                    ) : (
                                                                        <a
                                                                            href={item.signedUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="relative aspect-square w-full rounded-lg overflow-hidden bg-slate-800 flex items-center justify-center hover:ring-2 hover:ring-blue-500 transition-all"
                                                                        >
                                                                            <Play size={24} className="text-white" />
                                                                            <div className="absolute bottom-1 left-1 bg-black/60 rounded px-1.5 py-0.5 text-xs text-white flex items-center gap-1">
                                                                                <Play size={10} /> Play video
                                                                            </div>
                                                                        </a>
                                                                    )}
                                                                    {/* Download button */}
                                                                    <a
                                                                        href={item.signedUrl}
                                                                        download={item.original_name || `${item.type}_${item.asset_id}`}
                                                                        className="absolute top-1 right-1 p-1.5 bg-white/90 hover:bg-white rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        title="Download"
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <Download size={14} className="text-slate-600" />
                                                                    </a>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <p className="mt-3 text-xs text-slate-400">
                                                            These photos and videos are stored separately and won&apos;t appear in reports unless you choose to include them.
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-slate-400">
                                                        No photos or videos attached to this entry.
                                                    </p>
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            <div className="py-4 border-t border-slate-200">
                                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                                    <div>
                                                        Logged on{' '}
                                                        {new Date(issue.created_at).toLocaleDateString('en-GB', {
                                                            day: 'numeric', month: 'short', year: 'numeric'
                                                        })}{' '}at{' '}
                                                        {new Date(issue.created_at).toLocaleTimeString('en-GB', {
                                                            hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </div>
                                                    <div>
                                                        Incident occurred on{' '}
                                                        {new Date(issue.incident_date).toLocaleDateString('en-GB', {
                                                            day: 'numeric', month: 'long', year: 'numeric'
                                                        })}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="pt-4 border-t border-slate-200 flex justify-end">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setDeleteIssue(issue)
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors text-sm"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove entry
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Add Issue Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold">Add a note or incident</h3>
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

                            {/* Entry Type */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Type of entry
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {entryTypes.map((type) => {
                                        const Icon = type.icon
                                        const isSelected = entryType === type.id
                                        return (
                                            <button
                                                key={type.id}
                                                type="button"
                                                onClick={() => setEntryType(type.id)}
                                                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-colors text-left ${isSelected
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                                    }`}
                                            >
                                                <Icon size={16} />
                                                <span className="text-sm font-medium">{type.label}</span>
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    What would you like to record?
                                </label>
                                <textarea
                                    value={issueDescription}
                                    onChange={e => setIssueDescription(e.target.value)}
                                    placeholder="Describe what you noticed or what happened..."
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
                                    {/* Camera button for direct capture */}
                                    <label className="w-20 h-20 border-2 border-dashed border-blue-200 bg-blue-50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-100">
                                        <Camera size={20} className="text-blue-500" />
                                        <span className="text-xs text-blue-600 mt-1">Camera</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            capture="environment"
                                            onChange={handlePhotoSelect}
                                            className="hidden"
                                        />
                                    </label>
                                    {/* Gallery button for file picker */}
                                    <label className="w-20 h-20 border-2 border-dashed border-slate-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-300 hover:bg-slate-50">
                                        <Plus size={20} className="text-slate-400" />
                                        <span className="text-xs text-slate-500 mt-1">Gallery</span>
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
                                            <p className="text-sm font-medium text-slate-900 truncate">{decodeURIComponent(pendingVideo.name)}</p>
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
                                    Save entry
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
