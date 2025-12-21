import { createClient } from '@/lib/supabase/server'
import ContractScanClient from '@/components/features/ContractScanClient'
import Link from 'next/link'
import { Lock, Info } from 'lucide-react'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'

export default async function ContractPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()
    const { data: rentalCase } = await supabase
        .from('cases')
        .select('purchase_type')
        .eq('case_id', params.id)
        .single()

    // Check if user has purchased a pack
    const hasPurchasedPack = rentalCase?.purchase_type === 'checkin' ||
        rentalCase?.purchase_type === 'bundle' ||
        rentalCase?.purchase_type === 'moveout'

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">Contract</h1>
                <p className="text-slate-500">
                    Upload your rental contract. We'll extract key dates and terms to help you review it faster.
                </p>
            </div>

            {/* Upgrade Banner */}
            <UpgradeBanner caseId={params.id} currentPack={rentalCase?.purchase_type} />

            {/* Preview mode banner - only show when not purchased */}
            {!hasPurchasedPack && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm text-blue-800 font-medium">Preview mode</p>
                        <p className="text-xs text-blue-700 mt-0.5">
                            Preview features let you explore RentVault. Unlock a pack to save, protect, and reuse your data.
                        </p>
                    </div>
                </div>
            )}

            <ContractScanClient caseId={params.id} hasPurchasedPack={hasPurchasedPack} />

            {/* Compact disclaimer */}
            <p className="text-xs text-slate-400 text-center pt-4">
                RentVault securely stores and organises your rental documents. Not legal advice.
            </p>
        </div>
    )
}
