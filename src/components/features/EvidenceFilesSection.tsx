'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Video, FileText, Download, Loader2, ChevronRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface EvidenceFile {
    type: 'checkin_video' | 'handover_video' | 'contract' | 'deposit_proof'
    exists: boolean
    fileName?: string
    uploadedAt?: string
    assetId?: string
    storagePath?: string
}

interface Props {
    caseId: string
}

export function EvidenceFilesSection({ caseId }: Props) {
    const [files, setFiles] = useState<EvidenceFile[]>([])
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState<string | null>(null)
    const [issuesCount, setIssuesCount] = useState(0)

    useEffect(() => {
        loadFiles()
    }, [caseId])

    const loadFiles = async () => {
        const supabase = createClient()

        // Fetch assets for this case
        const { data: assets } = await supabase
            .from('assets')
            .select('asset_id, asset_type, file_name, storage_path, created_at')
            .eq('case_id', caseId)
            .in('asset_type', ['walkthrough_video', 'contract_pdf', 'deposit_proof'])

        // Fetch issues count
        const { count } = await supabase
            .from('issues')
            .select('*', { count: 'exact', head: true })
            .eq('case_id', caseId)

        setIssuesCount(count || 0)

        // Map to file objects
        const checkinVideo = assets?.find(a => a.asset_type === 'walkthrough_video')
        const handoverVideo = assets?.find(a => a.asset_type === 'handover_video')
        const contract = assets?.find(a => a.asset_type === 'contract_pdf')
        const depositProof = assets?.find(a => a.asset_type === 'deposit_proof')

        setFiles([
            {
                type: 'checkin_video',
                exists: !!checkinVideo,
                fileName: checkinVideo?.file_name,
                uploadedAt: checkinVideo?.created_at,
                assetId: checkinVideo?.asset_id,
                storagePath: checkinVideo?.storage_path
            },
            {
                type: 'handover_video',
                exists: !!handoverVideo,
                fileName: handoverVideo?.file_name,
                uploadedAt: handoverVideo?.created_at,
                assetId: handoverVideo?.asset_id,
                storagePath: handoverVideo?.storage_path
            },
            {
                type: 'contract',
                exists: !!contract,
                fileName: contract?.file_name,
                uploadedAt: contract?.created_at,
                assetId: contract?.asset_id,
                storagePath: contract?.storage_path
            },
            {
                type: 'deposit_proof',
                exists: !!depositProof,
                fileName: depositProof?.file_name,
                uploadedAt: depositProof?.created_at,
                assetId: depositProof?.asset_id,
                storagePath: depositProof?.storage_path
            }
        ])

        setLoading(false)
    }

    const handleDownload = async (file: EvidenceFile) => {
        if (!file.storagePath) return

        setDownloading(file.type)
        try {
            const supabase = createClient()
            const { data, error } = await supabase.storage
                .from('evidence')
                .createSignedUrl(file.storagePath, 60, { download: true })

            if (error) throw error
            if (data?.signedUrl) {
                window.location.href = data.signedUrl
            }
        } catch (err) {
            console.error('Download failed:', err)
        } finally {
            setDownloading(null)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return ''
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        })
    }

    const getFileConfig = (type: EvidenceFile['type']) => {
        switch (type) {
            case 'checkin_video':
                return {
                    label: 'Check-in video',
                    icon: Video,
                    link: `/vault/case/${caseId}/check-in`,
                    linkLabel: 'Go to check-in'
                }
            case 'handover_video':
                return {
                    label: 'Handover video',
                    icon: Video,
                    link: `/vault/case/${caseId}/handover`,
                    linkLabel: 'Go to handover'
                }
            case 'contract':
                return {
                    label: 'Contract PDF',
                    icon: FileText,
                    link: `/vault/case/${caseId}/contract`,
                    linkLabel: 'Go to contract'
                }
            case 'deposit_proof':
                return {
                    label: 'Deposit proof',
                    icon: FileText,
                    link: `/vault/case/${caseId}/check-in`,
                    linkLabel: 'Go to check-in'
                }
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {files.map(file => {
                const config = getFileConfig(file.type)
                const Icon = config.icon

                return (
                    <div
                        key={file.type}
                        className="bg-white border border-slate-200 rounded-xl p-4"
                    >
                        <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${file.exists
                                    ? 'bg-green-50 text-green-600'
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                <Icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-slate-900">{config.label}</h3>
                                <p className="text-sm text-slate-500">
                                    {file.exists
                                        ? `Uploaded · ${formatDate(file.uploadedAt)}`
                                        : 'Not uploaded yet'
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Action button */}
                        <div className="mt-3">
                            {file.exists ? (
                                <button
                                    onClick={() => handleDownload(file)}
                                    disabled={downloading === file.type}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {downloading === file.type ? (
                                        <Loader2 className="animate-spin" size={18} />
                                    ) : (
                                        <Download size={18} />
                                    )}
                                    Download {config.label.includes('video') ? 'video' : 'document'}
                                </button>
                            ) : (
                                <Link
                                    href={config.link}
                                    className="w-full py-2.5 text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1"
                                >
                                    {config.linkLabel}
                                    <ChevronRight size={16} />
                                </Link>
                            )}
                        </div>
                    </div>
                )
            })}

            {/* Issues reported card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${issuesCount > 0
                            ? 'bg-amber-50 text-amber-600'
                            : 'bg-slate-100 text-slate-400'
                        }`}>
                        <AlertTriangle size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900">Issues reported</h3>
                        <p className="text-sm text-slate-500">
                            {issuesCount > 0
                                ? `${issuesCount} issue${issuesCount > 1 ? 's' : ''} reported`
                                : 'No issues reported'
                            }
                        </p>
                    </div>
                </div>

                <div className="mt-3">
                    <Link
                        href={`/vault/case/${caseId}/issues`}
                        className="w-full py-2.5 text-blue-600 font-medium hover:text-blue-700 flex items-center justify-center gap-1"
                    >
                        Go to issues
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    )
}
