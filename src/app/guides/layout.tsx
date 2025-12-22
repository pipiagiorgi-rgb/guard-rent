import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Footer } from '@/components/layout/Footer'

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
                            <Logo height={40} />
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
            <Footer />
        </div>
    )
}
