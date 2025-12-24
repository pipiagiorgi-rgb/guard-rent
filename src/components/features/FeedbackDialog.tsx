'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Send, MessageSquarePlus, Bug, Lightbulb, Check } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface FeedbackDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
    const [type, setType] = useState<'bug' | 'feature' | 'general'>('bug')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const pathname = usePathname()

    const handleSubmit = async () => {
        if (!message.trim()) return

        setLoading(true)
        setError(null)
        const supabase = createClient()

        try {
            const { data: { user } } = await supabase.auth.getUser()

            // 1. Save to database
            const { error: dbError } = await supabase.from('feedback').insert({
                user_id: user?.id,
                type,
                message,
                page_url: pathname,
                user_agent: navigator.userAgent
            })

            if (dbError) throw dbError

            setSuccess(true)

        } catch (err) {
            console.error('Feedback error:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        onOpenChange(false)
        // Reset form after modal animation
        setTimeout(() => {
            setSuccess(false)
            setMessage('')
            setType('bug')
            setError(null)
        }, 300)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                {!success ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Send Feedback</DialogTitle>
                            <DialogDescription>
                                Help us improve RentVault. What's on your mind?
                            </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                                {[
                                    { id: 'bug', label: 'Bug', icon: Bug },
                                    { id: 'feature', label: 'Idea', icon: Lightbulb },
                                    { id: 'general', label: 'Other', icon: MessageSquarePlus }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setType(t.id as any)}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-all ${type === t.id
                                            ? 'bg-white text-slate-900 shadow-sm'
                                            : 'text-slate-500 hover:text-slate-700'
                                            }`}
                                    >
                                        <t.icon size={16} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>

                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={
                                    type === 'bug' ? "What happened? Steps to reproduce..." :
                                        type === 'feature' ? "It would be great if..." :
                                            "Tell us what you think..."
                                }
                                className="min-h-[120px] p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 resize-none text-sm"
                            />

                            {error && (
                                <p className="text-sm text-red-600">{error}</p>
                            )}
                        </div>

                        <DialogFooter>
                            <Button
                                onClick={handleSubmit}
                                disabled={!message.trim() || loading}
                                className="w-full bg-slate-900 hover:bg-slate-800"
                            >
                                {loading ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4 mr-2" />
                                )}
                                Send Feedback
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-5 h-5 text-slate-600" />
                        </div>
                        <h3 className="text-base font-semibold text-slate-900 mb-2">Thank you for the feedback</h3>
                        <p className="text-sm text-slate-500 mb-6 max-w-[280px]">
                            Thanks for taking the time to share this. We review every message and use it to improve RentVault.
                        </p>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="px-6"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
