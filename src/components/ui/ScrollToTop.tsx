'use client'

import { useState, useEffect } from 'react'
import { ChevronUp } from 'lucide-react'

/**
 * ScrollToTop - Floating button that appears when user scrolls down
 * Shows on mobile/tablet only (hidden on desktop)
 */
export function ScrollToTop() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Show button after scrolling 300px
            setVisible(window.scrollY > 300)
        }

        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        })
    }

    if (!visible) return null

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="
                fixed bottom-20 right-4 z-50
                w-12 h-12 rounded-full
                bg-slate-900 text-white
                shadow-lg shadow-slate-900/20
                flex items-center justify-center
                transition-all duration-300
                hover:bg-slate-800 hover:scale-105
                active:scale-95
                md:hidden
            "
        >
            <ChevronUp size={24} />
        </button>
    )
}
