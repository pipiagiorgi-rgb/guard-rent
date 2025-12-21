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
        sm: { width: 140, height: 42 },   // Mobile - symmetrical with hamburger
        md: { width: 150, height: 45 },   // Desktop - prominent
        lg: { width: 170, height: 51 }    // Large contexts
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
