'use client'


import { useState } from 'react'
import { login } from './actions'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [canRetry, setCanRetry] = useState(false)
    const searchParams = useSearchParams()
    const message = searchParams.get('message')
    const error = searchParams.get('error')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setSent(false)
        setCanRetry(false)

        const formData = new FormData(e.currentTarget)

        try {
            await login(formData)
            // If we get here, it was successful
            setLoading(false)
            setSent(true)

            // Start timer for retry option
            setTimeout(() => {
                setCanRetry(true)
            }, 15000) // 15 seconds
        } catch (err) {
            // Error will be shown via redirect usually, but safe to reset if needed
            setLoading(false)
        }
    }

    // Reset handler for "Send again"
    const handleRetry = () => {
        setSent(false)
        setCanRetry(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[400px]">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2 text-slate-900">Sign in to RentVault</h1>
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
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-slate-900 transition-colors outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || sent}
                                className={`
                                    w-full py-4 rounded-xl font-semibold text-base transition-all min-h-[56px] flex items-center justify-center
                                    ${loading
                                        ? 'bg-slate-700 text-white cursor-wait'
                                        : sent
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default'
                                            : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] active:bg-slate-950 shadow-md hover:shadow-lg'
                                    }
                                `}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={20} />
                                        Sending...
                                    </span>
                                ) : sent ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <CheckCircle2 size={20} />
                                        Email sent
                                    </span>
                                ) : (
                                    'Send login link'
                                )}
                            </button>

                            {/* Success Message Area */}
                            {sent && (
                                <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <p className="text-slate-600">
                                        Check your inbox for the secure login link.
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        Click the link to sign in on this browser. You'll stay logged in for 7 days.
                                    </p>
                                </div>
                            )}

                            {/* Error Messages */}
                            {message && !sent && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm text-center">
                                    {message}
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center flex items-center justify-center gap-2">
                                    {error}
                                </div>
                            )}
                        </form>

                        <p className="text-sm text-slate-500 text-center mt-6">
                            Passwordless login. No password to remember.
                        </p>

                        {/* Retry Option (Delayed) */}
                        {sent && canRetry && (
                            <div className="mt-6 pt-6 border-t border-slate-100 text-center animate-in fade-in duration-500">
                                <p className="text-sm text-slate-500 mb-2">Didn't receive it?</p>
                                <button
                                    onClick={handleRetry}
                                    className="text-sm font-medium text-slate-900 hover:text-slate-700 underline underline-offset-4"
                                >
                                    Send again
                                </button>
                            </div>
                        )}

                        {/* Immediate Help (Pre-retry) */}
                        {sent && !canRetry && (
                            <div className="mt-8 text-center">
                                <p className="text-xs text-slate-400">
                                    Taking too long? Check your spam folder.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
