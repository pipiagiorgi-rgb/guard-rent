'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/brand/Logo';

export default function NavbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Don't show navbar on app routes (they have their own layout)
    if (pathname?.startsWith('/app')) return null;
    // Don't show navbar on guides pages (they have their own custom header)
    if (pathname?.startsWith('/guides')) return null;
    // Don't show navbar on login page
    if (pathname === '/login') return null;

    return (
        <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
            <div className="max-w-[1120px] mx-auto px-6 md:px-8">
                <div className="h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center">
                        <Logo size="lg" />
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link
                            href="/pricing"
                            className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                        >
                            Pricing
                        </Link>

                        {isLoggedIn ? (
                            <Link
                                href="/app"
                                className="text-[15px] font-medium bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                            >
                                Go to app
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/login"
                                    className="text-[15px] font-medium bg-slate-900 text-white px-6 py-2.5 rounded-lg hover:bg-slate-800 transition-colors"
                                >
                                    Get started
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 -mr-2 text-slate-600"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-3">
                    <Link
                        href="/pricing"
                        className="block py-2 text-slate-600 font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        Pricing
                    </Link>

                    {isLoggedIn ? (
                        <Link
                            href="/app"
                            className="block w-full text-center py-3 bg-slate-900 text-white rounded-lg font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Go to app
                        </Link>
                    ) : (
                        <>
                            <Link
                                href="/login"
                                className="block py-2 text-slate-600 font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Log in
                            </Link>
                            <Link
                                href="/login"
                                className="block w-full text-center py-3 bg-slate-900 text-white rounded-lg font-medium"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Get started
                            </Link>
                        </>
                    )}
                </div>
            )}
        </header>
    );
}
