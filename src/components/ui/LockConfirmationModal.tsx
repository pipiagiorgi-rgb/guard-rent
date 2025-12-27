'use client'

import { useState } from 'react'
import { ShieldCheck, Loader2, Lock } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'

interface LockConfirmationModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    type: 'move-in' | 'move-out' | 'keys'
}

export function LockConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    type
}: LockConfirmationModalProps) {
    const [locking, setLocking] = useState(false)

    const getTitle = () => {
        switch (type) {
            case 'move-in':
                return 'Complete & lock Move-In?'
            case 'move-out':
                return 'Complete & lock Move-Out?'
            case 'keys':
                return 'Confirm keys returned?'
        }
    }

    const getDescription = () => {
        switch (type) {
            case 'move-in':
                return 'This seals your Move-In evidence with a system timestamp. After locking, photos and videos cannot be added, edited, or deleted.'
            case 'move-out':
                return 'This seals your Move-Out evidence and marks your tenancy as complete. After locking, no changes can be made to Move-Out records.'
            case 'keys':
                return 'This creates a timestamped record that you returned the keys. The exact date and time will be recorded as proof of key return.'
        }
    }

    const getButtonText = () => {
        switch (type) {
            case 'move-in':
                return 'Complete & Lock Move-In'
            case 'move-out':
                return 'Complete & Lock Move-Out'
            case 'keys':
                return 'Confirm keys returned'
        }
    }

    const handleConfirm = async () => {
        setLocking(true)
        try {
            await onConfirm()
            onClose()
        } finally {
            setLocking(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {type === 'keys' ? (
                                <Lock className="text-blue-600" size={24} />
                            ) : (
                                <ShieldCheck className="text-blue-600" size={24} />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg">{getTitle()}</DialogTitle>
                            <DialogDescription className="text-slate-500 text-sm">
                                This action cannot be undone
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-3">
                    <p className="text-sm text-blue-800 font-medium">
                        {type === 'move-in' && 'This seals your Move-In record with a system timestamp.'}
                        {type === 'move-out' && 'This seals your Move-Out evidence and marks your tenancy as complete.'}
                        {type === 'keys' && 'This creates a timestamped record that you returned the keys.'}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        {type === 'move-in' && 'After locking, photos and videos cannot be added, edited, or deleted.'}
                        {type === 'move-out' && 'After locking, no changes can be made to Move-Out records.'}
                        {type === 'keys' && 'The exact date and time will be recorded as proof of key return.'}
                    </p>
                </div>

                <div className="text-sm text-slate-600 space-y-1.5">
                    <p>✓ Evidence will be sealed with UTC timestamp</p>
                    <p>✓ Records become tamper-proof</p>
                    <p>✓ PDFs will show "Locked" status</p>
                </div>

                {/* Reassurance line */}
                <p className="text-xs text-slate-400 mt-3">
                    You'll receive a confirmation email once this is complete.
                </p>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        disabled={locking}
                        className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={locking}
                        className="flex-1 py-3 px-6 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {locking ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            getButtonText()
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
