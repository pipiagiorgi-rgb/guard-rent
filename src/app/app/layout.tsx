import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* App Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link href="/app" className="flex items-center">
                            <Logo size="sm" />
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 hidden md:block">
                                {user.email}
                            </span>
                            <form action={signOut}>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors p-2 -mr-2"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden sm:inline">Sign out</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-[1200px] mx-auto px-4 md:px-6 py-6 md:py-8">
                {children}
            </main>
        </div>
    )
}
