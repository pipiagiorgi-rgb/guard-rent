'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText,
    Plus,
    Wifi,
    Zap,
    Flame,
    Car,
    Shield,
    Package,
    Calendar,
    Bell,
    Trash2,
    Loader2,
    Upload,
    Eye,
    Download,
    Droplets,
    Sparkles,
    X,
    Check,
    AlertCircle,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import { DeleteConfirmationModal } from '@/components/ui/DeleteConfirmationModal'
import { DocumentAIPanel } from '@/components/features/DocumentAIPanel'
import { ReminderOptIn } from '@/components/features/ReminderOptIn'
import { DOCUMENT_VAULT_FREE } from '@/lib/featureFlags'

interface RelatedContract {
    contract_id: string
    contract_type: string
    custom_type?: string
    provider_name?: string
    label?: string
    start_date?: string
    end_date?: string
    notice_period_days?: number
    notice_period_source?: string
    file_name?: string
    storage_path?: string
    mime_type?: string
    size_bytes?: number
    renewal_date?: string
    min_term_end?: string
    created_at: string
}

interface RelatedContractsSectionProps {
    caseId: string
}

const CONTRACT_TYPES = [
    { value: 'internet', label: 'Internet', icon: Wifi },
    { value: 'electricity', label: 'Electricity', icon: Zap },
    { value: 'gas', label: 'Gas', icon: Flame },
    { value: 'water', label: 'Water', icon: Droplets },
    { value: 'insurance', label: 'Insurance', icon: Shield },
    { value: 'cleaning', label: 'Cleaning', icon: Sparkles },
    { value: 'parking', label: 'Parking', icon: Car },
    { value: 'storage', label: 'Storage', icon: Package },
    { value: 'other', label: 'Other', icon: FileText },
]

// Keyword-based classification for auto-categorization
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    internet: ['vodafone', 'orange', 'post', 'tango', 'proximus', 'telenet', 'scarlet', 'internet', 'wifi', 'broadband', 'fiber', 'fibre'],
    electricity: ['edf', 'engie', 'enovos', 'electrabel', 'luminus', 'electricity', 'électricité', 'strom', 'power'],
    gas: ['gas', 'gaz', 'engie', 'enovos', 'heating'],
    water: ['water', 'eau', 'wasser', 'sidero', 'sebes'],
    insurance: ['insurance', 'assurance', 'versicherung', 'axa', 'allianz', 'foyer', 'bâloise', 'baloise', 'lalux'],
    cleaning: ['cleaning', 'nettoyage', 'reinigung', 'housekeeping', 'maid', 'cleaner'],
    parking: ['parking', 'garage', 'stationnement', 'car park'],
    storage: ['storage', 'lagerung', 'stockage', 'self-storage', 'box'],
}

function suggestCategory(fileName: string, text?: string): string {
    const searchText = (fileName + ' ' + (text || '')).toLowerCase()
    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(kw => searchText.includes(kw))) {
            return category
        }
    }
    return 'other'
}

/**
 * RelatedContractsSection - Document Vault Component
 * 
 * LEGAL SAFETY NOTES:
 * - Document Vault files are reference-only
 * - They are EXCLUDED from all evidence PDFs by design
 * - No impact on Move-In / Move-Out sealing or court-ready reports
 * - Users can view, download, or delete files at any time
 * - These are NOT sealed evidence
 */
