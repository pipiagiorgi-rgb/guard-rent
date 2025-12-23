'use client'

import { useState } from 'react'
import { Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

interface UploadZoneProps {
    caseId: string
    type: 'contract' | 'photo'
    onUploadComplete?: (assetId: string) => void
    label?: string
}

export default function UploadZone({ caseId, type, onUploadComplete, label = "Add file" }: UploadZoneProps) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        setError(null)
        setSuccess(false)

        try {
            // 0. Compute SHA-256 Hash for Evidence Integrity
            const buffer = await file.arrayBuffer()
            const hashBuffer = await crypto.subtle.digest('SHA-256', buffer)
            const hashArray = Array.from(new Uint8Array(hashBuffer))
            const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

            // 1. Request Signed URL
            const res = await fetch('/api/assets/upload-url', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    caseId,
                    filename: file.name,
                    mimeType: file.type,
                    type,
                    fileHash
                })
            })

            if (!res.ok) throw new Error('Upload failed. Please try again.')
            const { signedUrl, assetId } = await res.json()

            // 2. Upload directly to Supabase Storage
            const uploadRes = await fetch(signedUrl, {
                method: 'PUT',
                body: file,
                headers: {
                    'Content-Type': file.type,
                }
            })

            if (!uploadRes.ok) throw new Error('Upload failed. Please try again.')

            // 3. Confirm & Verify (Server-side)
            await fetch('/api/assets/confirm-upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId, caseId })
            })

            setSuccess(true)
            if (onUploadComplete) onUploadComplete(assetId)

        } catch (err: any) {
            console.error(err)
            setError(err.message || 'Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full">
            <label
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploading
                    ? 'opacity-50 cursor-not-allowed border-slate-200'
                    : success
                        ? 'border-green-300 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
            >
                <input type="file" onChange={handleFileSelect} disabled={uploading} className="hidden" />

                {uploading ? (
                    <>
                        <Loader2 className="animate-spin mb-2 text-slate-600" size={28} />
                        <span className="font-medium text-slate-600">Uploading...</span>
                    </>
                ) : success ? (
                    <>
                        <CheckCircle className="mb-2 text-green-600" size={28} />
                        <span className="font-medium text-green-700">Uploaded</span>
                        <span className="text-xs text-green-600 mt-1">Click to add another</span>
                    </>
                ) : (
                    <>
                        <Upload className="mb-2 text-slate-400" size={28} />
                        <span className="font-medium text-slate-600">{label}</span>
                    </>
                )}
            </label>

            {error && (
                <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                    <p className="text-xs text-red-500 mt-1">
                        If this keeps happening, refresh the page and try again.
                    </p>
                </div>
            )}
        </div>
    )
}
