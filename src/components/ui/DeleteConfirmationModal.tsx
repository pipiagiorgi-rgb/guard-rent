'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

interface DeleteConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    title?: string
    description?: string
    itemType?: 'photo' | 'video' | 'file' | 'room'
    itemName?: string
    context?: 'check-in' | 'handover' | 'general'
    customMessage?: string
}

export function DeleteConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    itemType = 'photo',
    itemName,
    context = 'general',
    customMessage
}: DeleteConfirmationModalProps) {
    const [deleting, setDeleting] = useState(false)

    const getTitle = () => {
        if (title) return title
        if (itemName) return `Delete "${itemName}"?`
        return `Delete ${itemType}?`
    }

    const getDescription = () => {
        if (description) return description
        if (customMessage) return customMessage

        const contextText = context === 'check-in'
            ? 'check-in evidence record'
            : context === 'handover'
                ? 'handover evidence record'
                : 'rental records'

        return `This ${itemType} is part of your ${contextText}. Once deleted, it cannot be recovered and will no longer appear in any generated PDFs.`
    }

    const handleConfirm = async () => {
        setDeleting(true)
        try {
            await onConfirm()
            onClose()
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="text-red-600" size={24} />
                        </div>
                        <div>
                            <DialogTitle className="text-lg">{getTitle()}</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm">
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 my-2">
                    <p className="text-sm text-amber-800">
                        <strong>Evidence warning:</strong> {getDescription()}
                    </p>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        disabled={deleting}
                        className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={deleting}
                        className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {deleting ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete permanently
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
