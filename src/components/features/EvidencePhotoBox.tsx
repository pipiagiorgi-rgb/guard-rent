'use client'

import { useState, useId } from 'react'
import { Camera, Plus, Loader2, X } from 'lucide-react'

// Generic photo type - accepts any object with these minimum fields
interface Photo {
    asset_id: string
    storage_path: string
    signedUrl?: string
    [key: string]: unknown // Allow additional fields
}

interface EvidencePhotoBoxProps {
    title: string
    description: string
    photos: Photo[]
    onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
    onDelete?: (asset: Photo) => void
    isLocked: boolean
    uploading?: boolean
    recommendedCount?: number
}

/**
 * Self-contained evidence photo upload box.
 * Uses <label> for file input to ensure mobile compatibility.
 */
export function EvidencePhotoBox({
    title,
    description,
    photos,
    onUpload,
    onDelete,
    isLocked,
    uploading = false,
    recommendedCount = 5
}: EvidencePhotoBoxProps) {
    const inputId = useId()
    const [isDragging, setIsDragging] = useState(false)

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (!isLocked) setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (isLocked) return

        const files = e.dataTransfer.files
        if (files.length > 0) {
            const fakeEvent = {
                target: { files }
            } as React.ChangeEvent<HTMLInputElement>
            onUpload(fakeEvent)
        }
    }

    return (
        <div
            className={`border-2 rounded-xl p-4 transition-colors ${isDragging && !isLocked
                    ? 'border-blue-400 bg-blue-50'
                    : isLocked
                        ? 'border-slate-100 bg-slate-50'
                        : 'border-dashed border-slate-200 hover:border-slate-300'
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-700">{title}</h3>
                <span className="text-xs text-slate-400">
                    {photos.length} / {recommendedCount} added
                </span>
            </div>

            {/* Hidden file input - positioned to allow label clicks */}
            <input
                id={inputId}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={onUpload}
                disabled={uploading || isLocked}
            />

            {photos.length > 0 ? (
                /* Photo grid with inline add button */
                <div className="space-y-3">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {photos.map((asset) => (
                            <div
                                key={asset.asset_id}
                                className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100"
                            >
                                {asset.signedUrl && (
                                    <img
                                        src={asset.signedUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {!isLocked && onDelete && (
                                    <button
                                        onClick={() => onDelete(asset)}
                                        className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                )}
                            </div>
                        ))}

                        {/* Add more tile - label wrapping input for mobile compat */}
                        {!isLocked && (
                            <label
                                htmlFor={inputId}
                                className={`aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex flex-col items-center justify-center text-slate-400 hover:text-slate-500 cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                {uploading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-5 h-5" />
                                        <span className="text-xs mt-1">Add</span>
                                    </>
                                )}
                            </label>
                        )}
                    </div>

                    {/* Description below grid */}
                    <p className="text-xs text-slate-400">{description}</p>
                </div>
            ) : (
                /* Empty state with upload label */
                <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-xl mx-auto mb-3 flex items-center justify-center">
                        <Camera className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-500 mb-3">{description}</p>
                    {!isLocked && (
                        <label
                            htmlFor={inputId}
                            className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                            {uploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Add Photos
                                </>
                            )}
                        </label>
                    )}
                    {isDragging && !isLocked && (
                        <p className="text-sm text-blue-600 mt-2">Drop photos here</p>
                    )}
                </div>
            )}
        </div>
    )
}
