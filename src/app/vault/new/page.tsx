'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllCountryOptions } from '@/lib/countries'
import { Home, Plane } from 'lucide-react'

type StayType = 'long_term' | 'short_stay' | null

export default function NewCasePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [stayType, setStayType] = useState<StayType>(null)
    const [selectedCountry, setSelectedCountry] = useState('')
    const [customCountry, setCustomCountry] = useState('')

    // Short-stay specific fields
    const [platformName, setPlatformName] = useState('')
    const [reservationId, setReservationId] = useState('')
    const [checkInDate, setCheckInDate] = useState('')
    const [checkOutDate, setCheckOutDate] = useState('')

    const countryOptions = getAllCountryOptions()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        let label = formData.get('label') as string
        const leaseStart = formData.get('lease_start') as string
        const leaseEnd = formData.get('lease_end') as string

        // Determine final country value
        const country = selectedCountry === 'OTHER' && customCountry.trim()
            ? `CUSTOM:${customCountry.trim()}`
            : selectedCountry

        // Validation: minimum 3 chars, at least one letter
        if (!label || label.length < 3 || !/[a-zA-Z]/.test(label)) {
            label = stayType === 'short_stay' ? 'Short stay' : 'New rental'
        }

        try {
            const res = await fetch('/api/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label,
                    country,
                    stay_type: stayType,
                    // Long-term fields
                    lease_start: stayType === 'long_term' ? leaseStart || null : null,
                    lease_end: stayType === 'long_term' ? leaseEnd || null : null,
                    // Short-stay fields
                    platform_name: stayType === 'short_stay' ? platformName || null : null,
                    reservation_id: stayType === 'short_stay' ? reservationId || null : null,
                    check_in_date: stayType === 'short_stay' ? checkInDate || null : null,
                    check_out_date: stayType === 'short_stay' ? checkOutDate || null : null
                }),
            })

            if (res.ok) {
                const data = await res.json()
                router.push(`/vault/case/${data.case_id}`)
            } else {
                alert('Failed to create rental')
            }
        } catch (error) {
            console.error(error)
            alert('Error creating rental')
        } finally {
            setLoading(false)
        }
    }

    // Step 1: Choose stay type
    if (!stayType) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold mb-2">What are you documenting?</h1>
                    <p className="text-slate-600">
                        Choose the type of stay to get the right tools.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Long-term rental card - PRIMARY PATH */}
                    <button
                        onClick={() => setStayType('long_term')}
                        className="p-6 bg-white rounded-xl border-2 border-slate-300 hover:border-slate-900 hover:shadow-lg hover:-translate-y-1 transition-all text-left group relative"
                    >
                        {/* Most common badge */}
                        <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 bg-slate-900 text-white text-xs font-medium rounded-full">
                            Most common
                        </span>
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
                            <Home className="w-6 h-6 text-amber-700" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Long-Term Rental</h3>
                        <p className="text-slate-600 text-sm mb-3">
                            Full lease cycle: Move-in → Move-out
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-1 bg-slate-100 rounded">€19-39</span>
                            <span>12 months storage</span>
                        </div>
                        {/* Hover arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-slate-400 text-sm">Continue →</span>
                        </div>
                    </button>

                    {/* Short-stay card */}
                    <button
                        onClick={() => setStayType('short_stay')}
                        className="p-6 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:shadow-lg hover:-translate-y-1 transition-all text-left group relative"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                            <Plane className="w-6 h-6 text-blue-700" />
                        </div>
                        <h3 className="font-semibold text-lg mb-1">Short Stay</h3>
                        <p className="text-slate-600 text-sm mb-1">
                            Airbnb, Booking, vacation rentals
                        </p>
                        {/* Clarification for guests */}
                        <p className="text-slate-400 text-xs mb-3">
                            For guests documenting arrival & departure condition
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-1 bg-blue-100 rounded text-blue-700 font-medium">€5.99</span>
                            <span>30 days after checkout</span>
                        </div>
                        {/* Hover arrow */}
                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-slate-400 text-sm">Continue →</span>
                        </div>
                    </button>
                </div>

                {/* Reassurance footer */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    You can't break anything—this just sets up the right workflow.
                </p>

                <div className="mt-6">
                    <Link
                        href="/vault"
                        className="text-slate-500 hover:text-slate-700 text-sm"
                    >
                        ← Back to all rentals
                    </Link>
                </div>
            </div>
        )
    }

    // Step 2: Details form
    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => setStayType(null)}
                    className="text-slate-500 hover:text-slate-700 text-sm mb-4 flex items-center gap-1"
                >
                    ← Change type
                </button>
                <h1 className="text-2xl font-bold mb-2">
                    {stayType === 'short_stay' ? 'Create a short stay' : 'Create a rental'}
                </h1>
                <p className="text-slate-600">
                    {stayType === 'short_stay'
                        ? 'Document your Airbnb, Booking, or vacation rental.'
                        : 'This rental keeps your documents and evidence together.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-slate-700 mb-2">
                            {stayType === 'short_stay' ? 'Property name' : 'Rental name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="label"
                            name="label"
                            placeholder={stayType === 'short_stay' ? 'e.g. Barcelona Apartment' : 'e.g. Rue de Rivoli apartment'}
                            className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="country" className="block text-sm font-medium text-slate-700 mb-2">
                            Country <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="country"
                            name="country"
                            value={selectedCountry}
                            onChange={(e) => setSelectedCountry(e.target.value)}
                            className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none bg-white"
                            required
                        >
                            <option value="">Select country</option>
                            {countryOptions.map((country) => (
                                <option key={country.code} value={country.code}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Custom country input when "Other" is selected */}
                    {selectedCountry === 'OTHER' && (
                        <div>
                            <label htmlFor="custom_country" className="block text-sm font-medium text-slate-700 mb-2">
                                Enter country name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="custom_country"
                                name="custom_country"
                                value={customCountry}
                                onChange={(e) => setCustomCountry(e.target.value)}
                                placeholder="e.g. Morocco"
                                className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                required={selectedCountry === 'OTHER'}
                            />
                        </div>
                    )}

                    {/* SHORT-STAY SPECIFIC FIELDS */}
                    {stayType === 'short_stay' && (
                        <>
                            <div>
                                <label htmlFor="platform" className="block text-sm font-medium text-slate-700 mb-2">
                                    Platform <span className="text-slate-400">(optional)</span>
                                </label>
                                <select
                                    id="platform"
                                    value={platformName}
                                    onChange={(e) => setPlatformName(e.target.value)}
                                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none bg-white"
                                >
                                    <option value="">Select platform</option>
                                    <option value="Airbnb">Airbnb</option>
                                    <option value="Booking">Booking.com</option>
                                    <option value="VRBO">VRBO</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="reservation_id" className="block text-sm font-medium text-slate-700 mb-2">
                                    Reservation ID <span className="text-slate-400">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    id="reservation_id"
                                    value={reservationId}
                                    onChange={(e) => setReservationId(e.target.value)}
                                    placeholder="e.g. HMA1234567"
                                    className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="check_in_date" className="block text-sm font-medium text-slate-700 mb-2">
                                        Check-in date
                                    </label>
                                    <input
                                        type="date"
                                        id="check_in_date"
                                        value={checkInDate}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="check_out_date" className="block text-sm font-medium text-slate-700 mb-2">
                                        Check-out date
                                    </label>
                                    <input
                                        type="date"
                                        id="check_out_date"
                                        value={checkOutDate}
                                        onChange={(e) => setCheckOutDate(e.target.value)}
                                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* LONG-TERM SPECIFIC FIELDS */}
                    {stayType === 'long_term' && (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="lease_start" className="block text-sm font-medium text-slate-700 mb-2">
                                        Lease start <span className="text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="lease_start"
                                        name="lease_start"
                                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lease_end" className="block text-sm font-medium text-slate-700 mb-2">
                                        Lease end <span className="text-slate-400">(optional)</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="lease_end"
                                        name="lease_end"
                                        className="w-full p-3.5 rounded-xl border-2 border-slate-200 focus:border-slate-900 transition-colors outline-none"
                                    />
                                </div>
                            </div>

                            <p className="text-sm text-slate-500">
                                You can fill this now, or upload your contract to extract dates automatically.
                            </p>
                        </>
                    )}
                </div>

                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={() => setStayType(null)}
                        className="flex-1 py-3.5 text-center border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading || (selectedCountry === 'OTHER' && !customCountry.trim())}
                        className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : stayType === 'short_stay' ? 'Create short stay' : 'Create rental'}
                    </button>
                </div>
            </form>
        </div>
    )
}
