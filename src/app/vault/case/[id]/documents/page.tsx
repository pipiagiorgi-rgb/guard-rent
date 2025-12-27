'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import { RelatedContractsSection } from '@/components/features/RelatedContractsSection'

interface DocumentsPageProps {
    params: { id: string }
}

function DocumentsContent({ caseId }: { caseId: string }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">Document Vault</h1>
                <p className="text-slate-500">
                    Private storage for rental-related documents. You can download or delete files anytime.
                </p>
            </div>

            {/* Trust microcopy */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <p className="text-sm text-slate-600">
                    These documents are not sealed evidence. They are stored privately and remain under your control.
                </p>
            </div>

            {/* Document Vault Section - reuses RelatedContractsSection component */}
            <RelatedContractsSection caseId={caseId} />
        </div>
    )
}

export default function DocumentsPage({ params }: DocumentsPageProps) {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
        }>
            <DocumentsContent caseId={params.id} />
        </Suspense>
    )
}
