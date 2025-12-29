import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { SignOutButton } from '@/components/auth/SignOutButton'

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
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* App Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 flex-shrink-0">
                <div className="max-w-[1200px] mx-auto px-6 md:px-8">
                    <div className="h-16 flex items-center justify-between">
                        <Link href="/vault" className="flex items-center">
                            <Logo size="md" />
                        </Link>

                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 hidden md:block">
                                {user.email}
                            </span>
                            <SignOutButton />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content - grows to fill space, pushing footer down */}
            <main className="flex-1 max-w-[1200px] w-full mx-auto px-4 md:px-6 py-6 md:py-8">
                {children}
            </main>
        </div>
    )
}

