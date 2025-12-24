'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, Camera, Download, Lock, Check,
    Loader2, Calendar, Shield, AlertCircle,
    ChevronRight, Eye, Mail, CheckCircle2,
    ChevronDown, ChevronUp, PenLine, Star, X, Video
} from 'lucide-react'
import { Lightbox } from '@/components/ui/Lightbox'
import Link from 'next/link'
import { PhotoComparison } from '@/components/features/PhotoComparison'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'
import { Footer } from '@/components/layout/Footer'

interface EvidenceState {
    checkinPhotos: number
    handoverPhotos: number
    contractSummary: boolean
    hasDeadlines: boolean
    handoverCompleted: boolean
    retentionUntil: string | null
    purchasedPacks: string[]
}

interface PhotoAsset {
    src: string
    caption: string
    subcaption: string
}

interface VideoAsset {
    assetId: string
    phase: 'check-in' | 'handover'
    fileName: string
    durationSeconds?: number
}

interface CustomSection {
    personalNotes: string
    propertyReview: string
    propertyRating: number
    customTitle: string
    customContent: string
    // Include toggles (default: true)
    includePersonalNotes: boolean
    includePropertyReview: boolean
    includeCustomSection: boolean
}

export default function ExportsPage({ params }: { params: Promise<{ id: string }> }) {
    const [caseId, setCaseId] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [generating, setGenerating] = useState<string | null>(null)
    const [evidence, setEvidence] = useState<EvidenceState>({
        checkinPhotos: 0,
        handoverPhotos: 0,
        contractSummary: false,
        hasDeadlines: false,
        handoverCompleted: false,
        retentionUntil: null,
        purchasedPacks: []
    })
    const [rentalLabel, setRentalLabel] = useState('')

    // Lightbox State
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<PhotoAsset[]>([])
    const [loadingPhotos, setLoadingPhotos] = useState(false)

    // Email PDF State
    const [lastGeneratedPdf, setLastGeneratedPdf] = useState<{ type: string; url: string } | null>(null)
    const [emailing, setEmailing] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    // PDF Customization State
    const [showCustomize, setShowCustomize] = useState<string | null>(null) // 'checkin_pack' | 'deposit_pack' | null
    const [customSections, setCustomSections] = useState<CustomSection>({
        personalNotes: '',
        propertyReview: '',
        propertyRating: 0,
        customTitle: '',
        customContent: '',
        includePersonalNotes: true,
        includePropertyReview: true,
        includeCustomSection: true
    })

    // PDF Preview State
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [previewType, setPreviewType] = useState<string | null>(null)
    const [previewing, setPreviewing] = useState<string | null>(null)

    // Save status for PDF customization
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
    const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const lastSavedRef = useRef<string>('')

    // Video state
    const [videos, setVideos] = useState<VideoAsset[]>([])
    const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            const { id } = await params
            setCaseId(id)
            await loadEvidence(id)
            await loadPdfCustomization(id)
        }
        load()
    }, [params])

    // Autosave effect
    useEffect(() => {
        if (!caseId) return

        const currentData = JSON.stringify(customSections)
        if (currentData === lastSavedRef.current) return

        // Clear existing timeout
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }

        // Debounce save
        saveTimeoutRef.current = setTimeout(() => {
            savePdfCustomization()
        }, 800)

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [customSections, caseId])

    const loadPdfCustomization = async (id: string) => {
        try {
            const res = await fetch(`/api/cases/${id}/pdf-customization`)
            if (res.ok) {
                const { data, saved_at } = await res.json()
                if (data) {
                    setCustomSections({
                        personalNotes: data.personal_notes || '',
                        propertyReview: data.property_review || '',
                        propertyRating: data.property_rating || 0,
                        customTitle: data.custom_title || '',
                        customContent: data.custom_content || '',
                        includePersonalNotes: data.include_personal_notes !== false,
                        includePropertyReview: data.include_property_review !== false,
                        includeCustomSection: data.include_custom_section !== false
                    })
                    lastSavedRef.current = JSON.stringify({
                        personalNotes: data.personal_notes || '',
                        propertyReview: data.property_review || '',
                        propertyRating: data.property_rating || 0,
                        customTitle: data.custom_title || '',
                        customContent: data.custom_content || '',
                        includePersonalNotes: data.include_personal_notes !== false,
                        includePropertyReview: data.include_property_review !== false,
                        includeCustomSection: data.include_custom_section !== false
                    })
                    if (saved_at) {
                        setLastSavedAt(saved_at)
                    }
                }
            }
        } catch (err) {
            console.error('Failed to load PDF customization:', err)
        }
    }

    const savePdfCustomization = async () => {
        if (!caseId) return

        setSaveStatus('saving')
        try {
            const res = await fetch(`/api/cases/${caseId}/pdf-customization`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    personal_notes: customSections.personalNotes || null,
                    property_rating: customSections.propertyRating || null,
                    property_review: customSections.propertyReview || null,
                    custom_title: customSections.customTitle || null,
                    custom_content: customSections.customContent || null,
                    include_personal_notes: customSections.includePersonalNotes,
                    include_property_review: customSections.includePropertyReview,
                    include_custom_section: customSections.includeCustomSection
                })
            })

            if (res.ok) {
                const { saved_at } = await res.json()
                lastSavedRef.current = JSON.stringify(customSections)
                setSaveStatus('saved')
                if (saved_at) {
                    setLastSavedAt(saved_at)
                }
                // Reset to idle after 2 seconds
                setTimeout(() => setSaveStatus('idle'), 2000)
            } else {
                setSaveStatus('error')
            }
        } catch (err) {
            console.error('Failed to save PDF customization:', err)
            setSaveStatus('error')
        }
    }

    const loadEvidence = async (id: string) => {
        setLoading(true)
        try {
            const supabase = createClient()

            // Fetch case data
            const { data: caseData } = await supabase
                .from('cases')
                .select('label, contract_analysis, handover_completed_at, retention_until')
                .eq('case_id', id)
                .single()

            if (caseData) {
                setRentalLabel(caseData.label)
            }

            // Count check-in photos
            const { count: checkinCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', id)
                .in('type', ['checkin_photo', 'photo'])

            // Count handover photos
            const { count: handoverCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', id)
                .eq('type', 'handover_photo')

            // Check deadlines
            const { count: deadlineCount } = await supabase
                .from('deadlines')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', id)

            // Get entitlement status from server (includes admin check)
            let purchasedPacks: string[] = []
            let retentionUntil = caseData?.retention_until
            try {
                const statusRes = await fetch(`/api/exports/status?caseId=${id}`)
                if (statusRes.ok) {
                    const status = await statusRes.json()
                    purchasedPacks = status.purchasedPacks || []
                    if (status.retentionUntil) {
                        retentionUntil = status.retentionUntil
                    }
                }
            } catch (e) {
                // Fallback to database query if API fails
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('pack_type')
                    .eq('case_id', id)
                purchasedPacks = purchases?.map(p => p.pack_type) || []
            }

            setEvidence({
                checkinPhotos: checkinCount || 0,
                handoverPhotos: handoverCount || 0,
                contractSummary: !!caseData?.contract_analysis,
                hasDeadlines: (deadlineCount || 0) > 0,
                handoverCompleted: !!caseData?.handover_completed_at,
                retentionUntil,
                purchasedPacks
            })

            // Fetch walkthrough videos
            const { data: videoAssets } = await supabase
                .from('assets')
                .select('asset_id, storage_path, duration_seconds, phase')
                .eq('case_id', id)
                .eq('type', 'walkthrough_video')

            if (videoAssets && videoAssets.length > 0) {
                setVideos(videoAssets.map(v => ({
                    assetId: v.asset_id,
                    phase: v.phase as 'check-in' | 'handover',
                    fileName: v.storage_path.split('/').pop() || 'walkthrough.mp4',
                    durationSeconds: v.duration_seconds
                })))
            }
        } catch (err) {
            console.error('Failed to load evidence:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleVideoDownload = async (video: VideoAsset) => {
        setDownloadingVideo(video.assetId)
        try {
            const res = await fetch('/api/assets/download-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: video.assetId,
                    forceDownload: true,
                    fileName: `RentVault_${video.phase === 'check-in' ? 'CheckIn' : 'Handover'}_Video.mp4`
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Failed to get download link')

            // Use anchor element for mobile compatibility (window.open blocked after async)
            const link = document.createElement('a')
            link.href = data.signedUrl
            link.target = '_blank'
            link.rel = 'noopener noreferrer'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (err) {
            console.error('Video download error:', err)
        } finally {
            setDownloadingVideo(null)
        }
    }

    const openGallery = async (type: 'checkin' | 'handover') => {
        setLoadingPhotos(true)
        try {
            const supabase = createClient()
            const types = type === 'checkin' ? ['checkin_photo', 'photo'] : ['handover_photo']

            const { data: assets } = await supabase
                .from('assets')
                .select('*')
                .eq('case_id', caseId)
                .in('type', types)
                .order('created_at', { ascending: true })

            if (assets && assets.length > 0) {
                // Generate signed URLs in batch
                const paths = assets.map(a => a.storage_path)
                const { data: signedData } = await supabase.storage
                    .from('guard-rent')
                    .createSignedUrls(paths, 3600) // 1 hour

                const signedMap = new Map<string, string>()
                if (signedData) {
                    signedData.forEach(item => {
                        if (item.path && item.signedUrl) {
                            signedMap.set(item.path, item.signedUrl)
                        }
                    })
                }

                const signedPhotos = assets.map(a => ({
                    src: signedMap.get(a.storage_path) || '',
                    caption: a.room_name || (type === 'checkin' ? 'Check-in Photo' : 'Handover Photo'),
                    subcaption: `${type === 'checkin' ? 'Check-in' : 'Handover'} • ${new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
                })).filter(p => p.src)

                if (signedPhotos.length > 0) {
                    setLightboxImages(signedPhotos)
                    setLightboxOpen(true)
                } else {
                    console.log('No valid signed URLs generated')
                }
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoadingPhotos(false)
        }
    }

    const handlePurchase = async (packType: string, amount: number) => {
        setPurchasing(packType)
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    packType,
                    amount
                })
            })

            if (!res.ok) throw new Error('Checkout failed')
            const { url } = await res.json()
            if (url) window.location.href = url
        } catch (err) {
            console.error('Purchase error:', err)
        } finally {
            setPurchasing(null)
        }
    }

    const handleGenerate = async (packType: string, forPreview = false) => {
        if (forPreview) {
            setPreviewing(packType)
        } else {
            setGenerating(packType)
        }
        setLastGeneratedPdf(null)

        try {
            const endpoint = packType === 'checkin_pack'
                ? '/api/pdf/checkin-report'
                : '/api/pdf/deposit-pack'

            // Include custom sections if any are filled
            const hasCustomContent = customSections.personalNotes ||
                customSections.propertyReview ||
                customSections.propertyRating > 0 ||
                customSections.customContent

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    customSections: hasCustomContent ? customSections : undefined,
                    forPreview
                })
            })

            const data = await res.json()
            if (!res.ok) {
                console.error('PDF Generation failed:', data.error || data)
                throw new Error(data.error || 'Generation failed')
            }
            const { url } = data

            if (forPreview && url) {
                setPreviewUrl(url)
                setPreviewType(packType)
                setPreviewOpen(true)
            } else if (url) {
                // Use anchor element for mobile compatibility (window.open blocked after async)
                const link = document.createElement('a')
                link.href = url
                link.target = '_blank'
                link.rel = 'noopener noreferrer'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                const hasPack = packType === 'checkin_pack' ? hasCheckinPack : hasDepositPack
                if (hasPack) {
                    setLastGeneratedPdf({ type: packType, url })
                }
            } else {
                console.error('No URL returned from PDF API')
            }
        } catch (err) {
            console.error('Generate error:', err)
        } finally {
            setGenerating(null)
            setPreviewing(null)
        }
    }

    const handlePreview = (packType: string) => {
        handleGenerate(packType, true)
    }

    const closePreview = () => {
        setPreviewOpen(false)
        setPreviewUrl(null)
        setPreviewType(null)
    }

    const handleEmailPdf = async () => {
        if (!lastGeneratedPdf) return
        setEmailing(true)
        try {
            const res = await fetch('/api/pdf/email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    packType: lastGeneratedPdf.type,
                    pdfUrl: lastGeneratedPdf.url
                })
            })

            if (!res.ok) throw new Error('Email failed')

            setToastMessage('Email sent successfully.')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
            setLastGeneratedPdf(null) // Clear after sending
        } catch (err) {
            console.error('Email error:', err)
            setToastMessage('Failed to send email.')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } finally {
            setEmailing(false)
        }
    }

    const canUnlockCheckin = evidence.checkinPhotos > 0
    const canUnlockDeposit = evidence.checkinPhotos > 0 && evidence.handoverPhotos > 0 && evidence.handoverCompleted
    const hasCheckinPack = evidence.purchasedPacks.includes('checkin_pack')
    const hasDepositPack = evidence.purchasedPacks.includes('deposit_pack')

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={32} />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Toast notification */}
            {showToast && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <div className="flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl shadow-lg">
                        <CheckCircle2 size={18} className="text-green-600" />
                        <span className="text-sm text-green-800 font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}

            <Lightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                images={lightboxImages}
            />

            {/* PDF Preview Modal */}
            {previewOpen && previewUrl && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-200">
                            <div>
                                <h3 className="font-semibold text-lg">PDF Preview</h3>
                                <p className="text-sm text-slate-500">
                                    {previewType === 'checkin_pack' ? 'Check-in Pack' : 'Deposit Recovery Pack'}
                                </p>
                            </div>
                            <button
                                onClick={closePreview}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* PDF Viewer */}
                        <div className="flex-1 bg-slate-100 overflow-auto">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full"
                                title="PDF Preview"
                            />
                        </div>

                        {/* Modal Footer */}
                        {(() => {
                            const isPaid = previewType === 'checkin_pack' ? hasCheckinPack : hasDepositPack
                            const packPrice = previewType === 'checkin_pack' ? '€19' : '€29'
                            const packName = previewType === 'checkin_pack' ? 'Check-in Pack' : 'Deposit Recovery Pack'

                            if (isPaid) {
                                // Paid user - show download button
                                return (
                                    <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
                                        <button
                                            onClick={closePreview}
                                            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-medium"
                                        >
                                            ← Back to customize
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (previewUrl) {
                                                    // Use anchor for mobile compatibility
                                                    const link = document.createElement('a')
                                                    link.href = previewUrl
                                                    link.target = '_blank'
                                                    link.rel = 'noopener noreferrer'
                                                    document.body.appendChild(link)
                                                    link.click()
                                                    document.body.removeChild(link)
                                                }
                                            }}
                                            className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center gap-2"
                                        >
                                            <Download size={18} />
                                            Download PDF
                                        </button>
                                    </div>
                                )
                            }

                            // Unpaid user - show locked state with purchase CTA
                            return (
                                <div className="p-5 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        {/* Value prop */}
                                        <div className="flex-1 text-center sm:text-left">
                                            <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                                                <Lock size={16} className="text-slate-500" />
                                                <span className="text-sm font-medium text-slate-700">Download locked</span>
                                            </div>
                                            <p className="text-sm text-slate-500">
                                                Remove watermarks and download your evidence pack
                                            </p>
                                        </div>

                                        {/* Purchase CTA */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={closePreview}
                                                className="px-4 py-2.5 text-slate-600 hover:text-slate-900 font-medium text-sm"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={() => {
                                                    closePreview()
                                                    handlePurchase(previewType!, previewType === 'checkin_pack' ? 1900 : 2900)
                                                }}
                                                className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center gap-2 shadow-lg shadow-slate-900/20"
                                            >
                                                <span>Unlock for {packPrice}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Trust indicators */}
                                    <div className="flex items-center justify-center gap-4 mt-3 text-xs text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-600" />
                                            Watermark-free PDF
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-600" />
                                            Stored for 12 months
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Check size={12} className="text-green-600" />
                                            Dispute-ready
                                        </span>
                                    </div>
                                </div>
                            )
                        })()}
                    </div>
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold mb-1">Your evidence</h1>
                <p className="text-slate-500">
                    Access your photos and documentation anytime.
                </p>
            </div>

            {/* Upgrade Banner */}
            <UpgradeBanner
                caseId={caseId}
                currentPack={evidence.purchasedPacks.length > 0 ? evidence.purchasedPacks[0] : null}
            />

            {/* Email me a copy panel - shows after PDF generation for paid packs */}
            {lastGeneratedPdf && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Mail className="text-blue-600" size={20} />
                        <div>
                            <p className="text-sm font-medium text-blue-900">Want a copy in your inbox?</p>
                            <p className="text-xs text-blue-700">We'll send you a link to download the PDF.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleEmailPdf}
                        disabled={emailing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                        {emailing ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Mail size={16} />
                        )}
                        Email me a copy
                    </button>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION A: EVIDENCE (FREE)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Check-in photos */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evidence.checkinPhotos > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Camera size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium">Check-in photos</h3>
                            <p className="text-sm text-slate-500">
                                {evidence.checkinPhotos > 0 ? `${evidence.checkinPhotos} photos recorded` : 'No photos yet'}
                            </p>
                        </div>
                    </div>
                    {evidence.checkinPhotos > 0 ? (
                        <button
                            onClick={() => openGallery('checkin')}
                            disabled={loadingPhotos}
                            className="text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors"
                        >
                            {loadingPhotos ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                            View gallery
                        </button>
                    ) : (
                        <Link href={`/vault/case/${caseId}/check-in`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            Go to check-in <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

                {/* Handover photos */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evidence.handoverPhotos > 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Camera size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium">Handover photos</h3>
                            <p className="text-sm text-slate-500">
                                {evidence.handoverPhotos > 0 ? `${evidence.handoverPhotos} photos recorded` : 'No photos yet'}
                            </p>
                        </div>
                    </div>
                    {evidence.handoverPhotos > 0 ? (
                        <button
                            onClick={() => openGallery('handover')}
                            disabled={loadingPhotos}
                            className="text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors"
                        >
                            {loadingPhotos ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                            View gallery
                        </button>
                    ) : (
                        <Link href={`/vault/case/${caseId}/handover`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            Go to handover <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

                {/* Check-in Video */}
                {(() => {
                    const checkinVideo = videos.find(v => v.phase === 'check-in')
                    return (
                        <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${checkinVideo ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium">Check-in video</h3>
                                    <p className="text-sm text-slate-500">
                                        {checkinVideo
                                            ? `Walkthrough recorded${checkinVideo.durationSeconds ? ` (${Math.round(checkinVideo.durationSeconds / 60)}min)` : ''}`
                                            : 'No video yet'}
                                    </p>
                                </div>
                            </div>
                            {checkinVideo ? (
                                <button
                                    onClick={() => handleVideoDownload(checkinVideo)}
                                    disabled={downloadingVideo === checkinVideo.assetId}
                                    className="text-sm text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {downloadingVideo === checkinVideo.assetId ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download video
                                </button>
                            ) : (
                                <Link href={`/vault/case/${caseId}/check-in`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                    Go to check-in <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    )
                })()}

                {/* Handover Video */}
                {(() => {
                    const handoverVideo = videos.find(v => v.phase === 'handover')
                    return (
                        <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${handoverVideo ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <Video size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium">Handover video</h3>
                                    <p className="text-sm text-slate-500">
                                        {handoverVideo
                                            ? `Walkthrough recorded${handoverVideo.durationSeconds ? ` (${Math.round(handoverVideo.durationSeconds / 60)}min)` : ''}`
                                            : 'No video yet'}
                                    </p>
                                </div>
                            </div>
                            {handoverVideo ? (
                                <button
                                    onClick={() => handleVideoDownload(handoverVideo)}
                                    disabled={downloadingVideo === handoverVideo.assetId}
                                    className="text-sm text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {downloadingVideo === handoverVideo.assetId ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download video
                                </button>
                            ) : (
                                <Link href={`/vault/case/${caseId}/handover`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                    Go to handover <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    )
                })()}

                {/* Contract summary */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evidence.contractSummary ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium">Contract summary</h3>
                            <p className="text-sm text-slate-500">
                                {evidence.contractSummary ? 'Contract analysed' : 'Not scanned yet'}
                            </p>
                        </div>
                    </div>
                    {evidence.contractSummary ? (
                        <Link
                            href={`/vault/case/${caseId}/contract`}
                            className="text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors"
                        >
                            <Eye size={16} />
                            View details
                        </Link>
                    ) : (
                        <div className="h-9"></div> // Spacer
                    )}
                </div>

                {/* Deadlines */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${evidence.hasDeadlines ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                            <Calendar size={20} />
                        </div>
                        <div>
                            <h3 className="font-medium">Reminders</h3>
                            <p className="text-sm text-slate-500">
                                {evidence.hasDeadlines ? 'Active' : 'No reminders active'}
                            </p>
                        </div>
                    </div>
                    <Link
                        href={`/vault/case/${caseId}/deadlines`}
                        className="text-sm text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors"
                    >
                        <Eye size={16} />
                        {evidence.hasDeadlines ? 'View reminders' : 'Set reminders'}
                    </Link>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION A.5: PHOTO COMPARISON BY ROOM
            ═══════════════════════════════════════════════════════════════ */}
            {(evidence.checkinPhotos > 0 || evidence.handoverPhotos > 0) && (
                <div className="pt-6">
                    <h2 className="text-lg font-semibold mb-4">Photos by room</h2>
                    <PhotoComparison caseId={caseId} />
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION B: GENERATE OFFICIAL REPORTS (PAID)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="pt-8 border-t border-slate-200">
                <h2 className="text-lg font-semibold mb-4">Official PDF reports</h2>
                <div className="space-y-4">

                    {/* Check-in Pack */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                        <FileText className="text-blue-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Check-in Pack</h3>
                                        <p className="text-slate-500">Timestamped move-in documentation</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold">€19</span>
                            </div>

                            <div className="space-y-2 mb-6 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>All check-in photos with timestamps</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Walkthrough video upload</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Contract summary</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>12 months secure storage</span>
                                </div>
                            </div>

                            {/* Customize PDF Section */}
                            {canUnlockCheckin && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowCustomize(showCustomize === 'checkin_pack' ? null : 'checkin_pack')}
                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        <PenLine size={16} />
                                        Customize PDF
                                        {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin text-slate-400" />}
                                        {saveStatus === 'saved' && <Check size={14} className="text-green-500" />}
                                        {showCustomize === 'checkin_pack' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    {showCustomize === 'checkin_pack' && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
                                            {/* Save Status Indicator with UTC Timestamp */}
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>
                                                    {lastSavedAt
                                                        ? `Last saved: ${new Date(lastSavedAt).toLocaleString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC`
                                                        : 'Your changes are saved automatically'}
                                                </span>
                                                {saveStatus === 'saved' && (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <Check size={12} /> Saved
                                                    </span>
                                                )}
                                                {saveStatus === 'saving' && (
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <Loader2 size={12} className="animate-spin" /> Saving...
                                                    </span>
                                                )}
                                            </div>

                                            {/* Personal Notes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Personal notes (user-provided)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includePersonalNotes}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includePersonalNotes: e.target.checked }))}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <textarea
                                                    value={customSections.personalNotes}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, personalNotes: e.target.value }))}
                                                    placeholder="Any additional notes you'd like to include..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Property Review */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Property review (optional)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includePropertyReview}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includePropertyReview: e.target.checked }))}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setCustomSections(prev => ({ ...prev, propertyRating: star }))}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star
                                                                size={20}
                                                                className={star <= customSections.propertyRating
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-slate-300'}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={customSections.propertyReview}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, propertyReview: e.target.value }))}
                                                    placeholder="Your experience with this property..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Custom Section */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Custom section (optional)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includeCustomSection}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includeCustomSection: e.target.checked }))}
                                                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={customSections.customTitle}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, customTitle: e.target.value }))}
                                                    placeholder="Section title..."
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                                <textarea
                                                    value={customSections.customContent}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, customContent: e.target.value }))}
                                                    placeholder="Section content..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {hasCheckinPack ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePreview('checkin_pack')}
                                        disabled={previewing === 'checkin_pack'}
                                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                    >
                                        {previewing === 'checkin_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Eye size={20} />
                                                Preview
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleGenerate('checkin_pack')}
                                        disabled={generating === 'checkin_pack'}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        {generating === 'checkin_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                Download
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : canUnlockCheckin ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handlePreview('checkin_pack')}
                                            disabled={previewing === 'checkin_pack'}
                                            className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                        >
                                            {previewing === 'checkin_pack' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Eye size={20} />
                                                    Preview
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handlePurchase('checkin_pack', 1900)}
                                            disabled={purchasing === 'checkin_pack'}
                                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                                        >
                                            {purchasing === 'checkin_pack' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Download size={20} />
                                                    Buy & Download
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">
                                        Preview is free • Purchase for watermark-free PDF
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <Lock size={18} />
                                        <span className="font-medium">Add check-in photos to unlock</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Deposit Recovery Pack */}
                    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                        <Shield className="text-purple-600" size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Deposit Recovery Pack</h3>
                                        <p className="text-slate-500">Complete before/after evidence</p>
                                    </div>
                                </div>
                                <span className="text-xl font-bold">€29</span>
                            </div>

                            <div className="space-y-2 mb-6 text-sm text-slate-600">
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Check-in + handover photo comparison</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Walkthrough video uploads</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Meter readings & key return confirmation</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>Ready for deposit disputes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>12 months secure storage</span>
                                </div>
                            </div>

                            {/* Customize PDF Section */}
                            {canUnlockDeposit && (
                                <div className="mb-4">
                                    <button
                                        onClick={() => setShowCustomize(showCustomize === 'deposit_pack' ? null : 'deposit_pack')}
                                        className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                                    >
                                        <PenLine size={16} />
                                        Customize PDF
                                        {saveStatus === 'saving' && <Loader2 size={14} className="animate-spin text-slate-400" />}
                                        {saveStatus === 'saved' && <Check size={14} className="text-green-500" />}
                                        {showCustomize === 'deposit_pack' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    {showCustomize === 'deposit_pack' && (
                                        <div className="mt-4 p-4 bg-slate-50 rounded-xl space-y-4">
                                            {/* Save Status Indicator with UTC Timestamp */}
                                            <div className="flex items-center justify-between text-xs text-slate-500">
                                                <span>
                                                    {lastSavedAt
                                                        ? `Last saved: ${new Date(lastSavedAt).toLocaleString('en-GB', { timeZone: 'UTC', day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC`
                                                        : 'Your changes are saved automatically'}
                                                </span>
                                                {saveStatus === 'saved' && (
                                                    <span className="text-green-600 flex items-center gap-1">
                                                        <Check size={12} /> Saved
                                                    </span>
                                                )}
                                                {saveStatus === 'saving' && (
                                                    <span className="text-slate-400 flex items-center gap-1">
                                                        <Loader2 size={12} className="animate-spin" /> Saving...
                                                    </span>
                                                )}
                                            </div>

                                            {/* Personal Notes */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Personal notes (user-provided)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includePersonalNotes}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includePersonalNotes: e.target.checked }))}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <textarea
                                                    value={customSections.personalNotes}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, personalNotes: e.target.value }))}
                                                    placeholder="Any additional notes for the dispute record..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Property Review */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Property review (optional)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includePropertyReview}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includePropertyReview: e.target.checked }))}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <div className="flex items-center gap-2 mb-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setCustomSections(prev => ({ ...prev, propertyRating: star }))}
                                                            className="focus:outline-none"
                                                        >
                                                            <Star
                                                                size={20}
                                                                className={star <= customSections.propertyRating
                                                                    ? 'text-amber-400 fill-amber-400'
                                                                    : 'text-slate-300'}
                                                            />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={customSections.propertyReview}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, propertyReview: e.target.value }))}
                                                    placeholder="Your overall experience with this property..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>

                                            {/* Custom Section */}
                                            <div>
                                                <div className="flex items-center justify-between mb-1">
                                                    <label className="block text-sm font-medium text-slate-700">
                                                        Custom section (optional)
                                                    </label>
                                                    <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={customSections.includeCustomSection}
                                                            onChange={(e) => setCustomSections(prev => ({ ...prev, includeCustomSection: e.target.checked }))}
                                                            className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                                                        />
                                                        Include in PDF
                                                    </label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={customSections.customTitle}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, customTitle: e.target.value }))}
                                                    placeholder="Section title..."
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                                <textarea
                                                    value={customSections.customContent}
                                                    onChange={(e) => setCustomSections(prev => ({ ...prev, customContent: e.target.value }))}
                                                    placeholder="Section content..."
                                                    rows={2}
                                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Action Buttons */}
                            {hasDepositPack ? (
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => handlePreview('deposit_pack')}
                                        disabled={previewing === 'deposit_pack'}
                                        className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                    >
                                        {previewing === 'deposit_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Eye size={20} />
                                                Preview
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => handleGenerate('deposit_pack')}
                                        disabled={generating === 'deposit_pack'}
                                        className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                    >
                                        {generating === 'deposit_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                Download
                                            </>
                                        )}
                                    </button>
                                </div>
                            ) : canUnlockDeposit ? (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handlePreview('deposit_pack')}
                                            disabled={previewing === 'deposit_pack'}
                                            className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                        >
                                            {previewing === 'deposit_pack' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Eye size={20} />
                                                    Preview
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={() => handlePurchase('deposit_pack', 2900)}
                                            disabled={purchasing === 'deposit_pack'}
                                            className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                                        >
                                            {purchasing === 'deposit_pack' ? (
                                                <Loader2 className="animate-spin" size={20} />
                                            ) : (
                                                <>
                                                    <Download size={20} />
                                                    Buy & Download
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400 text-center">
                                        Preview is free • Purchase for watermark-free PDF
                                    </p>
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                                    <div className="flex items-center gap-2 text-amber-700">
                                        <Lock size={18} />
                                        <span className="font-medium">
                                            {!evidence.handoverCompleted
                                                ? 'Complete handover to unlock'
                                                : 'Add check-in and handover photos to unlock'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Archive / Keep documents offer - value-driven */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 flex-shrink-0">
                        <Shield size={20} />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-900 mb-1">Keep these documents available</h3>
                        {evidence.retentionUntil ? (
                            <p className="text-slate-600 text-sm mb-3">
                                Your records are stored securely until {' '}
                                <span className="font-medium">
                                    {new Date(evidence.retentionUntil).toLocaleDateString('en-GB', {
                                        day: 'numeric', month: 'long', year: 'numeric'
                                    })}
                                </span>.
                                You can extend anytime.
                            </p>
                        ) : (
                            <p className="text-slate-600 text-sm mb-3">
                                Your evidence is stored for 12 months. Extend storage to keep records available longer.
                            </p>
                        )}
                        <Link
                            href={`/vault/case/${caseId}/settings`}
                            className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium hover:text-slate-900"
                        >
                            View storage options <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Disclaimer */}

        </div>
    )
}
