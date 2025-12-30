'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Lightbox } from '@/components/ui/Lightbox'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'
import {
    FileText,
    Download,
    Eye,
    Check,
    Lock,
    Loader2,
    ChevronRight,
    Shield,
    AlertCircle,
    CheckCircle2,
    Video,
    ShieldCheck,
} from 'lucide-react'

interface ShortStayExportsProps {
    caseId: string
    stayType: 'short_stay' | 'long_term'
}

interface EvidenceState {
    arrivalPhotos: number
    departurePhotos: number
    arrivalVideoId: string | null
    departureVideoId: string | null
    purchasedPacks: string[]
    retentionUntil: string | null
    platformName?: string
    reservationId?: string
    checkInDate?: string
    checkOutDate?: string
    label?: string
    isAdmin?: boolean
}

export default function ShortStayExports({ caseId, stayType }: ShortStayExportsProps) {
    const [loading, setLoading] = useState(true)
    const [evidence, setEvidence] = useState<EvidenceState>({
        arrivalPhotos: 0,
        departurePhotos: 0,
        arrivalVideoId: null,
        departureVideoId: null,
        purchasedPacks: [],
        retentionUntil: null,
    })
    const [generating, setGenerating] = useState<string | null>(null)
    const [previewing, setPreviewing] = useState<string | null>(null)
    const [purchasing, setPurchasing] = useState<string | null>(null)
    const [downloadingVideo, setDownloadingVideo] = useState<string | null>(null)

    // Progress modal state
    const [generatingStep, setGeneratingStep] = useState<number>(0) // 0=none, 1=gathering, 2=creating, 3=finalizing

    // Toast
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState('')

    // Lightbox
    const [lightboxOpen, setLightboxOpen] = useState(false)
    const [lightboxImages, setLightboxImages] = useState<{ src: string; caption?: string; subcaption?: string }[]>([])

    // Preview modal
    const [previewOpen, setPreviewOpen] = useState(false)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)

    useEffect(() => {
        async function fetchEvidence() {
            const supabase = createClient()

            // Fetch case details
            const { data: caseData } = await supabase
                .from('cases')
                .select('label, platform_name, reservation_id, check_in_date, check_out_date, retention_until')
                .eq('case_id', caseId)
                .single()

            // Count arrival photos (checkin_photo type)
            const { count: arrivalCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', caseId)
                .eq('type', 'checkin_photo')

            // Count departure photos (handover_photo type)
            const { count: departureCount } = await supabase
                .from('assets')
                .select('*', { count: 'exact', head: true })
                .eq('case_id', caseId)
                .eq('type', 'handover_photo')

            // Get videos
            const { data: arrivalVideo } = await supabase
                .from('assets')
                .select('asset_id')
                .eq('case_id', caseId)
                .eq('type', 'walkthrough_video')
                .eq('phase', 'check-in')
                .single()

            const { data: departureVideo } = await supabase
                .from('assets')
                .select('asset_id')
                .eq('case_id', caseId)
                .eq('type', 'walkthrough_video')
                .eq('phase', 'handover')
                .single()

            // Get purchased packs and admin status
            const { data: purchases } = await supabase
                .from('purchases')
                .select('pack_type')
                .eq('case_id', caseId)

            // Check admin status via exports/status API
            let isAdmin = false
            try {
                const statusRes = await fetch(`/api/exports/status?caseId=${caseId}`)
                if (statusRes.ok) {
                    const status = await statusRes.json()
                    isAdmin = status.isAdmin || false
                }
            } catch { }

            setEvidence({
                arrivalPhotos: arrivalCount || 0,
                departurePhotos: departureCount || 0,
                arrivalVideoId: arrivalVideo?.asset_id || null,
                departureVideoId: departureVideo?.asset_id || null,
                purchasedPacks: purchases?.map(p => p.pack_type) || [],
                retentionUntil: caseData?.retention_until || null,
                platformName: caseData?.platform_name,
                reservationId: caseData?.reservation_id,
                checkInDate: caseData?.check_in_date,
                checkOutDate: caseData?.check_out_date,
                label: caseData?.label,
                isAdmin,
            })
            setLoading(false)
        }

        fetchEvidence()
    }, [caseId])

    const hasShortStayPack = evidence.purchasedPacks.includes('short_stay')
    const canAccess = hasShortStayPack || evidence.isAdmin

    const handleDownloadVideo = async (assetId: string, phase: 'arrival' | 'departure') => {
        setDownloadingVideo(phase)
        try {
            const res = await fetch('/api/assets/download-url', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId,
                    forceDownload: true,
                    fileName: `RentVault_${phase === 'arrival' ? 'Arrival' : 'Departure'}_Video.mp4`
                })
            })
            const data = await res.json()
            if (data.signedUrl) {
                // Use window.location.href for actual download (Content-Disposition: attachment)
                window.location.href = data.signedUrl
            } else {
                throw new Error(data.error || 'Failed to get download URL')
            }
        } catch (err: any) {
            setToastMessage(err?.message || 'Failed to download video')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } finally {
            setDownloadingVideo(null)
        }
    }


    const handlePurchase = async () => {
        setPurchasing('short_stay')
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    packType: 'short_stay',
                    amount: 5.99
                })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('No checkout URL')
            }
        } catch (err) {
            console.error('Purchase error:', err)
            setToastMessage('Failed to start checkout. Please try again.')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 3000)
        } finally {
            setPurchasing(null)
        }
    }

    const handleGenerate = async (forPreview = false) => {
        if (forPreview) {
            setPreviewing('short_stay')
        } else {
            setGenerating('short_stay')
        }

        // Step 1: Gathering photos
        setGeneratingStep(1)

        try {
            // Minimum display time for step 1 (trust signaling)
            await new Promise(resolve => setTimeout(resolve, 500))

            // Step 2: Creating document
            setGeneratingStep(2)

            const res = await fetch('/api/pdf/short-stay', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, forPreview })
            })

            // Step 3: Finalizing
            setGeneratingStep(3)

            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.error || 'Generation failed')
            }

            const { url } = data

            if (forPreview && url) {
                setPreviewUrl(url)
                setPreviewOpen(true)
            } else if (url) {
                // Direct download
                const link = document.createElement('a')
                link.href = url
                link.download = `RentVault_Short-Stay_Report.pdf`
                link.style.display = 'none'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                setToastMessage('PDF downloaded successfully!')
                setShowToast(true)
                setTimeout(() => setShowToast(false), 3000)
            }
        } catch (err: any) {
            console.error('Generate error:', err)
            setToastMessage(err?.message || 'Failed to generate PDF')
            setShowToast(true)
            setTimeout(() => setShowToast(false), 5000)
        } finally {
            setGenerating(null)
            setPreviewing(null)
            setGeneratingStep(0)
        }
    }

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

            {/* PDF Generation Progress Modal */}
            {generatingStep > 0 && (
                <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full">
                        <h3 className="text-lg font-semibold text-center mb-6">
                            {previewing ? 'Loading Preview' : 'Generating PDF'}
                        </h3>

                        {/* Progress Steps */}
                        <div className="space-y-4">
                            {/* Step 1 */}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${generatingStep >= 1 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {generatingStep > 1 ? '✓' : '1'}
                                </div>
                                <span className={`text-sm ${generatingStep >= 1 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Gathering photos
                                </span>
                                {generatingStep === 1 && <Loader2 className="animate-spin text-green-500 ml-auto" size={18} />}
                            </div>

                            {/* Step 2 */}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${generatingStep >= 2 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {generatingStep > 2 ? '✓' : '2'}
                                </div>
                                <span className={`text-sm ${generatingStep >= 2 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Creating document
                                </span>
                                {generatingStep === 2 && <Loader2 className="animate-spin text-green-500 ml-auto" size={18} />}
                            </div>

                            {/* Step 3 */}
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${generatingStep >= 3 ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-400'
                                    }`}>
                                    {generatingStep > 3 ? '✓' : '3'}
                                </div>
                                <span className={`text-sm ${generatingStep >= 3 ? 'text-slate-900' : 'text-slate-400'}`}>
                                    Finalizing
                                </span>
                                {generatingStep === 3 && <Loader2 className="animate-spin text-green-500 ml-auto" size={18} />}
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 text-center mt-6">
                            This usually takes up to 30 seconds.
                        </p>
                    </div>
                </div>
            )}

            {/* Lightbox for photo preview */}
            <Lightbox
                images={lightboxImages}
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
            />

            {/* PDF Preview Modal */}
            {previewOpen && previewUrl && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h3 className="font-semibold">Preview: Short-Stay Evidence Report</h3>
                            <button
                                onClick={() => { setPreviewOpen(false); setPreviewUrl(null) }}
                                className="text-slate-400 hover:text-slate-600"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <iframe
                                src={previewUrl}
                                className="w-full h-full min-h-[500px]"
                                title="PDF Preview"
                            />
                        </div>
                        <div className="p-4 border-t bg-slate-50">
                            <p className="text-sm text-blue-600 text-center">
                                This is a preview with watermarks. Purchase to download the final, dispute-ready version.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Upgrade Banner - hide for admins */}
            {!canAccess && (
                <UpgradeBanner caseId={caseId} stayType={stayType} />
            )}

            {/* Admin Badge */}
            {evidence.isAdmin && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg w-fit">
                    <ShieldCheck size={18} />
                    <span className="text-sm font-medium">Admin access — full visibility</span>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION A: WALKTHROUGH VIDEOS (if recorded)
            ═══════════════════════════════════════════════════════════════ */}
            {(evidence.arrivalVideoId || evidence.departureVideoId) && canAccess && (
                <div>
                    <div className="mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">Walkthrough Videos</h2>
                        <p className="text-sm text-slate-500 mt-1">Timestamped video evidence of property condition.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Arrival Video */}
                        {evidence.arrivalVideoId && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Arrival video</h4>
                                        <p className="text-sm text-slate-500">Walkthrough recorded</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownloadVideo(evidence.arrivalVideoId!, 'arrival')}
                                    disabled={downloadingVideo === 'arrival'}
                                    className="text-sm text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {downloadingVideo === 'arrival' ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download arrival video
                                </button>
                            </div>
                        )}

                        {/* Departure Video */}
                        {evidence.departureVideoId && (
                            <div className="bg-white rounded-xl border border-slate-200 p-5">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-50 text-green-600">
                                        <Video size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-medium">Departure video</h4>
                                        <p className="text-sm text-slate-500">Walkthrough recorded</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDownloadVideo(evidence.departureVideoId!, 'departure')}
                                    disabled={downloadingVideo === 'departure'}
                                    className="text-sm text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg font-medium w-full flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                                >
                                    {downloadingVideo === 'departure' ? (
                                        <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download departure video
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                SECTION B: SHORT-STAY EVIDENCE REPORT (€5.99)
            ═══════════════════════════════════════════════════════════════ */}
            <div className="pt-8 border-t border-slate-200">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">Short-Stay Evidence Report</h2>
                    <p className="text-sm text-slate-500 mt-1">Complete evidence package for Airbnb, Booking.com, or VRBO disputes.</p>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                                    <FileText className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">Evidence Report</h3>
                                    <p className="text-slate-500">Timestamped arrival & departure photos for dispute resolution</p>
                                </div>
                            </div>
                            {/* Only show price if NOT purchased */}
                            {!canAccess && <span className="text-xl font-bold">€5.99</span>}
                        </div>

                        <p className="text-sm text-slate-600 mb-4">Includes:</p>
                        <div className="space-y-2 mb-6 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-600 flex-shrink-0" />
                                <span>Arrival photos with timestamps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-600 flex-shrink-0" />
                                <span>Departure photos with timestamps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-600 flex-shrink-0" />
                                <span>Booking details & reservation info</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Check size={16} className="text-green-600 flex-shrink-0" />
                                <span>Dispute-ready format for platforms</span>
                            </div>
                        </div>

                        {/* Action buttons */}
                        {canAccess ? (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleGenerate(true)}
                                    disabled={previewing === 'short_stay'}
                                    className="flex-1 py-3 border border-slate-200 text-slate-700 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                                >
                                    {previewing === 'short_stay' ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span className="text-sm">Loading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Eye size={20} />
                                            Preview
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleGenerate(false)}
                                    disabled={generating === 'short_stay'}
                                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    {generating === 'short_stay' ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span className="text-sm">Generating...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handlePurchase}
                                disabled={purchasing === 'short_stay'}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
                            >
                                {purchasing === 'short_stay' ? (
                                    <Loader2 className="animate-spin" size={18} />
                                ) : (
                                    <Lock size={18} />
                                )}
                                Buy & Download — €5.99
                            </button>
                        )}

                        {/* Requirements notice */}
                        {evidence.arrivalPhotos === 0 && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                                <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-amber-800">
                                    Add arrival photos first to generate the report.
                                    <Link href={`/vault/case/${caseId}/short-stay`} className="underline ml-1 font-medium">
                                        Go to Evidence →
                                    </Link>
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════
                SECTION C: STORAGE & RETENTION
            ═══════════════════════════════════════════════════════════════ */}
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
                            href={`/vault/case/${caseId}/storage`}
                            className="inline-flex items-center gap-2 text-sm text-slate-700 font-medium hover:text-slate-900"
                        >
                            View storage options <ChevronRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
