import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react'
import { formatCountryWithCode } from '@/lib/countries'
import { UpgradeBanner } from '@/components/upgrade/UpgradeBanner'

// Helper to format country for display (handles custom countries)
function formatCountry(code: string | null): string {
    if (!code) return 'Not set'

    // Handle custom country entries (stored as "CUSTOM:CountryName")
    if (code.startsWith('CUSTOM:')) {
        return code.replace('CUSTOM:', '')
    }

    return formatCountryWithCode(code)
}

export default async function CaseOverviewPage({ params }: { params: { id: string } }) {
    const supabase = await createClient()

    const { data: rental } = await supabase
        .from('cases')
        .select('*')
        .eq('case_id', params.id)
        .single()

    // Graceful handling - redirect to app if rental not found
    if (!rental) {
        redirect('/app')
    }

    const hasLeaseDates = rental.lease_start || rental.lease_end

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold mb-1">{rental.label}</h1>
                <p className="text-slate-500 text-sm">Overview</p>
            </div>

            {/* Upgrade Banner */}
            <UpgradeBanner caseId={params.id} currentPack={rental.purchase_type} />

            {/* Info Cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <MapPin size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Country</span>
                    </div>
                    <p className="text-lg font-semibold">
                        {formatCountry(rental.country)}
                    </p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                            <Calendar size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Status</span>
                    </div>
                    <p className="text-lg font-semibold capitalize">{rental.status}</p>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 sm:col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600">
                            <Clock size={20} />
                        </div>
                        <span className="text-sm font-medium text-slate-500">Created</span>
                    </div>
                    <p className="text-lg font-semibold">
                        {new Date(rental.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                        })}
                    </p>
                </div>
            </div>

            {/* Lease Dates */}
            <div className="bg-white p-5 rounded-xl border border-slate-200">
                <h3 className="font-semibold mb-4">Lease Period</h3>
                {hasLeaseDates ? (
                    <div className="flex flex-wrap gap-4 md:gap-8">
                        {rental.lease_start && (
                            <div>
                                <p className="text-sm text-slate-500 mb-1">Start</p>
                                <p className="font-medium">
                                    {new Date(rental.lease_start).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                        {rental.lease_end && (
                            <div>
                                <p className="text-sm text-slate-500 mb-1">End</p>
                                <p className="font-medium">
                                    {new Date(rental.lease_end).toLocaleDateString('en-GB', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <Link
                        href={`/app/case/${params.id}/contract`}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                        <div>
                            <p className="font-medium text-slate-700">Add lease dates to track deadlines</p>
                            <p className="text-sm text-slate-500">Upload your contract or enter dates manually</p>
                        </div>
                        <ChevronRight className="text-slate-400 group-hover:text-slate-600" size={20} />
                    </Link>
                )}
            </div>

            {/* Compact footer disclaimer */}
            <p className="text-xs text-slate-400 text-center pt-4">
                RentVault securely stores and organises your rental documents. Not legal advice.
            </p>
        </div>
    )
}
