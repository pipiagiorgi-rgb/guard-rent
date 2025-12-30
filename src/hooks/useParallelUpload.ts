'use client'

import { useState, useCallback, useRef } from 'react'

export interface UploadFile {
    id: string
    file: File
    previewUrl: string
    status: 'pending' | 'uploading' | 'success' | 'error'
    assetId?: string
    error?: string
    retryCount: number
}

interface UploadConfig {
    caseId: string
    type: string
    roomId?: string
    phase?: string
    onUploadComplete?: (assetId: string) => void
    maxConcurrent?: number
    maxRetries?: number
}

/**
 * Hook for parallel file uploads with optimistic UI.
 * - Shows thumbnails immediately via URL.createObjectURL
 * - Uploads up to 3 files concurrently
 * - Tracks per-file status (pending/uploading/success/error)
 * - Auto-retry failed uploads once
 */
export function useParallelUpload(config: UploadConfig) {
    const {
        caseId,
        type,
        roomId,
        phase,
        onUploadComplete,
        maxConcurrent = 3,
        maxRetries = 1
    } = config

    const [files, setFiles] = useState<UploadFile[]>([])
    const activeUploadsRef = useRef(0)
    const queueRef = useRef<UploadFile[]>([])

    // Compute file hash (SHA-256)
    const computeHash = async (file: File): Promise<string> => {
        const buffer = await file.arrayBuffer()
        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Process upload queue
    const processQueue = useCallback(async () => {
        while (queueRef.current.length > 0 && activeUploadsRef.current < maxConcurrent) {
            const uploadFile = queueRef.current.shift()
            if (!uploadFile) break

            activeUploadsRef.current++

            // Update status to uploading
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
            ))

            try {
                // Compute hash
                const fileHash = await computeHash(uploadFile.file)

                // Request signed URL
                const res = await fetch('/api/assets/upload-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        caseId,
                        filename: uploadFile.file.name,
                        mimeType: uploadFile.file.type,
                        type,
                        roomId,
                        phase,
                        fileHash
                    })
                })

                if (!res.ok) throw new Error('Failed to get upload URL')
                const { signedUrl, assetId } = await res.json()

                // Upload to storage
                const uploadRes = await fetch(signedUrl, {
                    method: 'PUT',
                    body: uploadFile.file,
                    headers: { 'Content-Type': uploadFile.file.type }
                })

                if (!uploadRes.ok) throw new Error('Upload failed')

                // Confirm upload (non-blocking)
                fetch('/api/assets/confirm-upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assetId, caseId })
                }).catch(() => { }) // Fire and forget

                // Mark success
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, status: 'success' as const, assetId } : f
                ))

                onUploadComplete?.(assetId)

            } catch (err: any) {
                // Check for retry
                if (uploadFile.retryCount < maxRetries) {
                    // Queue for retry
                    queueRef.current.push({ ...uploadFile, retryCount: uploadFile.retryCount + 1 })
                    setFiles(prev => prev.map(f =>
                        f.id === uploadFile.id ? { ...f, status: 'pending' as const } : f
                    ))
                } else {
                    // Mark as failed
                    setFiles(prev => prev.map(f =>
                        f.id === uploadFile.id ? {
                            ...f,
                            status: 'error' as const,
                            error: err.message || 'Upload failed'
                        } : f
                    ))
                }
            } finally {
                activeUploadsRef.current--
                // Process next in queue
                processQueue()
            }
        }
    }, [caseId, type, roomId, phase, maxConcurrent, maxRetries, onUploadComplete])

    // Add files to upload queue
    const addFiles = useCallback((newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles)

        const uploadFiles: UploadFile[] = fileArray.map(file => ({
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            file,
            previewUrl: URL.createObjectURL(file),
            status: 'pending' as const,
            retryCount: 0
        }))

        setFiles(prev => [...prev, ...uploadFiles])
        queueRef.current.push(...uploadFiles)

        // Start processing
        processQueue()
    }, [processQueue])

    // Retry a failed upload
    const retryUpload = useCallback((fileId: string) => {
        const file = files.find(f => f.id === fileId)
        if (file && file.status === 'error') {
            queueRef.current.push({ ...file, retryCount: 0, status: 'pending' })
            setFiles(prev => prev.map(f =>
                f.id === fileId ? { ...f, status: 'pending' as const, error: undefined } : f
            ))
            processQueue()
        }
    }, [files, processQueue])

    // Remove a file from the list
    const removeFile = useCallback((fileId: string) => {
        setFiles(prev => {
            const file = prev.find(f => f.id === fileId)
            if (file?.previewUrl) {
                URL.revokeObjectURL(file.previewUrl)
            }
            return prev.filter(f => f.id !== fileId)
        })
        queueRef.current = queueRef.current.filter(f => f.id !== fileId)
    }, [])

    // Clear all completed/failed uploads
    const clearCompleted = useCallback(() => {
        setFiles(prev => {
            prev.filter(f => f.status === 'success' || f.status === 'error').forEach(f => {
                if (f.previewUrl) URL.revokeObjectURL(f.previewUrl)
            })
            return prev.filter(f => f.status === 'pending' || f.status === 'uploading')
        })
    }, [])

    const isUploading = files.some(f => f.status === 'uploading' || f.status === 'pending')
    const successCount = files.filter(f => f.status === 'success').length
    const errorCount = files.filter(f => f.status === 'error').length

    return {
        files,
        addFiles,
        retryUpload,
        removeFile,
        clearCompleted,
        isUploading,
        successCount,
        errorCount
    }
}
