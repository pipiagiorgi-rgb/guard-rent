// RentVault Logo Components
// Usage: <Logo /> for standard logo, <Logo height={28} /> for explicit control

import Image from 'next/image'

interface LogoProps {
    className?: string
    height?: number
    size?: 'sm' | 'md' | 'lg'
}

// Size presets for consistent sizing
const SIZE_MAP = {
    sm: 28,   // Compact for mobile headers
    md: 32,   // Default
    lg: 40    // Large displays
}

// Logo aspect ratio (width / height from actual logo.png dimensions)
const ASPECT_RATIO = 192 / 71 // ~2.7

export function Logo({ className = '', height, size = 'md' }: LogoProps) {
    // Use explicit height if provided, otherwise use size preset
    const h = height || SIZE_MAP[size]
    const w = Math.round(h * ASPECT_RATIO)

    return (
        <Image
            src="/logo.png"
            alt="RentVault"
            width={w}
            height={h}
            priority
            className={`object-contain ${className}`}
            style={{ width: 'auto', height: h }}
        />
    )
}

// Alias for backwards compatibility
export function LogoText({ className = '' }: { className?: string }) {
    return <Logo className={className} />
}

export default Logo

