'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'

export default function AuthConfirmPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        const error = searchParams.get('error')
        const success = searchParams.get('success')

        if (error) {
            // Handle error cases with calm messages
            let friendlyMessage = error

            if (error.includes('code challenge') || error.includes('code verifier')) {
                friendlyMessage = 'This login link has already been used or was opened on a different device. Please request a new link.'
            } else if (error.includes('expired') || error.includes('invalid')) {
                friendlyMessage = 'This login link has expired. Please request a new one.'
            } else if (error.includes('Invalid Login Link')) {
                friendlyMessage = 'This link is no longer valid. Please request a new login link.'
            }

            setErrorMessage(friendlyMessage)
            setStatus('error')
            return
        }

        if (success) {
            setStatus('success')
            // Redirect after brief success state
            setTimeout(() => {
                router.push('/app')
            }, 1500)
            return
        }

        // If no params, we're still processing - redirect to app after delay
        // (in case they landed here directly)
        const timer = setTimeout(() => {
            router.push('/app')
        }, 3000)

        return () => clearTimeout(timer)
    }, [searchParams, router])

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Header with Logo */}
            <header className="p-6 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Logo size="sm" />
                </Link>
            </header>

            <main className="flex-1 flex items-center justify-center p-6 -mt-16">
                <div className="w-full max-w-[400px]">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
                        {status === 'loading' && (
                            <>
                                <div className="mb-6">
                                    <Loader2 size={48} className="animate-spin text-slate-400 mx-auto" />
                                </div>
                                <h1 className="text-xl font-semibold text-slate-900 mb-2">
                                    Signing you in…
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    Please wait while we verify your login.
                                </p>
                            </>
                        )}

                        {status === 'success' && (
                            <>
                                <div className="mb-6">
                                    <CheckCircle size={48} className="text-green-500 mx-auto" />
                                </div>
                                <h1 className="text-xl font-semibold text-slate-900 mb-2">
                                    You're signed in
                                </h1>
                                <p className="text-slate-500 text-sm">
                                    Redirecting you to your dashboard…
                                </p>
                            </>
                        )}

                        {status === 'error' && (
                            <>
                                <div className="mb-6">
                                    <AlertCircle size={48} className="text-amber-500 mx-auto" />
                                </div>
                                <h1 className="text-xl font-semibold text-slate-900 mb-2">
                                    Link no longer valid
                                </h1>
                                <p className="text-slate-500 text-sm mb-6">
                                    {errorMessage}
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-block px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors"
                                >
                                    Request new link
                                </Link>
                            </>
                        )}
                    </div>

                    {status !== 'error' && (
                        <div className="text-center mt-6">
                            <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center gap-1.5">
                                <ArrowLeft size={16} />
                                Back
                            </Link>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
