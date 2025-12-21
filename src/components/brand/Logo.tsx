// RentVault Logo Components
// Usage: <Logo /> for standard logo, <Logo size="lg" /> for larger

import Image from 'next/image'

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

// Image-based logo with stylized RV
export function Logo({ className = '', size = 'md' }: LogoProps) {
    const sizes = {
        sm: { width: 100, height: 33 },   // Mobile - balanced
        md: { width: 120, height: 40 },   // Standard
        lg: { width: 136, height: 45 }    // Desktop - prominent but not overwhelming
    }

    const { width, height } = sizes[size]

    return (
        <Image
            src="/logo.png"
            alt="RentVault"
            width={width}
            height={height}
            className={`block ${className}`}
            priority
            style={{ objectFit: 'contain' }}
        />
    )
}

// Alias for backwards compatibility
export function LogoText({ className = '' }: { className?: string }) {
    return <Logo className={className} />
}

export default Logo
