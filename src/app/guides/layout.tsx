import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'

export default function GuidesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white">
            <header className="border-b border-slate-100 sticky top-0 bg-white z-50">
                <div className="max-w-[800px] mx-auto px-4 md:px-6">
                    <div className="h-16 flex items-center justify-between">
                        <Link href="/" className="flex items-center">
                            <Logo size="sm" />
                        </Link>
                        <Link
                            href="/"
                            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                    </div>
                </div>
            </header>
            {children}
            <footer className="border-t border-slate-100 py-8 mt-16">
                <div className="max-w-[800px] mx-auto px-4 md:px-6 text-center text-sm text-slate-500">
                    <p>RentVault securely stores and organises your rental documents. Not legal advice.</p>
                    <div className="flex justify-center gap-6 mt-4">
                        <Link href="/privacy" className="hover:text-slate-900">Privacy</Link>
                        <Link href="/terms" className="hover:text-slate-900">Terms</Link>
                        <Link href="/pricing" className="hover:text-slate-900">Pricing</Link>
                    </div>
                </div>
            </footer>
        </div>
    )
}
