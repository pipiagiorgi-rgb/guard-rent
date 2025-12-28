import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaseSidebar from '@/components/layout/CaseSidebar'
import { Footer } from '@/components/layout/Footer'

// Helper to determine phase status based on evidence and completion
function getPhaseStatus(
    hasEvidence: boolean,
    completedAt: string | null
): 'not-started' | 'in-progress' | 'complete' {
    if (completedAt && hasEvidence) return 'complete'
    if (hasEvidence) return 'in-progress'
    return 'not-started'
}

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
    const { data: rentalCase, error } = await supabase
        .from('cases')
        .select('case_id, label, country, checkin_completed_at, handover_completed_at, contract_uploaded_at')
        .eq('case_id', id)
        .single()

    if (error || !rentalCase) {
        notFound()
    }

    // Count check-in photos (types: 'checkin_photo' or 'photo')
    const { count: checkinPhotoCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', id)
        .in('type', ['checkin_photo', 'photo'])

    // Count handover photos
    const { count: handoverPhotoCount } = await supabase
        .from('assets')
        .select('*', { count: 'exact', head: true })
        .eq('case_id', id)
        .eq('type', 'handover_photo')

    // Calculate case state for sidebar badges using 3-state logic
    const caseState = {
        hasContract: !!rentalCase.contract_uploaded_at,
        checkinStatus: getPhaseStatus(
            (checkinPhotoCount || 0) > 0,
            rentalCase.checkin_completed_at
        ),
        handoverStatus: getPhaseStatus(
            (handoverPhotoCount || 0) > 0,
            rentalCase.handover_completed_at
        ),
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

