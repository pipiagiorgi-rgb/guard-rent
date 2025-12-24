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
    type: 'check-in' | 'handover' | 'keys'
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
            case 'check-in':
                return 'Lock check-in evidence?'
            case 'handover':
                return 'Complete & lock handover?'
            case 'keys':
                return 'Confirm keys returned?'
        }
    }

    const getDescription = () => {
        switch (type) {
            case 'check-in':
                return 'This seals your check-in evidence with a system timestamp. After locking, photos and videos cannot be added, edited, or deleted.'
            case 'handover':
                return 'This seals your handover evidence and marks your tenancy as complete. After locking, no changes can be made to handover records.'
            case 'keys':
                return 'This creates a timestamped record that you returned the keys. The exact date and time will be recorded as proof of key handover.'
        }
    }

    const getButtonText = () => {
        switch (type) {
            case 'check-in':
                return 'Lock check-in'
            case 'handover':
                return 'Complete & lock'
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

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 my-2">
                    <p className="text-sm text-blue-800">
                        {getDescription()}
                    </p>
                </div>

                <div className="text-sm text-slate-600 space-y-1">
                    <p>✓ Evidence will be sealed with UTC timestamp</p>
                    <p>✓ Records become tamper-proof</p>
                    <p>✓ PDFs will show "Locked" status</p>
                </div>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        disabled={locking}
                        className="flex-1 py-3 border border-slate-200 rounded-xl font-medium hover:bg-slate-50 disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={locking}
                        className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {locking ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <>
                                <ShieldCheck size={16} />
                                {getButtonText()}
                            </>
                        )}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
