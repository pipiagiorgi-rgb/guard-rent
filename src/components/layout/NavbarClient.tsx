'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BookOpen, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Logo } from '@/components/brand/Logo';

export default function NavbarClient({ isLoggedIn }: { isLoggedIn: boolean }) {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (mobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mobileMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    // Don't show navbar on app routes (they have their own layout)
    if (pathname?.startsWith('/vault')) return null;
    // Don't show navbar on guides pages (they have their own custom header)
    if (pathname?.startsWith('/guides')) return null;
    // Don't show navbar on login page
    if (pathname === '/login') return null;

    const handleNavClick = () => {
        setMobileMenuOpen(false);
    };

    return (
        <>
            {/* Header: sticky on all screen sizes */}
            <header className="sticky top-0 z-50 bg-white border-b border-slate-100">
                <div className="max-w-[1120px] mx-auto px-5 md:px-8">
                    {/* Fixed-height flex container - matches guides layout */}
                    <div className="h-16 flex items-center justify-between">
                        {/* Logo wrapper - uses canonical size="md" */}
                        <Link href="/" className="h-full flex items-center flex-shrink-0">
                            <Logo size="md" />
                        </Link>

                        {/* Desktop Nav - right aligned */}
                        <nav className="hidden md:flex items-center gap-6 h-full">
                            <Link
                                href="/pricing"
                                className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
                            >
                                Pricing
                            </Link>
                            <Link
                                href="/blog"
                                className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
                            >
                                Blog
                            </Link>

                            {isLoggedIn ? (
                                <Link
                                    href="/vault"
                                    className="text-[15px] font-medium bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors leading-none"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="text-[15px] font-medium text-slate-600 hover:text-slate-900 transition-colors leading-none"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href="/login"
                                        className="text-[15px] font-medium bg-slate-900 text-white px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors leading-none"
                                    >
                                        Start now
                                    </Link>
                                </>
                            )}
                        </nav>

                        {/* Mobile Menu Button */}
                        <div className="md:hidden flex items-center h-full">
                            <button
                                className="flex items-center justify-center h-10 w-10 -mr-2 text-slate-700"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu size={26} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════════
                MOBILE MENU - COMPLETE, PREMIUM, TRUST-FIRST
            ═══════════════════════════════════════════════════════════════ */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 z-[100] md:hidden"
                    role="dialog"
                    aria-modal="true"
                >
                    {/* Dimmed backdrop overlay - tap to close */}
                    <div
                        className="absolute inset-0 bg-black/20 animate-in fade-in duration-200"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    {/* Menu panel - slides in from right */}
                    <div className="absolute inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl animate-in slide-in-from-right duration-300 ease-out flex flex-col">

                        {/* ────────────────────────────────────────────────────
                            HEADER: Logo + Close (matches guides layout exactly)
                        ──────────────────────────────────────────────────── */}
                        <div className="flex-shrink-0 px-5 h-16 flex items-center justify-between border-b border-slate-100">
                            <Link
                                href="/"
                                onClick={handleNavClick}
                                className="h-full flex items-center"
                            >
                                <Logo size="md" />
                            </Link>
                            <button
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-center h-10 w-10 -mr-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                                aria-label="Close menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* ────────────────────────────────────────────────────
                            PRIMARY NAVIGATION
                        ──────────────────────────────────────────────────── */}
                        <div className="flex-1 px-5 py-6 overflow-y-auto">
                            <nav className="space-y-1">
                                <Link
                                    href="/pricing"
                                    onClick={handleNavClick}
                                    className="block py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                                >
                                    Pricing
                                </Link>

                                {isLoggedIn ? (
                                    <Link
                                        href="/vault"
                                        onClick={handleNavClick}
                                        className="block py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={handleNavClick}
                                        className="block py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                                    >
                                        Log in
                                    </Link>
                                )}

                                {/* Guides link */}
                                <Link
                                    href="/guides"
                                    onClick={handleNavClick}
                                    className="flex items-center gap-3 py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                                >
                                    <BookOpen size={20} className="text-slate-400" />
                                    Guides
                                </Link>

                                {/* Blog link */}
                                <Link
                                    href="/blog"
                                    onClick={handleNavClick}
                                    className="flex items-center gap-3 py-4 text-lg font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 -mx-3 px-3 rounded-lg transition-colors"
                                >
                                    <FileText size={20} className="text-slate-400" />
                                    Blog
                                </Link>
                            </nav>
                        </div>

                        {/* ────────────────────────────────────────────────────
                            CTA + TRUST LINKS (Sticky Bottom)
                        ──────────────────────────────────────────────────── */}
                        <div className="flex-shrink-0 px-5 py-6 border-t border-slate-100 bg-white">
                            {/* Primary CTA */}
                            {isLoggedIn ? (
                                <Link
                                    href="/vault"
                                    onClick={handleNavClick}
                                    className="block w-full text-center py-4 bg-slate-900 text-white rounded-xl text-[17px] font-semibold hover:bg-slate-800 transition-colors"
                                >
                                    Go to Dashboard
                                </Link>
                            ) : (
                                <div>
                                    <Link
                                        href="/login"
                                        onClick={handleNavClick}
                                        className="block w-full text-center py-4 bg-slate-900 text-white rounded-xl text-[17px] font-semibold hover:bg-slate-800 transition-colors"
                                    >
                                        Start now
                                    </Link>
                                    {/* CTA Subtext */}
                                    <p className="text-center text-sm text-slate-500 mt-3">
                                        Free to explore. No credit card required.
                                    </p>
                                </div>
                            )}

                            {/* Trust/Legal Links */}
                            <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
                                <Link
                                    href="/privacy"
                                    onClick={handleNavClick}
                                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Privacy Policy
                                </Link>
                                <span className="text-slate-300">·</span>
                                <Link
                                    href="/terms"
                                    onClick={handleNavClick}
                                    className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Terms of Service
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
