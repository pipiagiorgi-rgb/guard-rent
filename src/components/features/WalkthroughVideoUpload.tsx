'use client'

import { useState, useCallback, useRef } from 'react'
import { Video, Upload, Trash2, Loader2, CheckCircle, Lock, AlertCircle, Download } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface WalkthroughVideoUploadProps {
    caseId: string
    phase: 'check-in' | 'handover'
    isLocked: boolean
    isPaid: boolean
    existingVideo?: {
        assetId: string
        fileName: string
        durationSeconds?: number
        uploadedAt: string
        fileHash?: string
    }
    onVideoUploaded: () => void
    onVideoDeleted: () => void
}

export function WalkthroughVideoUpload({
    caseId,
    phase,
    isLocked,
    isPaid,
    existingVideo,
    onVideoUploaded,
    onVideoDeleted
}: WalkthroughVideoUploadProps) {
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState<string | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getVideoMetadata = (file: File): Promise<{ duration: number; resolution: string }> => {
        return new Promise((resolve, reject) => {
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
                const duration = Math.round(video.duration)
                const resolution = `${video.videoWidth}x${video.videoHeight}`
                URL.revokeObjectURL(video.src)
                resolve({ duration, resolution })
            }
            video.onerror = () => reject(new Error('Could not read video metadata'))
            video.src = URL.createObjectURL(file)
        })
    }

    const handleUpload = useCallback(async (file: File) => {
        setError(null)
        setProgress(0)

        // Validate file type
        if (!['video/mp4', 'video/quicktime'].includes(file.type)) {
            setError('Only MP4 and MOV videos are allowed')
            return
        }

        // Validate file size (2GB max)
        if (file.size > 2 * 1024 * 1024 * 1024) {
            setError('Video must be under 2GB')
            return
        }

        setUploading(true)

        try {
            // Get video metadata
            const { duration, resolution } = await getVideoMetadata(file)

            // Validate duration (5 minutes max)
            if (duration > 300) {
                setError('Video must be under 5 minutes')
                setUploading(false)
                return
            }

            // Get presigned upload URL
            const res = await fetch('/api/assets/video-upload-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    phase,
                    durationSeconds: duration,
                    resolution
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to prepare upload')

            // Upload file to Supabase Storage
            setProgress(10)

            const uploadRes = await fetch(data.uploadUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type
                }
            })

            if (!uploadRes.ok) {
                throw new Error('Failed to upload video')
            }

            setProgress(100)

            // Confirm upload
            await fetch('/api/assets/confirm-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: data.assetId })
            })

            onVideoUploaded()

        } catch (err: any) {
            setError(err.message || 'Upload failed')
        } finally {
            setUploading(false)
            setProgress(0)
        }
    }, [caseId, phase, onVideoUploaded])

    const handleDelete = async () => {
        if (!existingVideo || deleting) return

        setDeleting(true)
        setError(null)

        try {
            const res = await fetch(`/api/assets/video-delete?assetId=${existingVideo.assetId}&caseId=${caseId}`, {
                method: 'DELETE'
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to delete video')

            onVideoDeleted()

        } catch (err: any) {
            setError(err.message || 'Delete failed')
        } finally {
            setDeleting(false)
        }
    }

    const handleDownload = async () => {
        if (!existingVideo || downloading) return

        setDownloading(true)
        setError(null)

        try {
            const res = await fetch('/api/assets/download-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: existingVideo.assetId })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to get download link')

            // Trigger download
            const link = document.createElement('a')
            link.href = data.signedUrl
            link.download = existingVideo.fileName || 'walkthrough-video.mp4'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

        } catch (err: any) {
            setError(err.message || 'Download failed')
        } finally {
            setDownloading(false)
        }
    }

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)

        const file = e.dataTransfer.files[0]
        if (file) handleUpload(file)
    }, [handleUpload])

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) handleUpload(file)
    }

    // Paywall for unpaid users
    if (!isPaid) {
        return (
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Lock className="text-slate-400" size={24} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Walkthrough video upload</h3>
                <p className="text-sm text-slate-500 mb-4 max-w-xs mx-auto">
                    Record a timestamped walkthrough video to document the property condition. Available with full access.
                </p>
                <a
                    href={`/vault/case/${caseId}/exports`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                >
                    <Video size={16} />
                    Unlock video upload
                </a>
            </div>
        )
    }

    // Locked state - show recorded video
    if (isLocked && existingVideo) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                        <Video className="text-green-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">Walkthrough video</span>
                            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                                <Lock size={10} />
                                Recorded
                            </span>
                        </div>
                        <p className="text-sm text-slate-500">
                            {existingVideo.durationSeconds && formatDuration(existingVideo.durationSeconds)} ·
                            Uploaded {new Date(existingVideo.uploadedAt).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })} UTC
                        </p>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Download video"
                    >
                        {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                </div>
                {existingVideo.fileHash && (
                    <p className="text-xs text-slate-400 font-mono truncate">
                        SHA-256: {existingVideo.fileHash.substring(0, 16)}...
                    </p>
                )}
                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {error}
                    </p>
                )}
            </div>
        )
    }

    // Existing video (not locked) - show with delete and download options
    if (existingVideo && !isLocked) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Video className="text-blue-600" size={20} />
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">Walkthrough video</span>
                            <CheckCircle size={16} className="text-green-500" />
                        </div>
                        <p className="text-sm text-slate-500">
                            {existingVideo.durationSeconds && formatDuration(existingVideo.durationSeconds)} · Uploaded
                        </p>
                    </div>
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Download video"
                    >
                        {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                    </button>
                    <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete video"
                    >
                        {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                </div>
                {error && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {error}
                    </p>
                )}
            </div>
        )
    }

    // Upload state
    return (
        <div
            className={`bg-white border-2 border-dashed rounded-xl p-6 text-center transition-colors ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300'
                } ${isLocked ? 'opacity-50 pointer-events-none' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Video className="text-slate-400" size={24} />
            </div>

            <h3 className="font-medium text-slate-800 mb-1">
                Walkthrough video <span className="text-slate-400 font-normal">(optional)</span>
            </h3>
            <p className="text-sm text-slate-500 mb-4">
                A single continuous video showing the full apartment.<br />
                Useful for providing context alongside photos.
            </p>

            {uploading ? (
                <div className="space-y-2">
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className="text-sm text-slate-500">Uploading... {progress}%</p>
                </div>
            ) : (
                <>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Upload size={16} />
                        Upload Video
                    </button>
                    <p className="text-xs text-slate-400 mt-3">
                        Max 5 minutes · MP4 or MOV · Up to 2GB
                    </p>
                </>
            )}

            {error && (
                <p className="mt-3 text-sm text-red-600 flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> {error}
                </p>
            )}
        </div>
    )
}
