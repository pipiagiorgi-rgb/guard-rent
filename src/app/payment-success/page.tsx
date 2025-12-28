'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react'
import { Suspense } from 'react'

function PaymentSuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const caseId = searchParams.get('case')
    const pack = searchParams.get('pack')

    useEffect(() => {
        // Redirect to vault after 3 seconds
        const timer = setTimeout(() => {
            if (caseId) {
                router.push(`/vault/case/${caseId}`)
            } else {
                router.push('/vault')
            }
        }, 3000)

        return () => clearTimeout(timer)
    }, [caseId, router])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="text-center px-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-900 mb-3">Payment Successful!</h1>
                <p className="text-lg text-slate-600 mb-2">
                    Thank you for your purchase{pack ? ` of the ${pack} Pack` : ''}.
                </p>
                <p className="text-sm text-slate-500 mb-8">
                    Redirecting you to your vault...
                </p>
                <div className="animate-pulse">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
            </div>
        </div>
    )
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    )
}
