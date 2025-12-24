'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Info, Calendar, CreditCard, Loader2, AlertCircle, Save, FileText, Plus, Trash2, Edit3, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface Suggestion {
    label: string
    date: string
    reason: string
}

interface ContractData {
    lease_end_date?: { value: string }
    notice_period?: { value: string }
    notice_method?: { value: string }
    notice_condition?: { value: string }
    payment_due_date?: { value: string }
    rent_amount?: { value: string }
}

interface Reminder {
    enabled: boolean
    date?: string
    offsets: number[]
    saved: boolean
}

interface CustomReminder {
    id?: string
    label: string
    date: string
    offsets: number[]
    saved: boolean
}

export default function DeadlinesPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<'termination' | 'rent' | 'custom' | null>(null)
    const [rentalLabel, setRentalLabel] = useState('')
    const [contractData, setContractData] = useState<ContractData | null>(null)
    const [hasContract, setHasContract] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Manual input state (for when contract has no data)
    const [manualLeaseEnd, setManualLeaseEnd] = useState('')
    const [manualNoticePeriod, setManualNoticePeriod] = useState('3')
    const [showManualInput, setShowManualInput] = useState(false)

    // Reminders state
    const [termination, setTermination] = useState<Reminder>({
        enabled: false,
        offsets: [30],
        saved: false
    })

    const [rent, setRent] = useState<Reminder & { dueDay: string }>({
        enabled: false,
        offsets: [3],
        saved: false,
        dueDay: '1'
    })

    // Custom reminders
    const [customReminders, setCustomReminders] = useState<CustomReminder[]>([])
    const [showAddCustom, setShowAddCustom] = useState(false)
    const [newCustomReminder, setNewCustomReminder] = useState<CustomReminder>({
        label: '',
        date: '',
        offsets: [7],
        saved: false
    })

    // AI Suggestions
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [suggestionsError, setSuggestionsError] = useState<string | null>(null)

    // Load initial data
    useEffect(() => {
        async function load() {
            const { id } = await params
            setCaseId(id)

            try {
                const supabase = createClient()

                // 1. Get Case & Contract Data
                const { data: caseData } = await supabase
                    .from('cases')
                    .select('label, contract_analysis, lease_end')
                    .eq('case_id', id)
                    .single()

                if (caseData) {
                    setRentalLabel(caseData.label || 'Your rental')

                    // Check if contract was analyzed
                    if (caseData.contract_analysis?.analysis) {
                        setHasContract(true)
                        const analysis = caseData.contract_analysis.analysis
                        setContractData(analysis)

                        // Pre-fill rent day from contract
                        if (analysis.payment_due_date?.value) {
                            const match = analysis.payment_due_date.value.match(/\d+/)
                            if (match) setRent(prev => ({ ...prev, dueDay: match[0] }))
                        }
                    } else {
                        setHasContract(false)
                    }

                    // Pre-fill manual lease end from database if exists
                    if (caseData.lease_end) {
                        setManualLeaseEnd(caseData.lease_end)
                    }
                }

                // 2. Get Existing Reminders
                const { data: deadlines } = await supabase
                    .from('deadlines')
                    .select('*')
                    .eq('case_id', id)

                if (deadlines) {
                    const termData = deadlines.find(d => d.type === 'termination_notice')
                    const rentData = deadlines.find(d => d.type === 'rent_payment')
                    const customData = deadlines.filter(d => d.type === 'custom')

                    if (termData) {
                        setTermination({
                            enabled: true,
                            date: termData.due_date ? new Date(termData.due_date).toISOString().split('T')[0] : undefined,
                            offsets: termData.preferences?.offsets || [30],
                            saved: true
                        })
                    }

                    if (rentData) {
                        setRent({
                            enabled: true,
                            offsets: rentData.preferences?.offsets || [3],
                            saved: true,
                            dueDay: rentData.preferences?.dueDay || '1'
                        })
                    }

                    if (customData.length > 0) {
                        setCustomReminders(customData.map(d => ({
                            id: d.id,
                            label: d.preferences?.label || 'Custom reminder',
                            date: d.due_date ? new Date(d.due_date).toISOString().split('T')[0] : '',
                            offsets: d.preferences?.offsets || [7],
                            saved: true
                        })))
                    }
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [params])

    // Calculate suggested termination date from contract or manual input
    const getSuggestedTerminationDate = () => {
        // Try contract data first
        let leaseEndStr = contractData?.lease_end_date?.value
        let noticeMonths = 3

        // Parse notice period from contract
        if (contractData?.notice_period?.value) {
            const match = contractData.notice_period.value.match(/(\d+)/)
            if (match) noticeMonths = parseInt(match[1])
        }

        // Fall back to manual input
        if (!leaseEndStr || leaseEndStr === 'not found') {
            leaseEndStr = manualLeaseEnd
            noticeMonths = parseInt(manualNoticePeriod) || 3
        }

        if (!leaseEndStr) return null

        try {
            const leaseEnd = new Date(leaseEndStr)
            if (isNaN(leaseEnd.getTime())) return null

            const sendBy = new Date(leaseEnd)
            sendBy.setMonth(sendBy.getMonth() - noticeMonths)
            return sendBy.toISOString().split('T')[0]
        } catch {
            return null
        }
    }

    // Get display values 
    const getLeaseEndDisplay = () => {
        if (contractData?.lease_end_date?.value && contractData.lease_end_date.value !== 'not found') {
            return { value: contractData.lease_end_date.value, source: 'contract' }
        }
        if (manualLeaseEnd) {
            return { value: manualLeaseEnd, source: 'manual' }
        }
        return null
    }

    const getNoticePeriodDisplay = () => {
        if (contractData?.notice_period?.value && contractData.notice_period.value !== 'not found') {
            return { value: contractData.notice_period.value, source: 'contract' }
        }
        if (manualNoticePeriod) {
            return { value: `${manualNoticePeriod} months`, source: 'manual' }
        }
        return null
    }

    // Get rent amount from contract
    const getRentAmountDisplay = () => {
        if (contractData?.rent_amount?.value && contractData.rent_amount.value !== 'not found') {
            return contractData.rent_amount.value
        }
        return null
    }

    // Save manual inputs to case
    const saveManualInputs = async () => {
        if (!manualLeaseEnd) return

        try {
            const supabase = createClient()
            await supabase
                .from('cases')
                .update({
                    lease_end: manualLeaseEnd,
                    last_activity_at: new Date().toISOString()
                })
                .eq('case_id', caseId)

            setShowManualInput(false)
            setSuccessMessage('Lease end date saved')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            console.error(err)
        }
    }

    // Get AI Suggestions
    const getSuggestions = async () => {
        if (!hasContract) return

        setLoadingSuggestions(true)
        setSuggestionsError(null)
        setSuggestions([])

        try {
            const res = await fetch('/api/ai/suggest-reminders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId })
            })

            const data = await res.json()

            if (data.error) {
                setSuggestionsError(data.error)
            } else if (data.suggestions?.length > 0) {
                setSuggestions(data.suggestions)
            } else {
                setSuggestionsError('No suggestions generated. Try adding more contract details.')
            }
        } catch (err) {
            setSuggestionsError('Could not get suggestions. Please try again.')
        } finally {
            setLoadingSuggestions(false)
        }
    }

    // Add a suggested reminder
    const addSuggestion = (suggestion: Suggestion) => {
        setNewCustomReminder({
            label: suggestion.label,
            date: suggestion.date,
            offsets: [7],
            saved: false
        })
        setShowAddCustom(true)
        // Remove from suggestions list
        setSuggestions(prev => prev.filter(s => s.date !== suggestion.date || s.label !== suggestion.label))
    }

    // Save Handlers
    const saveTermination = async () => {
        const deadline = getSuggestedTerminationDate()
        if (!deadline) return
        setSaving('termination')
        setError(null)

        try {
            const res = await fetch('/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    type: 'termination_notice',
                    date: deadline, // Always use system-calculated deadline
                    offsets: termination.offsets,
                    rentalLabel,
                    noticeMethod: contractData?.notice_method?.value
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            setTermination(prev => ({ ...prev, saved: true }))
            setSuccessMessage('Reminder saved')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError('Could not save reminder. Please try again.')
        } finally {
            setSaving(null)
        }
    }

    const saveRent = async () => {
        setSaving('rent')
        setError(null)

        try {
            const res = await fetch('/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    type: 'rent_payment',
                    dueDay: rent.dueDay,
                    offsets: rent.offsets,
                    rentalLabel
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            setRent(prev => ({ ...prev, saved: true }))
            setSuccessMessage('Reminder saved')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError('Could not save reminder. Please try again.')
        } finally {
            setSaving(null)
        }
    }

    const saveCustomReminder = async () => {
        if (!newCustomReminder.label || !newCustomReminder.date) return
        setSaving('custom')
        setError(null)

        try {
            const res = await fetch('/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    type: 'custom',
                    date: newCustomReminder.date,
                    offsets: newCustomReminder.offsets,
                    rentalLabel,
                    label: newCustomReminder.label
                })
            })

            if (!res.ok) throw new Error('Failed to save')

            const data = await res.json()
            setCustomReminders(prev => [...prev, {
                id: data.id,
                label: newCustomReminder.label,
                date: newCustomReminder.date,
                offsets: newCustomReminder.offsets,
                saved: true
            }])
            setNewCustomReminder({ label: '', date: '', offsets: [7], saved: false })
            setShowAddCustom(false)
            setSuccessMessage('Custom reminder added')
            setTimeout(() => setSuccessMessage(null), 3000)
        } catch (err) {
            setError('Could not save reminder. Please try again.')
        } finally {
            setSaving(null)
        }
    }

    const deleteReminder = async (type: 'termination_notice' | 'rent_payment' | 'custom', id?: string) => {
        try {
            await fetch('/api/deadlines', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, type, id })
            })

            if (type === 'termination_notice') {
                setTermination(prev => ({ ...prev, enabled: false, saved: false }))
            } else if (type === 'rent_payment') {
                setRent(prev => ({ ...prev, enabled: false, saved: false }))
            } else if (type === 'custom' && id) {
                setCustomReminders(prev => prev.filter(r => r.id !== id))
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>

    const suggestedDate = getSuggestedTerminationDate()
    const leaseEnd = getLeaseEndDisplay()
    const noticePeriod = getNoticePeriodDisplay()

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold mb-1">Deadlines & reminders</h1>
                <p className="text-slate-500">Set reminders for important dates so you never miss a deadline.</p>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 animate-in fade-in duration-200">
                    <Check size={20} />
                    {successMessage}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Contract Status Banner */}
            {hasContract && (leaseEnd || noticePeriod) ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <FileText size={20} className="text-slate-600" />
                        <span className="font-medium text-slate-900">From your contract</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        {leaseEnd && (
                            <div>
                                <span className="text-slate-500">Lease ends:</span>
                                <span className="ml-2 font-medium">{leaseEnd.value}</span>
                            </div>
                        )}
                        {noticePeriod && (
                            <div>
                                <span className="text-slate-500">Notice period:</span>
                                <span className="ml-2 font-medium">{noticePeriod.value}</span>
                            </div>
                        )}
                    </div>
                    {!showManualInput && (
                        <button
                            onClick={() => setShowManualInput(true)}
                            className="mt-3 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                        >
                            <Edit3 size={14} />
                            Edit dates manually
                        </button>
                    )}
                </div>
            ) : (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <Info size={20} className="text-blue-600" />
                        <span className="font-medium text-blue-900">No contract data yet</span>
                    </div>
                    <p className="text-sm text-blue-700 mb-3">
                        <Link href={`/vault/case/${caseId}/contract`} className="underline hover:no-underline">Upload your contract</Link> to automatically extract dates, or enter them manually below.
                    </p>
                    {!showManualInput && (
                        <button
                            onClick={() => setShowManualInput(true)}
                            className="text-sm font-medium text-blue-700 hover:text-blue-800"
                        >
                            + Enter dates manually
                        </button>
                    )}
                </div>
            )}

            {/* Manual Input Section */}
            {showManualInput && (
                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-4">
                    <h3 className="font-medium text-slate-900">Enter your lease details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Lease end date</label>
                            <input
                                type="date"
                                value={manualLeaseEnd}
                                onChange={(e) => setManualLeaseEnd(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Notice period (months)</label>
                            <input
                                type="number"
                                min="1"
                                max="12"
                                value={manualNoticePeriod}
                                onChange={(e) => setManualNoticePeriod(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={saveManualInputs}
                            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800"
                        >
                            Save dates
                        </button>
                        <button
                            onClick={() => setShowManualInput(false)}
                            className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Contract Termination */}
            <div className={`bg-white rounded-xl border transition-colors ${termination.enabled ? 'border-amber-200 shadow-sm' : 'border-slate-200'}`}>
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-lg text-slate-900">Contract termination</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Don't let your contract auto-renew without deciding.
                            </p>
                        </div>
                    </div>

                    {/* Contract info display */}
                    {(leaseEnd || noticePeriod || suggestedDate) && (
                        <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {leaseEnd && (
                                    <div>
                                        <span className="text-amber-700 font-medium">Lease ends</span>
                                        <p className="text-slate-900 font-semibold mt-0.5">
                                            {new Date(leaseEnd.value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <span className="text-xs text-slate-500">from {leaseEnd.source}</span>
                                    </div>
                                )}
                                {noticePeriod && (
                                    <div>
                                        <span className="text-amber-700 font-medium">Notice period</span>
                                        <p className="text-slate-900 font-semibold mt-0.5">{noticePeriod.value}</p>
                                        <span className="text-xs text-slate-500">from {noticePeriod.source}</span>
                                    </div>
                                )}
                                {suggestedDate && (
                                    <div>
                                        <span className="text-amber-700 font-medium">⚠️ Last day to give notice</span>
                                        <p className="text-slate-900 font-semibold mt-0.5">
                                            {new Date(suggestedDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </p>
                                        <span className="text-xs text-slate-500">to avoid rollover</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer py-2">
                        <input
                            type="checkbox"
                            checked={termination.enabled}
                            onChange={(e) => {
                                if (!e.target.checked && termination.saved) {
                                    if (confirm('Turn off this reminder?')) deleteReminder('termination_notice')
                                } else {
                                    setTermination(prev => ({
                                        ...prev,
                                        enabled: e.target.checked,
                                        date: e.target.checked && !prev.date ? suggestedDate || undefined : prev.date
                                    }))
                                }
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                        />
                        <span className="font-medium text-slate-700">Remind me before this deadline</span>
                    </label>

                    {termination.enabled && (
                        <div className="mt-6 pt-6 border-t border-slate-100 pl-2 space-y-6">
                            {/* Locked deadline display */}
                            {suggestedDate && (
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <div className="text-sm text-slate-600 mb-1">Last day to give notice</div>
                                    <div className="text-xl font-semibold text-slate-900">
                                        {new Date(suggestedDate).toLocaleDateString('en-GB', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">from contract</div>
                                </div>
                            )}

                            {/* Offset selector only */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Notify me</label>
                                <select
                                    value={termination.offsets[0]}
                                    onChange={(e) => setTermination(prev => ({ ...prev, offsets: [parseInt(e.target.value)], saved: false }))}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                >
                                    <option value={60}>2 months before</option>
                                    <option value={30}>1 month before</option>
                                    <option value={14}>2 weeks before</option>
                                    <option value={7}>1 week before</option>
                                    <option value={0}>On the deadline</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-2">
                                    We'll notify you before the notice deadline shown above.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                {termination.saved ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <Check size={16} />
                                        Reminder set relative to the notice deadline
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400 italic">Unsaved changes</div>
                                )}

                                <button
                                    onClick={saveTermination}
                                    disabled={!suggestedDate || termination.saved}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {saving === 'termination' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save reminder
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Rent Payments */}
            <div className={`bg-white rounded-xl border transition-colors ${rent.enabled ? 'border-blue-200 shadow-sm' : 'border-slate-200'}`}>
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                            <CreditCard size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-lg text-slate-900">Rent payments</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Receive monthly reminders to pay your rent.
                            </p>
                        </div>
                    </div>

                    {/* Rent amount from contract */}
                    {getRentAmountDisplay() && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="text-sm">
                                <span className="text-blue-700 font-medium">Monthly rent</span>
                                <p className="text-slate-900 font-semibold text-lg mt-0.5">{getRentAmountDisplay()}</p>
                                <span className="text-xs text-slate-500">from contract</span>
                            </div>
                        </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer py-2">
                        <input
                            type="checkbox"
                            checked={rent.enabled}
                            onChange={(e) => {
                                if (!e.target.checked && rent.saved) {
                                    if (confirm('Turn off rent reminders?')) deleteReminder('rent_payment')
                                } else {
                                    setRent(prev => ({ ...prev, enabled: e.target.checked }))
                                }
                            }}
                            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="font-medium text-slate-700">Remind me to pay rent</span>
                    </label>

                    {rent.enabled && (
                        <div className="mt-6 pt-6 border-t border-slate-100 pl-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Rent due day</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="number"
                                            min="1"
                                            max="31"
                                            value={rent.dueDay}
                                            onChange={(e) => setRent(prev => ({ ...prev, dueDay: e.target.value, saved: false }))}
                                            className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-center"
                                        />
                                        <span className="text-slate-500 text-sm">of the month</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">When to notify</label>
                                    <select
                                        value={rent.offsets[0]}
                                        onChange={(e) => setRent(prev => ({ ...prev, offsets: [parseInt(e.target.value)], saved: false }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value={7}>1 week before</option>
                                        <option value={3}>3 days before</option>
                                        <option value={1}>1 day before</option>
                                        <option value={0}>On the day</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                {rent.saved ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <Check size={16} />
                                        Reminder active
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400 italic">Unsaved changes</div>
                                )}

                                <button
                                    onClick={saveRent}
                                    disabled={!rent.dueDay || rent.saved}
                                    className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                >
                                    {saving === 'rent' ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                    Save reminder
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Custom Reminders */}
            <div className="bg-white rounded-xl border border-slate-200">
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-slate-100 text-slate-600 rounded-lg flex items-center justify-center shrink-0">
                            <Bell size={20} />
                        </div>
                        <div className="flex-1">
                            <h2 className="font-semibold text-lg text-slate-900">Custom reminders</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                Add reminders for any date: inspections, renewals, deposit follow-ups.
                            </p>
                        </div>
                    </div>

                    {/* Existing custom reminders */}
                    {customReminders.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {customReminders.map((reminder) => (
                                <div key={reminder.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <span className="font-medium text-slate-900">{reminder.label}</span>
                                        <span className="text-slate-500 text-sm ml-2">
                                            {new Date(reminder.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => deleteReminder('custom', reminder.id)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add new custom reminder */}
                    {showAddCustom ? (
                        <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                            <input
                                type="text"
                                placeholder="Reminder label (e.g., Landlord inspection)"
                                value={newCustomReminder.label}
                                onChange={(e) => setNewCustomReminder(prev => ({ ...prev, label: e.target.value }))}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="date"
                                    value={newCustomReminder.date}
                                    onChange={(e) => setNewCustomReminder(prev => ({ ...prev, date: e.target.value }))}
                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
                                />
                                <select
                                    value={newCustomReminder.offsets[0]}
                                    onChange={(e) => setNewCustomReminder(prev => ({ ...prev, offsets: [parseInt(e.target.value)] }))}
                                    className="px-3 py-2 border border-slate-200 rounded-lg bg-white"
                                >
                                    <option value={14}>2 weeks before</option>
                                    <option value={7}>1 week before</option>
                                    <option value={3}>3 days before</option>
                                    <option value={1}>1 day before</option>
                                    <option value={0}>On the day</option>
                                </select>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={saveCustomReminder}
                                    disabled={!newCustomReminder.label || !newCustomReminder.date}
                                    className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 flex items-center gap-2"
                                >
                                    {saving === 'custom' ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                    Save reminder
                                </button>
                                <button
                                    onClick={() => setShowAddCustom(false)}
                                    className="px-4 py-2 text-slate-600 hover:text-slate-900 text-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* AI Suggestions */}
                            {hasContract && (
                                <div className="space-y-3">
                                    {suggestions.length === 0 && !loadingSuggestions && !suggestionsError && (
                                        <button
                                            onClick={getSuggestions}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 rounded-lg font-medium hover:from-purple-100 hover:to-blue-100 border border-purple-200 transition-colors"
                                        >
                                            <Sparkles size={16} />
                                            Suggest reminders from contract
                                        </button>
                                    )}

                                    {loadingSuggestions && (
                                        <div className="flex items-center gap-2 text-slate-500 p-3 bg-slate-50 rounded-lg">
                                            <Loader2 className="animate-spin" size={16} />
                                            Analyzing your contract...
                                        </div>
                                    )}

                                    {suggestionsError && (
                                        <div className="text-sm text-amber-600 p-3 bg-amber-50 rounded-lg">
                                            {suggestionsError}
                                        </div>
                                    )}

                                    {suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <div className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                                <Sparkles size={14} className="text-purple-500" />
                                                Suggested reminders
                                            </div>
                                            {suggestions.map((suggestion, i) => (
                                                <div key={i} className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-100">
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <div className="font-medium text-slate-900">{suggestion.label}</div>
                                                            <div className="text-sm text-slate-500 mt-1">
                                                                {new Date(suggestion.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                            </div>
                                                            <div className="text-xs text-slate-400 mt-1 italic">{suggestion.reason}</div>
                                                        </div>
                                                        <button
                                                            onClick={() => addSuggestion(suggestion)}
                                                            className="px-3 py-1 bg-white text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 border border-purple-200 shrink-0"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={() => setShowAddCustom(true)}
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-medium"
                            >
                                <Plus size={18} />
                                Add custom reminder
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