export function RelatedContractsSection({ caseId }: RelatedContractsSectionProps) {
    const [contracts, setContracts] = useState<RelatedContract[]>([])
    const [purchased, setPurchased] = useState(false)
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState<string | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Form state
    const [newContract, setNewContract] = useState({
        contractType: 'internet',
        customType: '',
        providerName: '',
        label: '',
        startDate: '',
        endDate: '',
        noticePeriodDays: '',
        file: null as File | null,
    })
    const [saving, setSaving] = useState(false)
    const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null)
    const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())
    const [isEditingDetails, setIsEditingDetails] = useState(false)
    const [expandedDetails, setExpandedDetails] = useState<Set<string>>(new Set())

    // Early access = always unlocked (feature flag)
    const isEarlyAccess = DOCUMENT_VAULT_FREE
    const hasAccess = isEarlyAccess || purchased

    useEffect(() => {
        loadContracts()

        // Check for success redirect from Stripe
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search)
            if (params.get('related_contracts') === 'success') {
                const timer = setTimeout(() => {
                    loadContracts()
                }, 1000)
                params.delete('related_contracts')
                const newUrl = window.location.pathname + (params.toString() ? `?${params}` : '')
                window.history.replaceState({}, '', newUrl)
                return () => clearTimeout(timer)
            }
        }
    }, [caseId])

    const loadContracts = async () => {
        try {
            const res = await fetch(`/api/related-contracts?caseId=${caseId}`)
            const data = await res.json()
            setContracts(data.contracts || [])
            setPurchased(data.purchased || false)
        } catch (err) {
            console.error('Failed to load related contracts:', err)
        } finally {
            setLoading(false)
        }
    }

    const handlePurchase = async () => {
        setPurchasing(true)
        try {
            const res = await fetch('/api/checkout/related-contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
        } catch (err) {
            console.error('Failed to start checkout:', err)
        } finally {
            setPurchasing(false)
        }
    }

    // Quick upload: Drop file → Upload → Analyze → Save (no modal)
    const handleQuickUpload = async (file: File) => {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif']
        if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith('.heic')) {
            setUploadError('Please upload a PDF or image file')
            return
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            setUploadError('File size must be under 10MB')
            return
        }

        setUploading(true)
        setUploadError(null)

        try {
            const supabase = createClient()

            // 1. Upload file to storage
            const fileExt = file.name.split('.').pop()?.toLowerCase() || 'pdf'
            const filePath = `cases/${caseId}/related/${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('guard-rent')
                .upload(filePath, file, {
                    contentType: file.type,
                    upsert: false
                })

            if (uploadError) {
                console.error('Upload error:', uploadError)
                setUploadError('Failed to upload file. Please try again.')
                setUploading(false)
                return
            }

            // 2. Analyze document for category and details
            let category = 'other'
            let provider = ''
            let startDate = ''
            let endDate = ''
            let noticePeriodDays: number | null = null

            try {
                const res = await fetch('/api/ai/document-analysis', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        fileName: file.name,
                        fileType: file.type,
                        storagePath: filePath
                    })
                })

                if (res.ok) {
                    const { analysis } = await res.json()
                    if (analysis) {
                        category = analysis.category || 'other'
                        provider = analysis.provider || ''
                        startDate = analysis.startDate || ''
                        endDate = analysis.endDate || ''
                        noticePeriodDays = analysis.noticePeriodDays || null
                    }
                }
            } catch (err) {
                // AI analysis failed - use filename-based detection
                category = suggestCategory(file.name)
            }

            // 3. Save document to database
            const res = await fetch('/api/related-contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    contractType: category,
                    customType: null,
                    providerName: provider || null,
                    label: null,
                    startDate: startDate || null,
                    endDate: endDate || null,
                    noticePeriodDays: noticePeriodDays,
                    noticePeriodSource: noticePeriodDays ? 'ai_extracted' : null,
                    storagePath: filePath,
                    fileName: file.name,
                    mimeType: file.type,
                    sizeBytes: file.size
                })
            })

            if (res.ok) {
                await loadContracts()
                // Auto-expand the category folder so user sees the new document
                setCollapsedCategories(prev => {
                    const next = new Set(prev)
                    next.add(`${category}_expanded`)
                    return next
                })
            } else {
                const error = await res.json()
                setUploadError(error.error || 'Failed to save document')
            }
        } catch (err) {
            console.error('Quick upload failed:', err)
            setUploadError('Upload failed. Please try again.')
        } finally {
            setUploading(false)
        }
    }

    // File input handler
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = '' // Reset input
        await handleQuickUpload(file)
    }

    const handleAddContract = async () => {
        if (!newContract.contractType) return

        setSaving(true)
        setUploadError(null)

        try {
            let storagePath = null
            let fileName = null
            let mimeType = null
            let sizeBytes = null

            // Upload file if present
            if (newContract.file) {
                const supabase = createClient()
                const fileExt = newContract.file.name.split('.').pop()?.toLowerCase() || 'pdf'
                const filePath = `cases/${caseId}/related/${crypto.randomUUID()}.${fileExt}`

                const { error: uploadError } = await supabase.storage
                    .from('guard-rent')
                    .upload(filePath, newContract.file, {
                        contentType: newContract.file.type,
                        upsert: false
                    })

                if (uploadError) {
                    console.error('Upload error:', uploadError)
                    setUploadError('Failed to upload file. Please try again.')
                    setSaving(false)
                    return
                }

                storagePath = filePath
                fileName = newContract.file.name
                mimeType = newContract.file.type
                sizeBytes = newContract.file.size
            }

            const res = await fetch('/api/related-contracts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    contractType: newContract.contractType,
                    customType: newContract.customType || null,
                    providerName: newContract.providerName || null,
                    label: newContract.label || null,
                    startDate: newContract.startDate || null,
                    endDate: newContract.endDate || null,
                    noticePeriodDays: newContract.noticePeriodDays ? parseInt(newContract.noticePeriodDays) : null,
                    noticePeriodSource: newContract.noticePeriodDays ? 'manual' : null,
                    storagePath,
                    fileName,
                    mimeType,
                    sizeBytes
                })
            })

            if (res.ok) {
                await loadContracts()
                setShowAddModal(false)
                setNewContract({
                    contractType: 'internet',
                    customType: '',
                    providerName: '',
                    label: '',
                    startDate: '',
                    endDate: '',
                    noticePeriodDays: '',
                    file: null,
                })
                setSuggestedCategory(null)
            } else {
                const error = await res.json()
                setUploadError(error.error || 'Failed to save contract')
            }
        } catch (err) {
            console.error('Failed to add contract:', err)
            setUploadError('Failed to save contract. Please try again.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        setDeleting(true)
        try {
            await fetch(`/api/related-contracts/${deleteId}`, { method: 'DELETE' })
            await loadContracts()
        } catch (err) {
            console.error('Failed to delete contract:', err)
        } finally {
            setDeleting(false)
            setDeleteId(null)
        }
    }

    const handleView = async (contract: RelatedContract) => {
        if (!contract.storage_path) return

        const supabase = createClient()
        const { data } = await supabase.storage
            .from('guard-rent')
            .createSignedUrl(contract.storage_path, 3600)

        if (data?.signedUrl) {
            window.open(data.signedUrl, '_blank')
        }
    }

    const handleDownload = async (contract: RelatedContract) => {
        if (!contract.storage_path) return

        const supabase = createClient()
        const { data } = await supabase.storage
            .from('guard-rent')
            .createSignedUrl(contract.storage_path, 3600, {
                download: contract.file_name || 'document'
            })

        if (data?.signedUrl) {
            // Use programmatic download for consistent behavior
            const link = document.createElement('a')
            link.href = data.signedUrl
            link.download = contract.file_name || 'document'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        }
    }

    const getTypeIcon = (type: string) => {
        const found = CONTRACT_TYPES.find(t => t.value === type)
        return found ? found.icon : FileText
    }

    const getTypeLabel = (type: string, customType?: string) => {
        if (type === 'other' && customType) return customType
        const found = CONTRACT_TYPES.find(t => t.value === type)
        return found ? found.label : type
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return ''
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    if (loading) {
        return (
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center gap-3">
                    <Loader2 className="animate-spin text-slate-400" size={20} />
                    <span className="text-slate-500">Loading...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                            <FileText size={20} className="text-slate-400" />
                            Related documents
                            <span className="text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">optional</span>
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Stored privately. Download or delete anytime. You stay in control.
                        </p>
                    </div>
                    {hasAccess && (
                        <label className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="hidden"
                            />
                            {uploading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    <span className="hidden sm:inline">Uploading...</span>
                                </>
                            ) : (
                                <>
                                    <Upload size={16} />
                                    <span className="hidden sm:inline">Upload</span>
                                </>
                            )}
                        </label>
                    )}
                </div>

                {/* Early access banner */}
                {isEarlyAccess && !purchased && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
                        <Sparkles size={14} />
                        <span>Free during early access — pricing may apply later</span>
                    </div>
                )}

                {/* Upload error banner */}
                {uploadError && (
                    <div className="mt-3 flex items-center gap-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 px-4 py-3 rounded-lg">
                        <AlertCircle size={18} className="text-amber-500 flex-shrink-0" />
                        <span className="flex-1">{uploadError}</span>
                        <button
                            onClick={() => setUploadError(null)}
                            className="text-amber-500 hover:text-amber-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
                {!hasAccess ? (
                    // Upsell state (only shown if early access is disabled)
                    <div className="text-center py-8">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileText size={24} className="text-slate-400" />
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">Track your utility contracts</h3>
                        <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                            Store internet, electricity, and other service contracts.
                            Get reminders for notice periods before they auto-renew.
                        </p>
                        <button
                            onClick={handlePurchase}
                            disabled={purchasing}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
                        >
                            {purchasing ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Processing...
                                </span>
                            ) : (
                                'Unlock for €9'
                            )}
                        </button>
                        <p className="text-xs text-slate-400 mt-2">One-time payment</p>
                    </div>
                ) : contracts.length === 0 ? (
                    // Empty state with drag-drop
                    <div
                        className={`text-center py-8 border-2 border-dashed rounded-xl transition-colors ${uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                        onDrop={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const file = e.dataTransfer.files?.[0]
                            if (file) handleQuickUpload(file)
                        }}
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            {uploading ? (
                                <Loader2 size={24} className="text-blue-500 animate-spin" />
                            ) : (
                                <Upload size={24} className="text-blue-500" />
                            )}
                        </div>
                        <h3 className="font-medium text-slate-900 mb-2">
                            {uploading ? 'Uploading and analysing...' : 'Drop a document here'}
                        </h3>
                        <p className="text-sm text-slate-500 mb-1">
                            Internet, electricity, insurance, or any document connected to your tenancy.
                        </p>
                        <p className="text-xs text-slate-400 mb-4">
                            We'll detect the category and extract key details automatically.
                        </p>
                        <label className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                            <input
                                type="file"
                                accept=".pdf,image/*"
                                onChange={handleFileSelect}
                                disabled={uploading}
                                className="hidden"
                            />
                            <Upload size={16} />
                            Or click to browse
                        </label>
                    </div>
                ) : (
                    // Contract list - grouped by category
                    <div className="space-y-4">
                        {(() => {
                            // Group contracts by category
                            const grouped = contracts.reduce((acc, contract) => {
                                const category = contract.contract_type || 'other'
                                if (!acc[category]) acc[category] = []
                                acc[category].push(contract)
                                return acc
                            }, {} as Record<string, RelatedContract[]>)

                            // Sort categories (utilities first, then alphabetically, 'other' last)
                            const categoryOrder = ['electricity', 'gas', 'water', 'internet', 'insurance', 'parking', 'storage', 'cleaning', 'employment', 'other']
                            const sortedCategories = Object.keys(grouped).sort((a, b) => {
                                const indexA = categoryOrder.indexOf(a)
                                const indexB = categoryOrder.indexOf(b)
                                return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
                            })

                            return sortedCategories.map(category => {
                                const categoryContracts = grouped[category]
                                const CategoryIcon = getTypeIcon(category)
                                const categoryLabel = getTypeLabel(category)
                                // ALL folders collapse by default unless explicitly expanded
                                const isCollapsed = !collapsedCategories.has(`${category}_expanded`)

                                const toggleCollapse = () => {
                                    setCollapsedCategories(prev => {
                                        const next = new Set(prev)
                                        if (isCollapsed) {
                                            next.add(`${category}_expanded`)
                                        } else {
                                            next.delete(`${category}_expanded`)
                                        }
                                        return next
                                    })
                                }

                                return (
                                    <div key={category}>
                                        {/* Folder header - always clickable */}
                                        <button
                                            onClick={toggleCollapse}
                                            className="flex items-center gap-2 mb-2 px-1 w-full text-left cursor-pointer hover:bg-slate-50 rounded-md py-1 -my-1 transition-colors"
                                        >
                                            <ChevronDown
                                                size={14}
                                                className={`text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
                                            />
                                            <CategoryIcon size={16} className="text-slate-400" />
                                            <span className="text-sm font-medium text-slate-600">{categoryLabel}</span>
                                            <span className="text-xs text-slate-400">({categoryContracts.length})</span>
                                        </button>

                                        {/* Documents in this folder - collapse if multiple */}
                                        {!isCollapsed && (
                                            <div className="space-y-2 pl-0">
                                                {categoryContracts.map((contract) => {
                                                    const Icon = getTypeIcon(contract.contract_type)
                                                    return (
                                                        <div
                                                            key={contract.contract_id}
                                                            className="bg-slate-50 rounded-lg overflow-hidden"
                                                        >
                                                            <div className="flex items-center justify-between p-3 sm:p-4">
                                                                <div className="flex items-center gap-3 min-w-0 flex-1">
                                                                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-slate-200 flex-shrink-0">
                                                                        <Icon size={20} className="text-slate-600" />
                                                                    </div>
                                                                    <div className="min-w-0">
                                                                        <p className="font-medium text-slate-900 truncate">
                                                                            {contract.label || getTypeLabel(contract.contract_type, contract.custom_type)}
                                                                            {contract.provider_name && (
                                                                                <span className="text-slate-500 font-normal"> — {contract.provider_name}</span>
                                                                            )}
                                                                        </p>
                                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mt-0.5">
                                                                            {contract.file_name && (
                                                                                <span className="truncate max-w-[120px]">{contract.file_name}</span>
                                                                            )}
                                                                            {contract.size_bytes && (
                                                                                <span>{formatFileSize(contract.size_bytes)}</span>
                                                                            )}
                                                                            {contract.end_date && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Calendar size={12} />
                                                                                    Ends {new Date(contract.end_date).toLocaleDateString('en-GB')}
                                                                                </span>
                                                                            )}
                                                                            {contract.notice_period_days && (
                                                                                <span className="flex items-center gap-1">
                                                                                    <Bell size={12} />
                                                                                    {contract.notice_period_days}d notice
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                                                                    {contract.storage_path && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => handleView(contract)}
                                                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                                                title="View"
                                                                            >
                                                                                <Eye size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => handleDownload(contract)}
                                                                                className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                                                                title="Download"
                                                                            >
                                                                                <Download size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                    <button
                                                                        onClick={() => setDeleteId(contract.contract_id)}
                                                                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Show all details - like Contract page */}
                                                            {(contract.start_date || contract.end_date || contract.notice_period_days || contract.provider_name) && (
                                                                <div className="border-t border-slate-100">
                                                                    <button
                                                                        onClick={() => {
                                                                            const next = new Set(expandedDetails)
                                                                            if (next.has(contract.contract_id)) {
                                                                                next.delete(contract.contract_id)
                                                                            } else {
                                                                                next.add(contract.contract_id)
                                                                            }
                                                                            setExpandedDetails(next)
                                                                        }}
                                                                        className="w-full px-4 py-3 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                                                                    >
                                                                        <span className="font-medium">Details</span>
                                                                        {expandedDetails.has(contract.contract_id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                                    </button>

                                                                    {expandedDetails.has(contract.contract_id) && (
                                                                        <div className="px-4 pb-4 bg-slate-50 grid grid-cols-2 gap-4">
                                                                            {contract.start_date && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">Start date</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {new Date(contract.start_date).toLocaleDateString('en-GB')}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {contract.end_date && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">End date</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {new Date(contract.end_date).toLocaleDateString('en-GB')}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {contract.notice_period_days && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">Notice period</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {contract.notice_period_days} days
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {contract.provider_name && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">Provider</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {contract.provider_name}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {contract.renewal_date && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">Renewal date</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {new Date(contract.renewal_date).toLocaleDateString('en-GB')}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                            {contract.min_term_end && (
                                                                                <div>
                                                                                    <p className="text-xs text-slate-400 mb-1">Minimum term ends</p>
                                                                                    <p className="text-sm font-medium text-slate-800">
                                                                                        {new Date(contract.min_term_end).toLocaleDateString('en-GB')}
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* Contextual AI Panel */}
                                                            <DocumentAIPanel
                                                                contractId={contract.contract_id}
                                                                contractType={contract.contract_type}
                                                                providerName={contract.provider_name}
                                                                label={contract.label}
                                                            />
                                                            {/* Reminder Opt-In */}
                                                            <ReminderOptIn
                                                                contractId={contract.contract_id}
                                                                caseId={caseId}
                                                                contractType={contract.contract_type}
                                                                providerName={contract.provider_name}
                                                                label={contract.label}
                                                                renewalDate={contract.renewal_date || contract.end_date}
                                                                noticePeriodDays={contract.notice_period_days}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        })()}

                        {/* Drop zone for adding more documents */}
                        <div
                            className={`mt-4 py-4 px-4 border-2 border-dashed rounded-lg transition-colors text-center ${uploading ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300'
                                }`}
                            onDragOver={(e) => { e.preventDefault(); e.stopPropagation() }}
                            onDrop={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                const file = e.dataTransfer.files?.[0]
                                if (file) handleQuickUpload(file)
                            }}
                        >
                            {uploading ? (
                                <span className="text-sm text-blue-600 flex items-center justify-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    Uploading...
                                </span>
                            ) : (
                                <span className="text-sm text-slate-400">
                                    Drop another document here
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-slate-900">Add a document</h3>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="p-1 text-slate-400 hover:text-slate-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Error Banner - Prominent position */}
                        {uploadError && (
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-amber-900">We saved your file, but couldn&apos;t finish organising it</p>
                                        <p className="text-xs text-amber-700 mt-1">
                                            {uploadError}
                                        </p>
                                        <div className="flex gap-3 mt-3">
                                            <button
                                                onClick={handleAddContract}
                                                disabled={saving}
                                                className="px-3 py-1.5 text-xs bg-amber-600 text-white rounded-md hover:bg-amber-700 font-medium"
                                            >
                                                {saving ? 'Retrying...' : 'Retry'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setNewContract({ ...newContract, file: null })
                                                    setUploadError(null)
                                                    setSuggestedCategory(null)
                                                }}
                                                className="px-3 py-1.5 text-xs border border-amber-300 text-amber-700 rounded-md hover:bg-amber-100"
                                            >
                                                Remove file
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setUploadError(null)}
                                        className="text-amber-400 hover:text-amber-600"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Upload document (optional)
                                </label>
                                <div
                                    onClick={() => !newContract.file && fileInputRef.current?.click()}
                                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${newContract.file
                                        ? 'border-green-300 bg-green-50'
                                        : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png,.heic,.heif"
                                        onChange={handleFileSelect}
                                        className="hidden"
                                    />
                                    {newContract.file ? (
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-center gap-2 text-green-700">
                                                <Check size={20} />
                                                <span className="text-sm font-medium truncate max-w-[200px]">{newContract.file.name}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-3">
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        // Preview - create blob URL
                                                        if (newContract.file) {
                                                            const url = URL.createObjectURL(newContract.file)
                                                            window.open(url, '_blank')
                                                        }
                                                    }}
                                                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                >
                                                    <Eye size={14} />
                                                    View
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setNewContract({ ...newContract, file: null })
                                                        setSuggestedCategory(null)
                                                    }}
                                                    className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                                                >
                                                    <Trash2 size={14} />
                                                    Remove file
                                                </button>
                                            </div>
                                            <p className="text-xs text-slate-400">You can delete or replace this later.</p>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500">
                                            <Upload size={24} className="mx-auto mb-2 text-slate-400" />
                                            <p className="text-sm">Drop a document here — we&apos;ll organise it for you</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG · Max 10MB</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Suggested Details Section */}
                            {newContract.file && !isEditingDetails && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium text-blue-800">
                                            Detected details
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditingDetails(true)}
                                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                                        >
                                            Edit details
                                        </button>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-500">Category:</span>
                                            <span className="font-medium text-slate-900">
                                                {CONTRACT_TYPES.find(t => t.value === newContract.contractType)?.label || newContract.contractType}
                                            </span>
                                            {suggestedCategory && (
                                                <span className="text-xs text-blue-500">(auto-detected)</span>
                                            )}
                                        </div>
                                        {newContract.providerName && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Provider:</span>
                                                <span className="font-medium text-slate-900">{newContract.providerName}</span>
                                            </div>
                                        )}
                                        {newContract.startDate && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Starts:</span>
                                                <span className="font-medium text-slate-900">
                                                    {new Date(newContract.startDate).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        )}
                                        {newContract.endDate && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Ends:</span>
                                                <span className="font-medium text-slate-900">
                                                    {new Date(newContract.endDate).toLocaleDateString('en-GB')}
                                                </span>
                                            </div>
                                        )}
                                        {newContract.noticePeriodDays && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500">Notice:</span>
                                                <span className="font-medium text-slate-900">{newContract.noticePeriodDays} days</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-blue-600 mt-3">
                                        These are optional — you can add or correct details anytime.
                                    </p>
                                </div>
                            )}

                            {/* Editable form - shown when no file or when editing details */}
                            {(!newContract.file || isEditingDetails) && (
                                <>
                                    {isEditingDetails && (
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-slate-700">Edit details</span>
                                            <button
                                                type="button"
                                                onClick={() => setIsEditingDetails(false)}
                                                className="text-xs text-slate-500 hover:text-slate-700"
                                            >
                                                Done editing
                                            </button>
                                        </div>
                                    )}

                                    {/* Category */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">
                                            Category
                                            {suggestedCategory && (
                                                <span className="text-xs text-blue-500 font-normal ml-2">(suggested)</span>
                                            )}
                                        </label>
                                        <select
                                            value={newContract.contractType}
                                            onChange={(e) => setNewContract({ ...newContract, contractType: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            {CONTRACT_TYPES.map(t => (
                                                <option key={t.value} value={t.value}>{t.label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {newContract.contractType === 'other' && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Custom type</label>
                                            <input
                                                type="text"
                                                value={newContract.customType}
                                                onChange={(e) => setNewContract({ ...newContract, customType: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="e.g. Gym membership"
                                            />
                                        </div>
                                    )}

                                    {/* Label */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Label (optional)</label>
                                        <input
                                            type="text"
                                            value={newContract.label}
                                            onChange={(e) => setNewContract({ ...newContract, label: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Home Internet"
                                        />
                                    </div>

                                    {/* Provider */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Provider name (optional)</label>
                                        <input
                                            type="text"
                                            value={newContract.providerName}
                                            onChange={(e) => setNewContract({ ...newContract, providerName: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. Vodafone, EDF"
                                        />
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">Start date</label>
                                            <input
                                                type="date"
                                                value={newContract.startDate}
                                                onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-1">End date</label>
                                            <input
                                                type="date"
                                                value={newContract.endDate}
                                                onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Notice period */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Notice period (days)</label>
                                        <input
                                            type="number"
                                            value={newContract.noticePeriodDays}
                                            onChange={(e) => setNewContract({ ...newContract, noticePeriodDays: e.target.value })}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="e.g. 30"
                                        />
                                        <p className="text-xs text-slate-500 mt-1">Only enter if explicitly stated in your contract</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddContract}
                                disabled={saving}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    'Add document'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete document"
                description="This document is for reference only and is not sealed evidence. Deleting it will not affect your official records or PDFs."
                context="reference"
            />
        </div>
    )
}
