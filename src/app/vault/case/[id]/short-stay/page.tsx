'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import { Camera, Video, Check, Lock, Loader2, ArrowLeft, ArrowRight, Upload, X } from 'lucide-react'
import Link from 'next/link'

interface Asset {
    asset_id: string
    storage_path: string
    type: string
    phase: string
    created_at: string
    signedUrl?: string
}

interface CaseData {
    case_id: string
    label: string
    stay_type: string
    platform_name: string | null
    reservation_id: string | null
    check_in_date: string | null
    check_out_date: string | null
    checkin_completed_at: string | null
    handover_completed_at: string | null
    purchase_type: string | null
}

export default function ShortStayPage() {
    const params = useParams()
    const router = useRouter()
    const caseId = params.id as string
    const supabase = createClient()

    const [caseData, setCaseData] = useState<CaseData | null>(null)
    const [loading, setLoading] = useState(true)
    const [activePhase, setActivePhase] = useState<'arrival' | 'departure'>('arrival')
    const [arrivalAssets, setArrivalAssets] = useState<Asset[]>([])
    const [departureAssets, setDepartureAssets] = useState<Asset[]>([])
    const [uploading, setUploading] = useState(false)
    const [sealing, setSealing] = useState(false)
    const [hasPurchased, setHasPurchased] = useState(false)

    useEffect(() => {
        loadData()
    }, [caseId])

    async function loadData() {
        setLoading(true)

        // Fetch case data
        const { data: caseRow } = await supabase
            .from('cases')
            .select('case_id, label, stay_type, platform_name, reservation_id, check_in_date, check_out_date, checkin_completed_at, handover_completed_at, purchase_type')
            .eq('case_id', caseId)
            .single()

        if (caseRow) {
            setCaseData(caseRow)
        }

        // Check if short_stay pack purchased
        const { data: purchases } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)

        const hasPack = purchases?.some(p => p.pack_type === 'short_stay')
        setHasPurchased(hasPack || false)

        // Fetch assets for this case
        const { data: assets } = await supabase
            .from('assets')
            .select('asset_id, storage_path, type, phase, created_at')
            .eq('case_id', caseId)
            .in('type', ['checkin_photo', 'handover_photo', 'walkthrough_video'])

        if (assets) {
            // Get signed URLs
            const withUrls = await Promise.all(
                assets.map(async (asset) => {
                    const { data } = await supabase.storage
                        .from('guard-rent')
                        .createSignedUrl(asset.storage_path, 3600)
                    return { ...asset, signedUrl: data?.signedUrl }
                })
            )

            // Split by phase (using type as proxy - checkin_photo = arrival, handover_photo = departure)
            setArrivalAssets(withUrls.filter(a => a.type === 'checkin_photo' || (a.type === 'walkthrough_video' && a.phase === 'checkin')))
            setDepartureAssets(withUrls.filter(a => a.type === 'handover_photo' || (a.type === 'walkthrough_video' && a.phase === 'handover')))
        }

        setLoading(false)
    }

    async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>, phase: 'arrival' | 'departure') {
        const files = e.target.files
        if (!files?.length) return

        setUploading(true)

        for (const file of Array.from(files)) {
            const ext = file.name.split('.').pop()
            const path = `${caseData?.case_id}/${phase}_${Date.now()}.${ext}`

            const { error: uploadError } = await supabase.storage
                .from('guard-rent')
                .upload(path, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                continue
            }

            // Insert asset record
            const { data: { user } } = await supabase.auth.getUser()
            await supabase.from('assets').insert({
                case_id: caseId,
                user_id: user?.id,
                type: phase === 'arrival' ? 'checkin_photo' : 'handover_photo',
                storage_path: path,
                phase: phase === 'arrival' ? 'checkin' : 'handover',
                mime_type: file.type,
                size_bytes: file.size
            })
        }

        await loadData()
        setUploading(false)
    }

    async function handleSeal(phase: 'arrival' | 'departure') {
        if (!hasPurchased) {
            // Redirect to checkout
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ caseId, packType: 'short_stay' })
            })
            const data = await res.json()
            if (data.url) {
                window.location.href = data.url
            }
            return
        }

        setSealing(true)

        const field = phase === 'arrival' ? 'checkin_completed_at' : 'handover_completed_at'
        await supabase
            .from('cases')
            .update({ [field]: new Date().toISOString() })
            .eq('case_id', caseId)

        await loadData()
        setSealing(false)
    }

    async function handleDeleteAsset(asset: Asset) {
        await supabase.storage.from('guard-rent').remove([asset.storage_path])
        await supabase.from('assets').delete().eq('asset_id', asset.asset_id)
        await loadData()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    if (!caseData || caseData.stay_type !== 'short_stay') {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <p className="text-slate-500">This page is only available for short-stay cases.</p>
                <Link href={`/vault/case/${caseId}`} className="text-blue-600 hover:underline mt-4 inline-block">
                    Go to case overview
                </Link>
            </div>
        )
    }

    const isArrivalComplete = !!caseData.checkin_completed_at
    const isDepartureComplete = !!caseData.handover_completed_at
    const currentAssets = activePhase === 'arrival' ? arrivalAssets : departureAssets
    const isCurrentPhaseComplete = activePhase === 'arrival' ? isArrivalComplete : isDepartureComplete

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <Link href={`/vault/case/${caseId}`} className="text-slate-500 hover:text-slate-700 text-sm mb-4 inline-flex items-center gap-1">
                    <ArrowLeft className="w-4 h-4" /> Back to overview
                </Link>
                <h1 className="text-2xl font-bold">{caseData.label}</h1>
                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                    {caseData.platform_name && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{caseData.platform_name}</span>}
                    {caseData.reservation_id && <span>Ref: {caseData.reservation_id}</span>}
                </div>
            </div>

            {/* Phase Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActivePhase('arrival')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${activePhase === 'arrival'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    {isArrivalComplete && <Check className="w-4 h-4" />}
                    Arrival
                    {arrivalAssets.length > 0 && <span className="text-xs opacity-75">({arrivalAssets.length})</span>}
                </button>
                <button
                    onClick={() => setActivePhase('departure')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${activePhase === 'departure'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                >
                    {isDepartureComplete && <Check className="w-4 h-4" />}
                    Departure
                    {departureAssets.length > 0 && <span className="text-xs opacity-75">({departureAssets.length})</span>}
                </button>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="font-semibold text-lg">
                            {activePhase === 'arrival' ? 'Arrival Evidence' : 'Departure Evidence'}
                        </h2>
                        <p className="text-sm text-slate-500">
                            {activePhase === 'arrival'
                                ? 'Document the property condition when you arrive'
                                : 'Document the property condition when you leave'}
                        </p>
                    </div>
                    {isCurrentPhaseComplete && (
                        <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium bg-green-50 px-3 py-1.5 rounded-full">
                            <Lock className="w-4 h-4" /> Sealed
                        </span>
                    )}
                </div>

                {/* Photo Grid */}
                {currentAssets.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {currentAssets.map((asset) => (
                            <div key={asset.asset_id} className="relative group aspect-square rounded-lg overflow-hidden bg-slate-100">
                                {asset.signedUrl && (
                                    <img
                                        src={asset.signedUrl}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                {!isCurrentPhaseComplete && (
                                    <button
                                        onClick={() => handleDeleteAsset(asset)}
                                        className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-400">
                        <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No photos yet</p>
                    </div>
                )}

                {/* Actions */}
                {!isCurrentPhaseComplete ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <label className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(e) => handlePhotoUpload(e, activePhase)}
                                disabled={uploading}
                            />
                            {uploading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Add Photos
                                </>
                            )}
                        </label>

                        <button
                            onClick={() => handleSeal(activePhase)}
                            disabled={currentAssets.length === 0 || sealing}
                            className="flex-1 py-3 px-4 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {sealing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : hasPurchased ? (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Complete {activePhase === 'arrival' ? 'Arrival' : 'Departure'}
                                </>
                            ) : (
                                <>
                                    <Lock className="w-5 h-5" />
                                    Buy & Complete (€5.99)
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="text-center py-4 text-green-600 bg-green-50 rounded-xl">
                        <p className="font-medium">
                            {activePhase === 'arrival' ? 'Arrival' : 'Departure'} evidence sealed
                        </p>
                        <p className="text-sm text-green-500 mt-1">
                            Locked on {new Date(activePhase === 'arrival' ? caseData.checkin_completed_at! : caseData.handover_completed_at!).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>

            {/* Navigation hint */}
            {activePhase === 'arrival' && isArrivalComplete && !isDepartureComplete && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setActivePhase('departure')}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Continue to Departure <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Both complete - show export prompt */}
            {isArrivalComplete && isDepartureComplete && (
                <div className="mt-6 p-6 bg-green-50 rounded-xl text-center">
                    <Check className="w-12 h-12 mx-auto text-green-600 mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Evidence Complete!</h3>
                    <p className="text-slate-600 mb-4">Your arrival and departure evidence is sealed and ready for export.</p>
                    <Link
                        href={`/vault/case/${caseId}/exports`}
                        className="inline-flex items-center gap-2 py-3 px-6 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
                    >
                        Download Evidence Pack
                    </Link>
                </div>
            )}
        </div>
    )
}
