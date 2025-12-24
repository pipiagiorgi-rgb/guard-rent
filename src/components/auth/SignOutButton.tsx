'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { LogOut, AlertTriangle, ShoppingBag, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SignOutButtonProps {
    className?: string
}

export function SignOutButton({ className = '' }: SignOutButtonProps) {
    const [showWarning, setShowWarning] = useState(false)
    const [hasUnpaidCases, setHasUnpaidCases] = useState(false)
    const [loading, setLoading] = useState(true)
    const [signingOut, setSigningOut] = useState(false)
    const router = useRouter()

    useEffect(() => {
        async function checkUnpaidCases() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                // Get all user's cases
                const { data: cases } = await supabase
                    .from('cases')
                    .select('case_id')
                    .eq('user_id', user.id)

                if (!cases || cases.length === 0) {
                    setHasUnpaidCases(false)
                    setLoading(false)
                    return
                }

                // Check if any case has purchased packs
                const caseIds = cases.map(c => c.case_id)
                const { data: purchases } = await supabase
                    .from('purchases')
                    .select('case_id')
                    .in('case_id', caseIds)

                // If no purchases found, user has unpaid cases
                setHasUnpaidCases(!purchases || purchases.length === 0)
            } catch (err) {
                console.error('Error checking cases:', err)
            } finally {
                setLoading(false)
            }
        }

        checkUnpaidCases()
    }, [])

    const handleSignOutClick = () => {
        if (hasUnpaidCases) {
            setShowWarning(true)
        } else {
            performSignOut()
        }
    }

    const performSignOut = async () => {
        setSigningOut(true)
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/login'
        } catch (err) {
            console.error('Sign out error:', err)
            setSigningOut(false)
        }
    }

    const handleKeepData = () => {
        setShowWarning(false)
        router.push('/pricing')
    }

    return (
        <>
            <button
                type="button"
                onClick={handleSignOutClick}
                disabled={signingOut || loading}
                className={`flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors p-2 -mr-2 ${className}`}
            >
                <LogOut size={18} />
                <span className="hidden sm:inline">
                    {signingOut ? 'Signing out...' : 'Sign out'}
                </span>
            </button>

            {/* Warning Dialog */}
            {showWarning && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in duration-200 relative">
                        <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <AlertTriangle className="text-amber-600" size={24} />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-slate-900 mb-1">
                                    Your data isn't protected yet
                                </h3>
                                <p className="text-slate-600 text-sm">
                                    Without a purchase, your uploaded photos and documents will expire and be deleted automatically.
                                </p>
                            </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-slate-600">
                                <strong>To protect your data:</strong> Purchase a Check-in Pack or Deposit Recovery Pack.
                                Your evidence will then be securely stored for 12 months.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={handleKeepData}
                                className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 flex items-center justify-center gap-2"
                            >
                                <ShoppingBag size={18} />
                                View packs
                            </button>
                            <button
                                onClick={performSignOut}
                                disabled={signingOut}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 flex items-center justify-center gap-2"
                            >
                                {signingOut ? 'Signing out...' : 'Sign out anyway'}
                            </button>
                        </div>

                        <button
                            onClick={() => setShowWarning(false)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

