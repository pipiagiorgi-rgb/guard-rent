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

    return (
        <div
            className={`relative inline-block ${className}`}
            style={{ height: h, aspectRatio: '192/71' }}
        >
            <Image
                src="/logo.png"
                alt="RentVault"
                fill
                priority
                className="object-contain"
                sizes="(max-width: 768px) 140px, 150px"
            />
        </div>
    )
}

// Alias for backwards compatibility
export function LogoText({ className = '' }: { className?: string }) {
    return <Logo className={className} />
}

export default Logo
