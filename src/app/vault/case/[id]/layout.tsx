import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaseSidebar from '@/components/layout/CaseSidebar'
import { Footer } from '@/components/layout/Footer'

export default async function CaseLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: Promise<{ id: string }>
}) {
    // Next.js 15 requires awaiting params
    const { id } = await params
    const supabase = await createClient()

    // Fetch case to verify access and get state for progress badges
    // Using only columns that exist in the schema
    const { data: rentalCase, error } = await supabase
        .from('cases')
        .select('case_id, label, country, checkin_completed_at, handover_completed_at, contract_uploaded_at')
        .eq('case_id', id)
        .single()

    if (error || !rentalCase) {
        notFound()
    }

    // Calculate case state for sidebar badges
    const caseState = {
        hasContract: !!rentalCase.contract_uploaded_at,
        checkinDone: !!rentalCase.checkin_completed_at,
        handoverDone: !!rentalCase.handover_completed_at,
    }

    return (
        <div className="lg:flex lg:h-[calc(100vh-72px)]">
            {/* Fixed Sidebar - Desktop */}
            <div className="lg:w-[260px] lg:flex-shrink-0 lg:overflow-y-auto lg:border-r lg:border-slate-100 lg:py-4 lg:pr-6">
                <CaseSidebar caseId={rentalCase.case_id} caseLabel={rentalCase.label} caseState={caseState} />
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 lg:overflow-y-auto">
                <div className="min-h-full flex flex-col lg:pl-8">
                    <main className="flex-1 py-2">
                        {children}
                    </main>
                    <Footer />
                </div>
            </div>
        </div>
    )
}
