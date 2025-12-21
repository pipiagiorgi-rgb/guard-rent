import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import CaseSidebar from '@/components/layout/CaseSidebar'

export default async function CaseLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { id: string }
}) {
    const supabase = await createClient()

    // Fetch case to verify access and get basic info
    const { data: rentalCase, error } = await supabase
        .from('cases')
        .select('case_id, label, country')
        .eq('case_id', params.id)
        .single()

    if (error || !rentalCase) {
        notFound()
    }

    return (
        <div className="lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">
            <CaseSidebar caseId={rentalCase.case_id} caseLabel={rentalCase.label} />
            <div className="min-w-0">
                {children}
            </div>
        </div>
    )
}
