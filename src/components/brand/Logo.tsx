// RentVault Logo Components
// Usage: <Logo /> for standard logo, <Logo height={28} /> for explicit control

import Image from 'next/image'

interface LogoProps {
    className?: string
    height?: number | string
}

export function Logo({ className = '', height = 32 }: LogoProps) {
    // Standardize height as a string for CSS
    const h = typeof height === 'number' ? `${height}px` : height

    /**
     * PRECISION ALIGNMENT LOGIC:
     * To achieve perfect visual centering without CSS hacks (margins/transforms),
     * we wrap the logo in an SVG and "correct the viewBox".
     * 
     * Content: 192x71
     * Corrected ViewBox: 192x90 (Adds 19px of "optical padding" at the bottom)
     * When flexbox centers this 90px-relative box, the 71px content sits slightly higher,
     * perfectly matching the visual midline of the navigation text.
     */
    return (
        <svg
            viewBox="0 0 192 90"
            style={{ height: h, width: 'auto' }}
            className={`inline-block fill-none ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <image
                href="/logo.png"
                x="0"
                y="0"
                width="192"
                height="71"
            />
        </svg>
    )
}

// Alias for backwards compatibility
export function LogoText({ className = '' }: { className?: string }) {
    return <Logo className={className} />
}

export default Logo
