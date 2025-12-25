import Link from 'next/link'

export function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200/60 bg-gradient-to-b from-slate-50 to-white">
            <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                <div className="py-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-500 text-[13px] text-center md:text-left leading-relaxed">
                        © RentVault 2025 · Securely stores and organises your rental documents. Uses automated assistance. Not legal advice.
                    </p>
                    <div className="flex items-center gap-6 text-[13px]">
                        <Link
                            href="/privacy"
                            className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
                        >
                            Privacy
                        </Link>
                        <Link
                            href="/terms"
                            className="text-slate-500 hover:text-slate-900 transition-colors font-medium"
                        >
                            Terms
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
