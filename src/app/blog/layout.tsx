import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Footer } from '@/components/layout/Footer'

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-white">
            {/* Sticky back button */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-[800px] mx-auto px-4 md:px-6">
                    <div className="h-14 flex items-center">
                        <Link
                            href="/"
                            className="text-sm text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-medium transition-colors"
                        >
                            <ArrowLeft size={16} />
                            Home
                        </Link>
                    </div>
                </div>
            </div>
            {children}
            <Footer />
        </div>
    )
}
