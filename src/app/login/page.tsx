'use client'

import { useState } from 'react'
import { login } from './actions'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setSent(false)

        const formData = new FormData(e.currentTarget)

        try {
            await login(formData)
            // If we get here, it was successful
            setSent(true)
        } catch (err) {
            // Error will be shown via redirect
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[400px]">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">Sign in to RentVault</h1>
                            <p className="text-slate-600">
                                Enter your email and we'll send you a secure login link.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    disabled={loading || sent}
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-slate-900 transition-colors outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || sent}
                                className={`
                                    w-full py-4 rounded-xl font-semibold text-base transition-all
                                    ${loading
                                        ? 'bg-slate-700 text-white cursor-wait'
                                        : sent
                                            ? 'bg-green-600 text-white cursor-default'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] active:bg-slate-950'
                                    }
                                    disabled:opacity-90
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Sending...
                                    </span>
                                ) : sent ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 size={18} />
                                        Email sent!
                                    </span>
                                ) : (
                                    'Send login link'
                                )}
                            </button>

                            {(message || sent) && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm text-center">
                                    {sent ? 'Check your email for the login link!' : message}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center">
                                    {error}
                                </div>
                            )}
                        </form>

                        <p className="text-sm text-slate-500 text-center mt-6">
                            Passwordless login. No password to remember.
                        </p>

                        {sent && (
                            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                <p className="font-medium mb-1">Not receiving emails?</p>
                                <p>Check your spam folder or contact support.</p>
                            </div>
                        )}
                    </div>

                    {/* Back link */}
                    <div className="text-center mt-8">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
