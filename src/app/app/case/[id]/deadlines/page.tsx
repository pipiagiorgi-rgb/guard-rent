'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Info, Calendar, CreditCard, Loader2, AlertCircle, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

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

export default function DeadlinesPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState<'termination' | 'rent' | null>(null)
    const [rentalLabel, setRentalLabel] = useState('')
    const [contractData, setContractData] = useState<ContractData | null>(null)
    const [error, setError] = useState<string | null>(null)

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
                    if (caseData.contract_analysis?.analysis) {
                        const analysis = caseData.contract_analysis.analysis
                        setContractData(analysis)

                        // Pre-calculate termination date if possible
                        if (analysis.lease_end_date?.value && analysis.lease_end_date.value !== 'not found') {
                            // Logic to pre-fill date could go here, but we let user confirm
                        }

                        // Pre-fill rent day
                        if (analysis.payment_due_date?.value) {
                            const match = analysis.payment_due_date.value.match(/\d+/)
                            if (match) setRent(prev => ({ ...prev, dueDay: match[0] }))
                        }
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
                }

            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [params])

    // Calculate suggested termination date
    const getSuggestedTerminationDate = () => {
        if (!contractData?.lease_end_date?.value) return null

        try {
            const leaseEnd = new Date(contractData.lease_end_date.value)
            if (isNaN(leaseEnd.getTime())) return null

            // Default 3 months notice
            let noticeMonths = 3
            if (contractData.notice_period?.value) {
                const match = contractData.notice_period.value.match(/(\d+)/)
                if (match) noticeMonths = parseInt(match[1])
            }

            const sendBy = new Date(leaseEnd)
            sendBy.setMonth(sendBy.getMonth() - noticeMonths)
            return sendBy.toISOString().split('T')[0]
        } catch {
            return null
        }
    }

    // Save Handlers
    const saveTermination = async () => {
        if (!termination.date) return
        setSaving('termination')
        setError(null)

        try {
            const res = await fetch('/api/deadlines', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    type: 'termination_notice',
                    date: termination.date,
                    offsets: termination.offsets,
                    rentalLabel,
                    noticeMethod: contractData?.notice_method?.value
                })
            })

            if (!res.ok) throw new Error('Failed to save')
            setTermination(prev => ({ ...prev, saved: true }))
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
        } catch (err) {
            setError('Could not save reminder. Please try again.')
        } finally {
            setSaving(null)
        }
    }

    const deleteReminder = async (type: 'termination_notice' | 'rent_payment') => {
        try {
            await fetch('/api/deadlines', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, type })
            })

            if (type === 'termination_notice') {
                setTermination(prev => ({ ...prev, enabled: false, saved: false }))
            } else {
                setRent(prev => ({ ...prev, enabled: false, saved: false }))
            }
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" /></div>

    const suggestedDate = getSuggestedTerminationDate()

    return (
        <div className="space-y-8 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold mb-1">Deadlines & reminders</h1>
                <p className="text-slate-500">Enable reminders for key dates in your tenancy.</p>
            </div>

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {/* Contract Termination */}
            <div className={`bg-white rounded-xl border transition-colors ${termination.enabled ? 'border-amber-200 shadow-sm' : 'border-slate-200'}`}>
                <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h2 className="font-semibold text-lg text-slate-900">Contract termination</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                {contractData?.notice_period?.value
                                    ? `Your contract mentions a ${contractData.notice_period.value} notice period.`
                                    : 'Set a reminder to cancel your contract on time.'}
                            </p>
                        </div>
                    </div>

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
                        <span className="font-medium text-slate-700">Remind me if I need to cancel this contract</span>
                    </label>

                    {termination.enabled && (
                        <div className="mt-6 pt-6 border-t border-slate-100 pl-2 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Reminder Date</label>
                                    <input
                                        type="date"
                                        value={termination.date || ''}
                                        onChange={(e) => setTermination(prev => ({ ...prev, date: e.target.value, saved: false }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                    {suggestedDate && !termination.saved && (
                                        <p className="text-xs text-slate-500 mt-1.5">
                                            Suggested based on contract: {new Date(suggestedDate).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">When to notify</label>
                                    <select
                                        value={termination.offsets[0]}
                                        onChange={(e) => setTermination(prev => ({ ...prev, offsets: [parseInt(e.target.value)], saved: false }))}
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                                    >
                                        <option value={60}>2 months before</option>
                                        <option value={30}>1 month before</option>
                                        <option value={14}>2 weeks before</option>
                                        <option value={7}>1 week before</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                {termination.saved ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <Check size={16} />
                                        Reminder active
                                    </div>
                                ) : (
                                    <div className="text-sm text-slate-400 italic">Unsaved changes</div>
                                )}

                                <button
                                    onClick={saveTermination}
                                    disabled={!termination.date || termination.saved}
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
                        <div>
                            <h2 className="font-semibold text-lg text-slate-900">Rent payments</h2>
                            <p className="text-slate-500 text-sm mt-1">
                                {contractData?.rent_amount?.value
                                    ? `Rent of ${contractData.rent_amount.value} is due monthly.`
                                    : 'Recieve monthly reminders to pay your rent.'}
                            </p>
                        </div>
                    </div>

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

            <p className="text-center text-xs text-slate-400 pt-8">
                RentVault securely stores and organises your rental documents. Not legal advice.
            </p>
        </div>
    )
}
