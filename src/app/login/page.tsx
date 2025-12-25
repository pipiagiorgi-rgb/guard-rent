'use client'

import { useState } from 'react'
import { Loader2, Mail, ArrowLeft } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Footer } from '@/components/layout/Footer'

export default function LoginPage() {
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')
    const [code, setCode] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [canRetry, setCanRetry] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()
    const urlError = searchParams.get('error')

    const handleSendCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setCanRetry(false)

        const formData = new FormData(e.currentTarget)
        const emailValue = formData.get('email') as string
        setEmail(emailValue)

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: emailValue })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to send code')
                setLoading(false)
                return
            }

            // Success - move to code entry step
            setStep('code')
            setLoading(false)

            // Start timer for retry option
            setTimeout(() => {
                setCanRetry(true)
            }, 30000) // 30 seconds
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    const handleVerifyCode = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/otp/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Invalid code')
                setLoading(false)
                return
            }

            // Success - redirect to the magic link which will complete auth
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl
            } else {
                router.push('/vault')
            }
        } catch (err) {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        setLoading(true)
        setError(null)
        setCode('')
        setCanRetry(false)

        try {
            const res = await fetch('/api/auth/otp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to resend code')
            }

            // Start timer for retry
            setTimeout(() => {
                setCanRetry(true)
            }, 30000)
        } catch (err) {
            setError('Could not resend code')
        } finally {
            setLoading(false)
        }
    }

    const handleBack = () => {
        setStep('email')
        setCode('')
        setError(null)
        setCanRetry(false)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[400px]">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">

                        {/* Step 1: Email Entry */}
                        {step === 'email' && (
                            <>
                                <div className="text-center mb-8">
                                    <h1 className="text-2xl font-bold mb-2 text-slate-900">Sign in to RentVault</h1>
                                    <p className="text-slate-600">
                                        Enter your email and we'll send you a 6-digit code.
                                    </p>
                                </div>

                                <form onSubmit={handleSendCode} className="space-y-4">
                                    <div>
                                        <label htmlFor="email" className="sr-only">Email address</label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="you@example.com"
                                            required
                                            autoComplete="email"
                                            disabled={loading}
                                            className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-slate-900 transition-colors outline-none text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 text-slate-900 placeholder:text-slate-400"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`
                                            w-full py-4 rounded-xl font-semibold text-base transition-all min-h-[56px] flex items-center justify-center
                                            ${loading
                                                ? 'bg-slate-700 text-white cursor-wait'
                                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] active:bg-slate-950 shadow-md hover:shadow-lg'
                                            }
                                        `}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={20} />
                                                Sending code...
                                            </span>
                                        ) : (
                                            'Send verification code'
                                        )}
                                    </button>

                                    {/* Error Messages */}
                                    {(error || urlError) && (
                                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center">
                                            {error || urlError}
                                        </div>
                                    )}
                                </form>

                                <p className="text-sm text-slate-500 text-center mt-6">
                                    Passwordless login. No password to remember.
                                </p>

                                {/* 24h session benefit */}
                                <p className="text-xs text-slate-400 text-center mt-3">
                                    You'll stay signed in for 24 hours — convenient for documenting your move-in day.
                                </p>

                                {/* Back to home */}
                                <a
                                    href="https://rentvault.ai"
                                    className="block text-sm text-slate-400 text-center mt-4 hover:text-slate-600 transition-colors"
                                >
                                    ← Back to RentVault home
                                </a>
                            </>
                        )}

                        {/* Step 2: Code Entry */}
                        {step === 'code' && (
                            <>
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Mail className="text-emerald-600" size={28} />
                                    </div>
                                    <h1 className="text-2xl font-bold mb-2 text-slate-900">Check your email</h1>
                                    <p className="text-slate-600">
                                        We sent a 6-digit code to
                                    </p>
                                    <p className="font-medium text-slate-900 mt-1">{email}</p>
                                </div>

                                <form onSubmit={handleVerifyCode} className="space-y-4">
                                    <div>
                                        <label htmlFor="code" className="sr-only">Verification code</label>
                                        <input
                                            id="code"
                                            name="code"
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            maxLength={6}
                                            placeholder="000000"
                                            required
                                            autoComplete="one-time-code"
                                            autoFocus
                                            value={code}
                                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                                            disabled={loading}
                                            className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-slate-900 transition-colors outline-none text-2xl text-center font-mono tracking-[0.5em] disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 text-slate-900 placeholder:text-slate-300"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || code.length !== 6}
                                        className={`
                                            w-full py-4 rounded-xl font-semibold text-base transition-all min-h-[56px] flex items-center justify-center
                                            ${loading
                                                ? 'bg-slate-700 text-white cursor-wait'
                                                : code.length === 6
                                                    ? 'bg-slate-900 text-white hover:bg-slate-800 active:scale-[0.98] active:bg-slate-950 shadow-md hover:shadow-lg'
                                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {loading ? (
                                            <span className="flex items-center justify-center gap-2">
                                                <Loader2 className="animate-spin" size={20} />
                                                Verifying...
                                            </span>
                                        ) : (
                                            'Verify and sign in'
                                        )}
                                    </button>

                                    {/* Error Messages */}
                                    {error && (
                                        <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center">
                                            {error}
                                        </div>
                                    )}
                                </form>

                                {/* Retry / Back Options */}
                                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                                    {canRetry && (
                                        <button
                                            onClick={handleResendCode}
                                            disabled={loading}
                                            className="w-full text-sm font-medium text-slate-900 hover:text-slate-700 py-2"
                                        >
                                            Didn't receive it? Send again
                                        </button>
                                    )}

                                    <button
                                        onClick={handleBack}
                                        disabled={loading}
                                        className="w-full flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700 py-2"
                                    >
                                        <ArrowLeft size={14} />
                                        Use a different email
                                    </button>
                                </div>

                                {/* Help text */}
                                {!canRetry && (
                                    <p className="text-xs text-slate-400 text-center mt-4">
                                        Can't find it? Check your spam folder.
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
