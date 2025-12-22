import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import { formatCountryWithCode } from '@/lib/countries'
import { UnpaidRentalBanner } from '@/components/upgrade/UnpaidRentalBanner'
import { Footer } from '@/components/layout/Footer'

// Helper to format country for display (handles custom countries)
function formatCountry(code: string | null): string {
    if (!code) return 'Country not set'

    // Handle custom country entries (stored as "CUSTOM:CountryName")
    if (code.startsWith('CUSTOM:')) {
        return code.replace('CUSTOM:', '')
    }

    return formatCountryWithCode(code)
}

export default async function MyRentalsPage() {
    const supabase = await createClient()
    const { data: rentals } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false })

    // Filter unpaid rentals
    const unpaidRentals = rentals?.filter(r => !r.purchase_type).map(r => ({
        case_id: r.case_id,
        label: r.label
    })) || []

    return (
        <div>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <h1 className="text-2xl font-bold">My Rentals</h1>
                    <p className="text-slate-600 text-sm mt-1">Create and manage your rentals.</p>
                </div>
                <Link
                    href="/app/new"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors sm:w-auto w-full"
                >
                    <Plus size={18} />
                    New rental
                </Link>
            </div>

            {/* Unpaid Rentals Banner */}
            <UnpaidRentalBanner unpaidRentals={unpaidRentals} />

            {/* Rentals List */}
            {!rentals || rentals.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 md:p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Plus className="text-slate-400" size={32} />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No rentals yet</h3>
                    <p className="text-slate-600 mb-6 max-w-sm mx-auto">
                        Create a rental to store your contract, photos, and key dates in one place.
                    </p>
                    <Link
                        href="/app/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                    >
                        Create your first rental
                    </Link>
                </div>
            ) : (
                <div className="space-y-3">
                    {rentals.map((rental: any) => (
                        <Link key={rental.case_id} href={`/app/case/${rental.case_id}`} className="block group">
                            <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 hover:border-slate-300 hover:shadow-sm transition-all flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <h3 className="font-semibold text-lg truncate">{rental.label}</h3>
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${rental.status === 'active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {rental.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-sm">
                                        {formatCountry(rental.country)} · <span className="text-slate-400">Created {new Date(rental.created_at).toLocaleDateString()}</span>
                                    </p>
                                </div>
                                <ChevronRight className="text-slate-400 group-hover:text-slate-600 transition-colors flex-shrink-0" size={20} />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    )
}
