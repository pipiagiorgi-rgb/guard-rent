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
                return 'This seals your Move-In record with a system timestamp. After locking, photos and videos become part of your permanent evidence record.'
            case 'move-out':
                return 'This seals your Move-Out evidence and completes your tenancy record. After locking, your evidence becomes permanent and shareable.'
            case 'keys':
                return 'This creates a timestamped record confirming when you returned the keys.'
        }
    }

    const getButtonText = () => {
        switch (type) {
            case 'move-in':
                return 'Complete Move-In'
            case 'move-out':
                return 'Complete Move-Out'
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
                        {type === 'move-in' && 'Your Move-In evidence will be sealed with an official timestamp.'}
                        {type === 'move-out' && 'Your Move-Out evidence will be sealed and your tenancy marked complete.'}
                        {type === 'keys' && 'This creates an official record of your key return.'}
                    </p>
                    <p className="text-sm text-blue-700 mt-1">
                        {type === 'move-in' && 'Photos and videos will be locked — you can always download your records.'}
                        {type === 'move-out' && 'You\'ll be able to download and share your Move-Out PDF anytime.'}
                        {type === 'keys' && 'The date and time will be recorded and included in your Move-Out record.'}
                    </p>
                </div>

                <div className="text-sm text-slate-600 space-y-1.5">
                    <p>✓ Sealed with UTC timestamp</p>
                    <p>✓ Records become tamper-proof</p>
                    <p>✓ Download and share anytime</p>
                </div>

                {/* Reassurance line */}
                <p className="text-xs text-slate-500 mt-3">
                    {type === 'move-in' && 'Your evidence is ready. A confirmation email will be sent once complete.'}
                    {type === 'move-out' && 'You\'ll receive a confirmation email with your Move-Out PDF.'}
                    {type === 'keys' && 'A confirmation email will be sent once complete.'}
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
