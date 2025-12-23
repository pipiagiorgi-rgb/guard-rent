'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle, CheckCircle2, Info, Check, Upload, FileText, AlertCircle, Globe, Languages, Copy, ChevronDown, ChevronUp, Download, MessageCircle, Send, HelpCircle, Lock, MapPin } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
    getQuestionsRemaining,
    getTranslationsRemaining,
    canAskPreviewQuestion,
    canTranslatePreview,
    recordPreviewQuestion,
    recordPreviewTranslation,
    PREVIEW_QUESTION_LIMIT,
    PREVIEW_TRANSLATION_LIMIT
} from '@/lib/preview-limits'

interface ExtractedField {
    value: string
    confidence: 'high' | 'medium' | 'low'
    source_excerpt: string
}

interface ContractAnalysis {
    property_address?: ExtractedField
    lease_start_date: ExtractedField
    lease_end_date: ExtractedField
    earliest_termination_date: ExtractedField
    notice_period: ExtractedField
    notice_condition?: ExtractedField
    notice_method?: ExtractedField
    jurisdiction_or_country?: ExtractedField
    document_language: ExtractedField
    rent_amount?: ExtractedField
    payment_frequency?: ExtractedField
    payment_due_date?: ExtractedField
}

const PRESET_LANGUAGES = [
    'English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese',
    'Dutch', 'Russian', 'Arabic', 'Ukrainian', 'Chinese (Simplified)', 'Turkish'
]

interface ContractScanClientProps {
    caseId: string
    hasPurchasedPack?: boolean
}

