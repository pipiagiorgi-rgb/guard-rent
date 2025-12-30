'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
    DialogDescription, DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2, Send, MessageSquarePlus, Bug, Lightbulb, Check } from 'lucide-react'
import { usePathname, useParams } from 'next/navigation'

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
    const [rentalLabel, setRentalLabel] = useState<string | null>(null)
    const pathname = usePathname()
    const params = useParams()

    // Fetch rental label if we're in a case context
    useEffect(() => {
        const caseId = params?.id as string | undefined
        if (caseId && open) {
            const fetchRentalLabel = async () => {
                const supabase = createClient()
                const { data } = await supabase
                    .from('cases')
                    .select('label')
                    .eq('case_id', caseId)
                    .single()
                if (data?.label) setRentalLabel(data.label)
            }
            fetchRentalLabel()
        }
    }, [params?.id, open])

    const handleSubmit = async () => {
        if (!message.trim()) return

        setLoading(true)
        setError(null)
        const supabase = createClient()
        const caseId = params?.id as string | undefined

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

            // 2. Send email notification to support (CRITICAL: must succeed)
            const emailRes = await fetch('/api/feedback/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    message,
                    pageUrl: pathname,
                    userEmail: user?.email,
                    rentalLabel: rentalLabel || undefined,
                    caseId: caseId || undefined
                })
            })

            if (!emailRes.ok) {
                // Email failed - show clear error, don't show success
                throw new Error('email_failed')
            }

            setSuccess(true)

        } catch (err: any) {
            console.error('Feedback error:', err)
            if (err.message === 'email_failed') {
                setError("We couldn't send your message right now. Please try again or email support@rentvault.co.")
            } else {
                setError('Something went wrong. Please try again.')
            }
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
            setRentalLabel(null)
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
                    <div className="py-6 px-4 flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <Check className="w-6 h-6 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                            Thank you!
                        </h3>
                        <p className="text-sm text-slate-600 mb-1">
                            We've received your message.
                        </p>
                        <p className="text-sm text-slate-500 mb-4">
                            Your feedback has been sent to our support team and will be reviewed by a real person.
                        </p>
                        <p className="text-xs text-slate-400 mb-6">
                            If this is urgent, contact us directly at{' '}
                            <span className="font-medium">support@rentvault.co</span>
                        </p>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="px-8"
                        >
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
