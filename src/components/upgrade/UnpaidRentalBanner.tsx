'use client'

import { Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface UnpaidRentalBannerProps {
    unpaidRentals: Array<{
        case_id: string
        label: string
    }>
}

export function UnpaidRentalBanner({ unpaidRentals }: UnpaidRentalBannerProps) {
    if (unpaidRentals.length === 0) {
        return null
    }

    return (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 flex-shrink-0">
                    <Shield size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-slate-900">
                        {unpaidRentals.length === 1
                            ? 'Unlock your rental'
                            : `Unlock ${unpaidRentals.length} rentals`}
                    </h3>
                    <p className="text-sm text-slate-600 mb-4">
                        Get unlimited contract questions, translations, PDF exports, and 12 months of secure storage.
                    </p>
                    <div className="space-y-2">
                        {unpaidRentals.slice(0, 3).map((rental) => (
                            <Link
                                key={rental.case_id}
                                href={`/app/case/${rental.case_id}`}
                                className="flex items-center justify-between gap-3 p-3 bg-white border border-amber-200 rounded-lg hover:border-amber-300 hover:shadow-sm transition-all group"
                            >
                                <span className="text-sm font-medium text-slate-900">{rental.label}</span>
                                <ArrowRight size={16} className="text-amber-600 group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                        ))}
                        {unpaidRentals.length > 3 && (
                            <p className="text-xs text-slate-500 pl-3">
                                + {unpaidRentals.length - 3} more rental{unpaidRentals.length - 3 > 1 ? 's' : ''}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