export default function ContractScanClient({ caseId, hasPurchasedPack = false }: ContractScanClientProps) {
    const router = useRouter()

    // === STATE MANAGEMENT ===
    // Transient scan state (in-memory, not yet applied)
    const [file, setFile] = useState<File | null>(null)
    const [scanResult, setScanResult] = useState<ContractAnalysis | null>(null)
    const [extractedText, setExtractedText] = useState<string>('')

    // Saved contract state (from database - source of truth)
    const [savedContract, setSavedContract] = useState<{
        analysis: ContractAnalysis
        fileName: string
        appliedAt: string
        extractedText: string
    } | null>(null)

    // UI state
    const [loading, setLoading] = useState(true)
    const [analyzing, setAnalyzing] = useState(false)
    const [applying, setApplying] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Translation state
    const [translatedText, setTranslatedText] = useState<string>('')
    const [translating, setTranslating] = useState(false)
    const [showTranslationBanner, setShowTranslationBanner] = useState(true)
    const [targetLanguage, setTargetLanguage] = useState('English')
    const [customLanguage, setCustomLanguage] = useState('')
    const [showTranslation, setShowTranslation] = useState(false)
    const [translationError, setTranslationError] = useState<string | null>(null)
    const [copiedTranslation, setCopiedTranslation] = useState(false)

    // Manual Edit state
    const [isEditing, setIsEditing] = useState(false)
    const [editableAnalysis, setEditableAnalysis] = useState<ContractAnalysis | null>(null)

    // Contract Q&A state
    const [qaQuestion, setQaQuestion] = useState('')
    const [qaAnswer, setQaAnswer] = useState('')
    const [qaLoading, setQaLoading] = useState(false)
    const [qaError, setQaError] = useState<string | null>(null)
    const [extractingAddress, setExtractingAddress] = useState(false)

    // Preview limits state
    const [questionsRemaining, setQuestionsRemaining] = useState(PREVIEW_QUESTION_LIMIT)
    const [translationsRemaining, setTranslationsRemaining] = useState(PREVIEW_TRANSLATION_LIMIT)

    // Toast notification state
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    // Computed result from either saved, editable, or scanned
    const result = editableAnalysis || savedContract?.analysis || scanResult
    const fileName = savedContract?.fileName || file?.name || 'Contract'

    // Load saved or transient contract from database on mount
    useEffect(() => {
        async function loadContract() {
            console.log('Loading contract for case:', caseId)
            try {
                const res = await fetch(`/api/contracts/${caseId}`)
                if (res.ok) {
                    const data = await res.json()
                    console.log('Contract API response:', {
                        hasAnalysis: !!data.contract?.analysis,
                        savedAddress: data.savedAddress,
                        propertyAddressInAnalysis: data.contract?.analysis?.property_address
                    })

                    if (data.contract?.analysis) {
                        // Merge savedAddress into analysis if it exists
                        const analysis = { ...data.contract.analysis }
                        if (data.savedAddress && (!analysis.property_address?.value || analysis.property_address?.value === 'not found' || analysis.property_address?.value === '...')) {
                            analysis.property_address = { value: data.savedAddress, confidence: 'high', source_excerpt: 'Extracted from contract' }
                            console.log('Merged savedAddress into analysis:', data.savedAddress)
                        }

                        if (data.contractApplied) {
                            setSavedContract({
                                analysis: analysis,
                                fileName: data.contract.fileName || 'Contract',
                                appliedAt: data.contract.analyzedAt || '',
                                extractedText: data.contract.extractedText || ''
                            })
                            console.log('Saved (applied) contract loaded')
                        } else {
                            setScanResult(analysis)
                            console.log('Transient (not applied) scan loaded')
                        }
                        setExtractedText(data.contract.extractedText || '')
                    }
                }
            } catch (err) {
                console.error('Failed to load contract:', err)
            } finally {
                setLoading(false)
            }
        }
        loadContract()
    }, [caseId])

    // Load preview limits from localStorage
    useEffect(() => {
        if (!hasPurchasedPack) {
            setQuestionsRemaining(getQuestionsRemaining(caseId))
            setTranslationsRemaining(getTranslationsRemaining(caseId))
        }
    }, [caseId, hasPurchasedPack])

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        setFile(selectedFile)
        setError(null)
        setScanResult(null)
        setSavedContract(null)
    }, [])

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        const droppedFile = e.dataTransfer.files[0]
        if (droppedFile) handleFileSelect(droppedFile)
    }, [handleFileSelect])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
    }, [])

    const handleScan = async () => {
        if (!file) return

        setAnalyzing(true)
        setError(null)
        setScanResult(null)

        try {
            const arrayBuffer = await file.arrayBuffer()
            const bytes = new Uint8Array(arrayBuffer)
            let binary = ''
            for (let i = 0; i < bytes.byteLength; i++) {
                binary += String.fromCharCode(bytes[i])
            }
            const fileBase64 = btoa(binary)

            const res = await fetch('/api/ai/contract-scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    fileBase64,
                    fileName: file.name,
                    fileType: file.type
                })
            })

            const data = await res.json()

            if (!res.ok) throw new Error(data.error || 'Analysis failed')

            setScanResult(data.analysis)
            setExtractedText(data.extractedText || '')
            setShowTranslationBanner(true)
        } catch (err: any) {
            console.error('Scan error:', err)
            setError(err.message || 'Contract analysis is temporarily unavailable.')
        } finally {
            setAnalyzing(false)
        }
    }

    const handleApplyToRental = async () => {
        const analysisToSave = result
        if (!analysisToSave) return

        // 7️⃣ REQUIRED CASE ID CHECK
        console.log("Current caseId", caseId);

        setApplying(true)
        setError(null)

        try {
            const supabase = createClient()

            // Parse dates for database DATE columns (format: YYYY-MM-DD)
            const parseDate = (dateStr: string | undefined): string | null => {
                if (!dateStr || dateStr === 'not found' || dateStr.trim() === '') return null

                console.log("Parsing date:", dateStr)

                // Handle DD/MM/YYYY specifically (common in EU)
                const euMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
                if (euMatch) {
                    const [, day, month, year] = euMatch
                    const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                    console.log("Parsed EU date:", result)
                    return result
                }

                // Handle DD.MM.YYYY (German format)
                const deMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
                if (deMatch) {
                    const [, day, month, year] = deMatch
                    const result = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                    console.log("Parsed DE date:", result)
                    return result
                }

                // Handle YYYY-MM-DD (ISO format)
                const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
                if (isoMatch) {
                    console.log("Already ISO date:", dateStr)
                    return dateStr
                }

                // Try to parse various date formats and convert to YYYY-MM-DD
                const parsed = new Date(dateStr)
                if (isNaN(parsed.getTime())) {
                    console.log("Failed to parse date:", dateStr)
                    return null
                }
                const result = parsed.toISOString().split('T')[0]
                console.log("Parsed generic date:", result)
                return result
            }

            // Parse the dates
            const leaseStart = parseDate(analysisToSave.lease_start_date?.value)
            const leaseEnd = parseDate(analysisToSave.lease_end_date?.value)

            // Parse address (handle 'not found' case-insensitively)
            const address = analysisToSave.property_address?.value &&
                analysisToSave.property_address.value.toLowerCase() !== 'not found' &&
                analysisToSave.property_address.value !== '...'
                ? analysisToSave.property_address.value
                : null

            // Parse country
            const country = analysisToSave.jurisdiction_or_country?.value &&
                analysisToSave.jurisdiction_or_country.value !== 'not found'
                ? analysisToSave.jurisdiction_or_country.value
                : null

            console.log("Saving details:", { leaseStart, leaseEnd, address, country })

            // Store everything in contract_analysis JSONB (only use existing columns)
            const updatePayload: any = {
                contract_analysis: {
                    analysis: analysisToSave,
                    fileName: fileName,
                    extractedText: extractedText,
                    analyzedAt: new Date().toISOString(),
                    applied: true,  // Track applied status inside JSON
                    appliedAt: new Date().toISOString()
                },
                lease_start: leaseStart,
                lease_end: leaseEnd,
                last_activity_at: new Date().toISOString()
            }

            if (address) updatePayload.address = address
            if (country) updatePayload.country = country

            const { data, error } = await supabase
                .from("cases")
                .update(updatePayload)
                .eq("case_id", caseId)
                .select()
                .single();

            console.log("SAVE RESULT", { caseId, data, error });

            if (error) throw error;
            if (!data) throw new Error("No case updated — check case_id or RLS");

            // Clear transient scan state
            setScanResult(null)
            setFile(null)
            setEditableAnalysis(null)
            setIsEditing(false)

            // Rehydrate UI from database result
            if (data.contract_analysis) {
                setSavedContract({
                    analysis: data.contract_analysis.analysis,
                    fileName: data.contract_analysis.fileName || 'Contract',
                    appliedAt: data.contract_analysis.appliedAt || new Date().toISOString(),
                    extractedText: data.contract_analysis.extractedText || ''
                })
            }

            // Success!
        } catch (err: any) {
            console.error('Apply error:', err)
            setError(err.message || 'Failed to save details. Please try again.')
        } finally {
            setApplying(false)
        }
    }

    const handleReplaceContract = async () => {
        if (!window.confirm('Replacing the contract will remove the current contract details. Continue?')) return

        try {
            const supabase = createClient()
            const { error } = await supabase
                .from('cases')
                .update({
                    contract_analysis: null,
                    lease_start: null,
                    lease_end: null,
                    last_activity_at: new Date().toISOString()
                })
                .eq('case_id', caseId)

            if (error) throw error

            setSavedContract(null)
            setScanResult(null)
            setFile(null)
            setExtractedText('')
            setTranslatedText('')
            setShowTranslation(false)
        } catch (err) {
            console.error('Failed to reset contract:', err)
        }
    }

    const handleReviewManually = () => {
        if (result) {
            setEditableAnalysis(JSON.parse(JSON.stringify(result)))
            setIsEditing(true)
        }
    }

    // Sync dates from existing contract_analysis to case table (for contracts applied before fix)
    const handleSyncDates = async () => {
        if (!savedContract?.analysis) return

        setApplying(true)
        setError(null)

        try {
            const supabase = createClient()
            const analysis = savedContract.analysis

            // Parse dates
            const parseDate = (dateStr: string | undefined): string | null => {
                if (!dateStr || dateStr === 'not found' || dateStr.trim() === '') return null

                const euMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
                if (euMatch) {
                    const [, day, month, year] = euMatch
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                }

                const deMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
                if (deMatch) {
                    const [, day, month, year] = deMatch
                    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
                }

                const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/)
                if (isoMatch) return dateStr

                const parsed = new Date(dateStr)
                if (isNaN(parsed.getTime())) return null
                return parsed.toISOString().split('T')[0]
            }

            const leaseStart = parseDate(analysis.lease_start_date?.value)
            const leaseEnd = parseDate(analysis.lease_end_date?.value)

            console.log("Syncing dates:", { leaseStart, leaseEnd })

            const { error } = await supabase
                .from('cases')
                .update({
                    lease_start: leaseStart,
                    lease_end: leaseEnd,
                    last_activity_at: new Date().toISOString()
                })
                .eq('case_id', caseId)

            if (error) throw error

            // Show success toast (non-blocking)
            setError(null)
            setToastMessage('Your rental dates have been saved.')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 2000)
        } catch (err: any) {
            setError(err.message || 'Failed to sync dates')
        } finally {
            setApplying(false)
        }
    }

    const handleTranslate = async () => {
        if (!extractedText) return

        // Check preview limits if not purchased
        if (!hasPurchasedPack && !canTranslatePreview(caseId)) {
            setTranslationError('Preview limit reached.')
            return
        }

        const langToUse = customLanguage.trim() || targetLanguage
        setTranslating(true)
        setTranslationError(null)

        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 60000)

            const res = await fetch('/api/ai/translate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractText: extractedText.substring(0, 14000),
                    targetLanguage: langToUse,
                    sourceLanguage: result?.document_language?.value
                }),
                signal: controller.signal
            })
            clearTimeout(timeoutId)

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Translation failed')

            setTranslatedText(data.translatedText)
            setShowTranslation(true)

            // Record usage if in preview mode
            if (!hasPurchasedPack) {
                recordPreviewTranslation(caseId)
                setTranslationsRemaining(getTranslationsRemaining(caseId))
            }
        } catch (err: any) {
            setTranslationError(err.message || 'Translation failed.')
        } finally {
            setTranslating(false)
        }
    }

    const handleAskQuestion = async () => {
        if (!qaQuestion.trim() || qaLoading) return

        // Check preview limits if not purchased
        if (!hasPurchasedPack && !canAskPreviewQuestion(caseId)) {
            setQaError("You've reached the preview limit for this rental.")
            return
        }

        setQaLoading(true)
        setQaError(null)
        setQaAnswer('')

        try {
            const res = await fetch('/api/ai/contract-qa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    question: qaQuestion.trim()
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to get answer')

            setQaAnswer(data.answer)
            setQaQuestion('') // Clear input after successful answer

            // Record usage if in preview mode
            if (!hasPurchasedPack) {
                recordPreviewQuestion(caseId)
                setQuestionsRemaining(getQuestionsRemaining(caseId))
            }
        } catch (err: any) {
            setQaError(err.message || 'Something went wrong.')
        } finally {
            setQaLoading(false)
        }
    }

    // Extract address using targeted Q&A
    const handleExtractAddress = async () => {
        if (extractingAddress) return

        setExtractingAddress(true)
        setError(null)

        try {
            // Use Q&A API with targeted address question
            const res = await fetch('/api/ai/contract-qa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    question: 'What is the full property address that is being rented? Include street number, street name, postal code, and city. Only give me the address, nothing else.'
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to extract address')

            let extractedAddress = data.answer?.trim() || ''

            // Clean up AI response - extract just the address
            // Remove "Source:" suffix and everything after it
            if (extractedAddress.includes('Source:')) {
                extractedAddress = extractedAddress.split('Source:')[0].trim()
            }
            // Remove "ℹ️ Not legal advice" suffix
            extractedAddress = extractedAddress.replace(/ℹ️.*$/i, '').trim()
            // Remove any trailing quotes or punctuation
            extractedAddress = extractedAddress.replace(/["'.]$/, '').trim()

            // Check if we got a valid address (not empty, not "not found", etc.)
            if (!extractedAddress ||
                extractedAddress.toLowerCase().includes('not found') ||
                extractedAddress.toLowerCase().includes('unable to') ||
                extractedAddress.toLowerCase().includes('cannot find') ||
                extractedAddress.length < 10) {
                throw new Error('Could not find property address in the contract')
            }

            // Save to database directly
            const saveRes = await fetch(`/api/contracts/${caseId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: extractedAddress })
            })

            if (!saveRes.ok) {
                const saveData = await saveRes.json()
                throw new Error(saveData.error || 'Failed to save address')
            }

            // Update local state - handle all three possible state sources
            if (editableAnalysis) {
                const newAnalysis = JSON.parse(JSON.stringify(editableAnalysis)) as ContractAnalysis
                newAnalysis.property_address = { value: extractedAddress, confidence: 'high', source_excerpt: 'AI extracted' }
                setEditableAnalysis(newAnalysis)
            } else if (savedContract) {
                // Update savedContract when contract is already applied
                const newAnalysis = JSON.parse(JSON.stringify(savedContract.analysis)) as ContractAnalysis
                newAnalysis.property_address = { value: extractedAddress, confidence: 'high', source_excerpt: 'AI extracted' }
                setSavedContract({
                    ...savedContract,
                    analysis: newAnalysis
                })
            } else if (scanResult) {
                const newResult = JSON.parse(JSON.stringify(scanResult)) as ContractAnalysis
                newResult.property_address = { value: extractedAddress, confidence: 'high', source_excerpt: 'AI extracted' }
                setScanResult(newResult)
            }

            // Show success toast
            setToastMessage(`Address extracted: ${extractedAddress}`)
            setShowToast(true)
            setTimeout(() => setShowToast(false), 4000)

        } catch (err: any) {
            setError(err.message || 'Failed to extract address')
        } finally {
            setExtractingAddress(false)
        }
    }

    const updateField = (key: keyof ContractAnalysis, value: string) => {
        if (!editableAnalysis) return
        const newAnalysis = JSON.parse(JSON.stringify(editableAnalysis)) as ContractAnalysis
        if (newAnalysis[key]) {
            (newAnalysis[key] as any).value = value
        } else {
            (newAnalysis[key] as any) = { value, confidence: 'high', source_excerpt: '' }
        }
        setEditableAnalysis(newAnalysis)
    }

    const getConfidenceBadge = (confidence: string) => {
        const colors = { high: 'bg-green-100 text-green-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-slate-100 text-slate-600' }
        return colors[confidence as keyof typeof colors] || colors.low
    }

    const renderField = (label: string, fieldKey: keyof ContractAnalysis) => {
        const field = result ? (result[fieldKey] as ExtractedField) : undefined

        if (isEditing) {
            return (
                <div className="bg-white p-5 rounded-xl border border-blue-200 ring-2 ring-blue-50">
                    <label className="block text-sm font-medium text-slate-500 mb-2">{label}</label>
                    <input
                        type="text"
                        value={field?.value === 'not found' ? '' : field?.value || ''}
                        onChange={(e) => updateField(fieldKey, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            )
        }

        if (!field || !field.value || field.value.toLowerCase() === 'not found' || field.value === '...') {
            // Use appropriate fallback text based on field type
            const fallbackText = fieldKey === 'property_address'
                ? 'Address not stated in lease'
                : 'Not extracted from lease'

            return (
                <div className="bg-white p-5 rounded-xl border border-slate-200 text-slate-400 italic">
                    <p className="text-sm text-slate-500 mb-1">{label}</p>
                    {fallbackText}
                </div>
            )
        }

        // Special handling for "anniversary only" label
        const displayLabel = fieldKey === 'notice_condition' && field?.value?.toLowerCase().includes('anniversary')
            ? 'Fixed annual date'
            : field?.value

        // Special tooltip for fixed annual date
        const showTooltip = fieldKey === 'notice_condition' && field?.value?.toLowerCase().includes('anniversary')

        return (
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <div className="flex items-center gap-1.5 mb-1">
                    <p className="text-sm text-slate-500">{label}</p>
                    {showTooltip && (
                        <div className="group relative">
                            <HelpCircle size={14} className="text-slate-400 cursor-help" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                Termination is only possible on this date each year.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                            </div>
                        </div>
                    )}
                </div>
                <p className="text-lg font-semibold mb-2">{displayLabel || field.value}</p>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getConfidenceBadge(field.confidence)}`}>
                    {field.confidence} confidence
                </span>
            </div>
        )
    }

    // Toast component (renders independently of state)
    const Toast = showToast ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl shadow-lg">
                <CheckCircle2 size={18} className="text-green-600" />
                <span className="text-sm text-green-800 font-medium">{toastMessage}</span>
            </div>
        </div>
    ) : null

    if (loading) return <div className="flex justify-center py-12"><Loader2 className="animate-spin text-slate-400" size={32} /></div>

    // 5️⃣ CONTRACT PAGE RENDER LOGIC (CRITICAL HIERARCHY)

    // CASE A: Contract already saved to database
    if (savedContract) {
        return (
            <>
                {Toast}
                <div className="space-y-6">
                    {/* Header - changes based on editing state */}
                    {isEditing ? (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-4">
                            <Info className="text-blue-600" size={24} />
                            <div>
                                <h3 className="font-semibold text-blue-900">Editing contract details</h3>
                                <p className="text-sm text-blue-700">Make your changes and click Save to update.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4">
                            <CheckCircle className="text-green-600" size={24} />
                            <div>
                                <h3 className="font-semibold text-green-900">Contract details applied</h3>
                                <p className="text-sm text-green-700">These details are saved and used for deadlines and exports.</p>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <div className="relative">
                                {renderField('Property address', 'property_address')}
                                {/* Extract Address button - show if address not found */}
                                {(!result?.property_address?.value ||
                                    result?.property_address?.value.toLowerCase() === 'not found' ||
                                    result?.property_address?.value === '...') && savedContract?.extractedText && (
                                        <button
                                            onClick={handleExtractAddress}
                                            disabled={extractingAddress}
                                            className="absolute top-2 right-2 px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            {extractingAddress ? (
                                                <>
                                                    <Loader2 size={12} className="animate-spin" />
                                                    Extracting...
                                                </>
                                            ) : (
                                                <>
                                                    <MapPin size={12} />
                                                    Extract Address
                                                </>
                                            )}
                                        </button>
                                    )}
                            </div>
                        </div>
                        {renderField('Lease start', 'lease_start_date')}
                        {renderField('Initial lease end', 'lease_end_date')}
                        {renderField('Earliest termination possible', 'earliest_termination_date')}
                        {renderField('Notice period', 'notice_period')}
                        {renderField('Notice condition', 'notice_condition')}
                        {renderField('Notice method', 'notice_method')}
                        {renderField('Rent amount', 'rent_amount')}
                        {renderField('Country / Jurisdiction', 'jurisdiction_or_country')}
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-3">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Buttons - change based on editing state */}
                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleApplyToRental}
                                    disabled={applying}
                                    className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                                >
                                    {applying ? 'Saving...' : 'Save changes'}
                                </button>
                                <button
                                    onClick={() => { setEditableAnalysis(null); setIsEditing(false); setError(null); }}
                                    className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                                >
                                    Cancel
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => { setEditableAnalysis(JSON.parse(JSON.stringify(savedContract.analysis))); setIsEditing(true); }}
                                    className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                                >
                                    Edit details manually
                                </button>
                                <button
                                    onClick={handleSyncDates}
                                    disabled={applying}
                                    className="px-6 py-2.5 border border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-colors disabled:opacity-50"
                                >
                                    {applying ? 'Syncing...' : 'Sync dates to overview'}
                                </button>
                                <button
                                    onClick={handleReplaceContract}
                                    className="px-6 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors"
                                >
                                    Replace contract
                                </button>
                            </>
                        )}
                    </div>

                    {/* Ask about this contract - Q&A Section */}
                    {!isEditing && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={20} className="text-slate-600" />
                                    <h3 className="font-semibold text-slate-900">Ask about this contract</h3>
                                </div>
                                {/* Preview counter */}
                                {!hasPurchasedPack && questionsRemaining > 0 && (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {questionsRemaining} free {questionsRemaining === 1 ? 'question' : 'questions'} available
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-500 mb-4">
                                Ask factual questions about your contract. Find information, summarize clauses, or draft notices.
                            </p>

                            {/* Limit reached state */}
                            {!hasPurchasedPack && questionsRemaining === 0 ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                                    <Lock size={24} className="text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-700 font-medium mb-1">You've reached the preview limit for this rental.</p>
                                    <p className="text-sm text-slate-500 mb-4">Unlock a pack to continue and save answers.</p>
                                    <Link
                                        href="/pricing"
                                        className="inline-block px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        See pricing
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Example questions */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {[
                                            "What is the IBAN for rent payments?",
                                            "When is rent due each month?",
                                            "Draft a notice email to terminate",
                                        ].map((example) => (
                                            <button
                                                key={example}
                                                onClick={() => setQaQuestion(example)}
                                                className="text-xs px-3 py-1.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                                            >
                                                {example}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Input */}
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={qaQuestion}
                                            onChange={(e) => setQaQuestion(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
                                            placeholder="e.g. Draft a notice"
                                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            maxLength={500}
                                            disabled={qaLoading}
                                        />
                                        <button
                                            onClick={handleAskQuestion}
                                            disabled={qaLoading || !qaQuestion.trim()}
                                            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {qaLoading ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Send size={18} />
                                            )}
                                        </button>
                                    </div>

                                    {/* Error */}
                                    {qaError && (
                                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                            {qaError}
                                        </div>
                                    )}

                                    {/* Answer */}
                                    {qaAnswer && (
                                        <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                                            <p className="text-slate-800 text-sm whitespace-pre-wrap">{qaAnswer}</p>
                                            {!hasPurchasedPack && (
                                                <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                                                    <Info size={12} />
                                                    Preview answer. Unlock a pack to save answers across sessions.
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    {/* Contract Translation Section - always available after contract is applied */}
                    {!isEditing && (
                        <div className="mt-8 pt-6 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <Languages size={20} className="text-slate-600" />
                                    <h3 className="font-semibold text-slate-900">Contract translation</h3>
                                </div>
                                {/* Preview counter */}
                                {!hasPurchasedPack && translationsRemaining > 0 && (
                                    <span className="text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                                        {translationsRemaining} preview {translationsRemaining === 1 ? 'translation' : 'translations'} left
                                    </span>
                                )}
                            </div>

                            <p className="text-sm text-slate-500 mb-4">
                                Translate your contract to another language for convenience. Original contract remains the reference.
                            </p>

                            {/* Limit reached state */}
                            {!hasPurchasedPack && translationsRemaining === 0 ? (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center">
                                    <Lock size={24} className="text-slate-400 mx-auto mb-3" />
                                    <p className="text-slate-700 font-medium mb-1">Preview limit reached.</p>
                                    <p className="text-sm text-slate-500 mb-4">Unlock a pack to save and access translations anytime.</p>
                                    <Link
                                        href="/pricing"
                                        className="inline-block px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                                    >
                                        See pricing
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Language selector */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {PRESET_LANGUAGES.map((lang) => (
                                            <button
                                                key={lang}
                                                onClick={() => { setTargetLanguage(lang); setCustomLanguage(''); }}
                                                className={`text-xs px-3 py-1.5 rounded-full transition-colors ${targetLanguage === lang && !customLanguage
                                                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                    }`}
                                            >
                                                {lang}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Custom language input */}
                                    <div className="flex gap-2 mb-4">
                                        <input
                                            type="text"
                                            value={customLanguage}
                                            onChange={(e) => setCustomLanguage(e.target.value)}
                                            placeholder="Or type any language..."
                                            className="flex-1 px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                                        />
                                        <button
                                            onClick={handleTranslate}
                                            disabled={translating || (!targetLanguage && !customLanguage.trim())}
                                            className="px-4 py-2 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {translating ? (
                                                <Loader2 size={18} className="animate-spin" />
                                            ) : (
                                                <Globe size={18} />
                                            )}
                                            {translating ? 'Translating...' : 'Translate'}
                                        </button>
                                    </div>

                                    {/* Translation error */}
                                    {translationError && (
                                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
                                            {translationError}
                                        </div>
                                    )}

                                    {/* Translated text */}
                                    {translatedText && showTranslation && (
                                        <div className={`p-4 rounded-xl ${hasPurchasedPack ? 'bg-blue-50 border border-blue-200' : 'bg-amber-50 border border-amber-200'}`}>
                                            {/* Preview warning banner */}
                                            {!hasPurchasedPack && (
                                                <div className="flex items-start gap-2 mb-3 pb-3 border-b border-amber-200">
                                                    <Info size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-medium text-amber-800">Preview translation</p>
                                                        <p className="text-xs text-amber-700">This translation is not saved unless you unlock a pack.</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mb-2">
                                                <span className={`text-sm font-medium ${hasPurchasedPack ? 'text-blue-800' : 'text-amber-800'}`}>
                                                    Translated to {customLanguage || targetLanguage}
                                                </span>
                                                <button
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(translatedText)
                                                        setCopiedTranslation(true)
                                                        setTimeout(() => setCopiedTranslation(false), 2000)
                                                    }}
                                                    className={`text-xs flex items-center gap-1 ${hasPurchasedPack ? 'text-blue-600 hover:text-blue-700' : 'text-amber-600 hover:text-amber-700'}`}
                                                >
                                                    {copiedTranslation ? (
                                                        <><Check size={14} /> Copied</>
                                                    ) : (
                                                        <><Copy size={14} /> Copy</>
                                                    )}
                                                </button>
                                            </div>
                                            <p className="text-sm text-slate-700 whitespace-pre-wrap max-h-64 overflow-y-auto">
                                                {translatedText}
                                            </p>
                                            <p className={`text-xs mt-3 flex items-center gap-1 ${hasPurchasedPack ? 'text-blue-600' : 'text-amber-600'}`}>
                                                <Info size={12} />
                                                {hasPurchasedPack
                                                    ? 'Translation saved. Original contract is the official reference.'
                                                    : 'Preview only. This will be cleared on refresh.'}
                                            </p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </>
        )
    }

    // CASE B: Contract scanned but not yet saved (Review state)
    if (scanResult) {
        return (
            <>
                {Toast}
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <div className="flex items-start gap-4">
                            <Info size={24} className="text-blue-600 mt-1" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Contract details found</h3>
                                <p className="text-blue-700 text-sm mb-4">Confirm how you'd like to proceed.</p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    {renderField('Lease start', 'lease_start_date')}
                                    {renderField('Initial lease end', 'lease_end_date')}
                                    {renderField('Notice period', 'notice_period')}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={handleApplyToRental} disabled={applying} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50">
                                        {applying ? 'Saving...' : 'Use these details'}
                                    </button>
                                    <button onClick={handleReviewManually} className="px-5 py-2.5 border border-blue-300 text-blue-700 rounded-xl font-medium hover:bg-blue-100">
                                        Edit details manually
                                    </button>
                                    <button onClick={() => { setScanResult(null); setFile(null); }} className="px-5 py-2.5 text-slate-500 hover:text-slate-700">
                                        Upload different contract
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    // CASE C: No contract at all (Upload state)
    return (
        <>
            {Toast}
            <div className="bg-white p-6 rounded-xl border border-slate-200">
                <h3 className="font-semibold mb-2">Upload your rental contract</h3>
                <div onDrop={handleDrop} onDragOver={handleDragOver} className={`border-2 border-dashed rounded-xl p-8 text-center mt-4 ${file ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                    {file ? (
                        <div className="flex flex-col items-center gap-3">
                            <FileText className="text-green-600" size={32} />
                            <p className="text-green-700 font-medium">{file.name}</p>
                            <button onClick={() => setFile(null)} className="text-xs text-slate-500 pt-2">Remove file</button>
                        </div>
                    ) : (
                        <label className="cursor-pointer flex flex-col items-center gap-3">
                            <Upload className="text-slate-400" size={32} />
                            <p className="text-slate-600 font-medium tracking-tight">Drag and drop your contract here</p>
                            <span className="text-blue-600 font-medium hover:underline">Choose a file</span>
                            <input type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])} className="hidden" />
                        </label>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={handleScan} disabled={analyzing || !file} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium disabled:opacity-50">
                        {analyzing ? 'Analyzing...' : 'Analyze contract'}
                    </button>
                </div>

                {error && <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm flex gap-3"><AlertCircle size={18} /><span>{error}</span></div>}
            </div>
        </>
    )
}
