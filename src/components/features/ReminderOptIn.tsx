'use client'

import { useState } from 'react'
import { Bell, Calendar, Loader2, Check, X, AlertCircle } from 'lucide-react'

interface ReminderOptInProps {
    contractId: string
    caseId: string
    contractType: string
    providerName?: string
    label?: string
    renewalDate?: string
    noticePeriodDays?: number
    onReminderCreated?: () => void
}

export function ReminderOptIn({
    contractId,
    caseId,
    contractType,
    providerName,
    label,
    renewalDate,
    noticePeriodDays,
    onReminderCreated
}: ReminderOptInProps) {
    const [extracting, setExtracting] = useState(false)
    const [creating, setCreating] = useState(false)
    const [extracted, setExtracted] = useState<{
        renewalDate?: string
        noticePeriodDays?: number
        confidence?: string
    } | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [dismissed, setDismissed] = useState(false)

    // If already has dates, show them
    const hasExistingDates = renewalDate || noticePeriodDays

    // Don't show if dismissed or already successful
    if (dismissed || success) return null

    const handleExtract = async () => {
        setExtracting(true)
        setError(null)

        try {
            const res = await fetch('/api/ai/extract-dates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contractId })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to extract dates')
            }

            if (data.extracted && (data.renewalDate || data.noticePeriodDays)) {
                setExtracted({
                    renewalDate: data.renewalDate,
                    noticePeriodDays: data.noticePeriodDays,
                    confidence: data.confidence
                })
            } else {
                setError('No dates found. Please enter dates manually in the contract details.')
            }
        } catch (err: any) {
            setError(err.message || 'Failed to extract dates')
        } finally {
            setExtracting(false)
        }
    }

    const handleCreateReminder = async () => {
        const dateToUse = extracted?.renewalDate || renewalDate
        if (!dateToUse) {
            setError('No renewal date available')
            return
        }

        setCreating(true)
        setError(null)

        try {
            // Calculate reminder date (notice period before renewal, or 30 days if unknown)
            const notice = extracted?.noticePeriodDays || noticePeriodDays || 30

            const res = await fetch('/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    type: 'custom',
                    date: dateToUse,
                    label: `${label || providerName || contractType} renewal`,
                    offsets: [notice, 7, 1], // Remind at notice period, 7 days, and 1 day before
                    rentalLabel: label || providerName || contractType
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create reminder')
            }

            setSuccess(true)
            onReminderCreated?.()
        } catch (err: any) {
            setError(err.message || 'Failed to create reminder')
        } finally {
            setCreating(false)
        }
    }

    // If we already have dates from the contract, show prompt directly
    if (hasExistingDates && !extracted) {
        return (
            <div className="border-t border-slate-100 p-4 bg-blue-50/50">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bell size={16} className="text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            {renewalDate ? 'Renewal date found' : 'Notice period found'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {renewalDate && `Renews: ${new Date(renewalDate).toLocaleDateString('en-GB')}`}
                            {renewalDate && noticePeriodDays && ' · '}
                            {noticePeriodDays && `${noticePeriodDays} days notice required`}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleCreateReminder}
                                disabled={creating}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {creating ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Bell size={12} />
                                )}
                                Add reminder
                            </button>
                            <button
                                onClick={() => setDismissed(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={12} />
                                Dismiss
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // If we've extracted dates, show confirmation
    if (extracted) {
        return (
            <div className="border-t border-slate-100 p-4 bg-emerald-50/50">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                            Possible renewal date found
                            {extracted.confidence && (
                                <span className={`text-xs ml-2 px-1.5 py-0.5 rounded ${extracted.confidence === 'high'
                                        ? 'bg-emerald-100 text-emerald-700'
                                        : extracted.confidence === 'medium'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-slate-100 text-slate-600'
                                    }`}>
                                    {extracted.confidence} confidence
                                </span>
                            )}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {extracted.renewalDate && `Renewal: ${new Date(extracted.renewalDate).toLocaleDateString('en-GB')}`}
                            {extracted.renewalDate && extracted.noticePeriodDays && ' · '}
                            {extracted.noticePeriodDays && `${extracted.noticePeriodDays} days notice`}
                        </p>
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={handleCreateReminder}
                                disabled={creating}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                            >
                                {creating ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : (
                                    <Bell size={12} />
                                )}
                                Add reminder
                            </button>
                            <button
                                onClick={() => setDismissed(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                            >
                                <X size={12} />
                                Skip
                            </button>
                        </div>
                        {error && (
                            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                                <AlertCircle size={12} />
                                {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    // Initial state - offer to check for dates
    return (
        <div className="border-t border-slate-100 p-4">
            <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
            >
                {extracting ? (
                    <>
                        <Loader2 size={14} className="animate-spin" />
                        Checking for renewal dates...
                    </>
                ) : (
                    <>
                        <Bell size={14} />
                        Check for renewal reminders
                    </>
                )}
            </button>
            {error && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                    <AlertCircle size={12} />
                    {error}
                </p>
            )}
        </div>
    )
}
