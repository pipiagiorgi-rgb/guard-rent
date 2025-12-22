'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { getAllCountryOptions } from '@/lib/countries'

export default function NewCasePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [selectedCountry, setSelectedCountry] = useState('')
    const [customCountry, setCustomCountry] = useState('')

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
            label = 'New rental'
        }

        try {
            const res = await fetch('/api/cases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    label,
                    country,
                    lease_start: leaseStart || null,
                    lease_end: leaseEnd || null
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

    return (
        <div className="max-w-lg mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold mb-2">Create a rental</h1>
                <p className="text-slate-600">
                    This rental keeps your documents and evidence together.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-5">
                    <div>
                        <label htmlFor="label" className="block text-sm font-medium text-slate-700 mb-2">
                            Rental name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="label"
                            name="label"
                            placeholder="e.g. Rue de Rivoli apartment"
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
                </div>

                <div className="flex gap-3">
                    <Link
                        href="/vault"
                        className="flex-1 py-3.5 text-center border-2 border-slate-200 rounded-xl font-medium hover:bg-slate-50 transition-colors"
                    >
                        Back
                    </Link>
                    <button
                        type="submit"
                        disabled={loading || (selectedCountry === 'OTHER' && !customCountry.trim())}
                        className="flex-1 py-3.5 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create rental'}
                    </button>
                </div>
            </form>
        </div>
    )
}
