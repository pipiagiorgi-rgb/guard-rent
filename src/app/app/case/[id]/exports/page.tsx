'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
    FileText, Camera, Download, Lock, Check,
    Loader2, Calendar, Shield, AlertCircle,
    ChevronRight, Eye, Mail, CheckCircle2
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

    useEffect(() => {
        async function load() {
            const { id } = await params
            setCaseId(id)
            await loadEvidence(id)
        }
        load()
    }, [params])

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
        } catch (err) {
            console.error('Failed to load evidence:', err)
        } finally {
            setLoading(false)
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
                    subcaption: `${type === 'checkin' ? 'Check-in' : 'Handover'} • ${new Date(a.created_at).toLocaleDateString()}`
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

    const handleGenerate = async (packType: string) => {
        setGenerating(packType)
        setLastGeneratedPdf(null) // Reset previous
        try {
            const endpoint = packType === 'checkin_pack'
                ? '/api/pdf/checkin-report'
                : '/api/pdf/deposit-pack'

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId })
            })

            if (!res.ok) throw new Error('Generation failed')
            const { url } = await res.json()
            if (url) {
                window.open(url, '_blank')
                // Track for email option (only for paid packs)
                const hasPack = packType === 'checkin_pack' ? hasCheckinPack : hasDepositPack
                if (hasPack) {
                    setLastGeneratedPdf({ type: packType, url })
                }
            }
        } catch (err) {
            console.error('Generate error:', err)
        } finally {
            setGenerating(null)
        }
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
                        <Link href={`/app/case/${caseId}/check-in`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
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
                        <Link href={`/app/case/${caseId}/handover`} className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                            Go to handover <ChevronRight size={16} />
                        </Link>
                    )}
                </div>

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
                            href={`/app/case/${caseId}/contract`}
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
                        href={`/app/case/${caseId}/deadlines`}
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
                                    <span>Contract summary</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Check size={16} className="text-green-600" />
                                    <span>12 months secure storage</span>
                                </div>
                            </div>

                            {hasCheckinPack ? (
                                <button
                                    onClick={() => handleGenerate('checkin_pack')}
                                    disabled={generating === 'checkin_pack'}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    {generating === 'checkin_pack' ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            ) : canUnlockCheckin ? (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleGenerate('checkin_pack')}
                                        disabled={generating === 'checkin_pack'}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                                    >
                                        {generating === 'checkin_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                Preview PDF (Free)
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-slate-400 text-center">
                                        Full purchase enables watermark-free downloads
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

                            {hasDepositPack ? (
                                <button
                                    onClick={() => handleGenerate('deposit_pack')}
                                    disabled={generating === 'deposit_pack'}
                                    className="w-full py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
                                >
                                    {generating === 'deposit_pack' ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <Download size={20} />
                                            Download PDF
                                        </>
                                    )}
                                </button>
                            ) : canUnlockDeposit ? (
                                <div className="space-y-2">
                                    <button
                                        onClick={() => handleGenerate('deposit_pack')}
                                        disabled={generating === 'deposit_pack'}
                                        className="w-full py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                                    >
                                        {generating === 'deposit_pack' ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>
                                                <Download size={20} />
                                                Preview PDF (Free)
                                            </>
                                        )}
                                    </button>
                                    <p className="text-xs text-slate-400 text-center">
                                        Full purchase enables watermark-free downloads
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

            {/* Secure storage note */}
            {evidence.retentionUntil && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                    <Shield className="text-green-600" size={20} />
                    <p className="text-sm text-green-800">
                        <span className="font-medium">Secure storage active</span> until {' '}
                        {new Date(evidence.retentionUntil).toLocaleDateString('en-GB', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}
                    </p>
                </div>
            )}

            {/* Disclaimer */}

        </div>
    )
}
