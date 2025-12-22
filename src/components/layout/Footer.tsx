import Link from 'next/link'

export function Footer() {
    return (
        <footer className="py-10 border-t border-slate-100 mt-auto bg-slate-50">
            <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                    <div className="flex flex-col items-center md:items-start gap-3">
                        <span className="text-lg font-bold text-slate-900">RentVault</span>
                        <p className="text-slate-500 text-sm text-center md:text-left">
                            © RentVault 2025 · Securely stores and organises your rental documents. Not legal advice.
                        </p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                        <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Privacy</Link>
                        <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors font-medium">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
