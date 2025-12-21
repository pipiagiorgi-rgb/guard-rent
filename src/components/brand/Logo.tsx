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
        sm: { width: 108, height: 36 },   // Was 84x28
        md: { width: 140, height: 46 },   // Was 108x36
        lg: { width: 172, height: 56 }    // Was 132x44
    }

    const { width, height } = sizes[size]

    return (
        <Image
            src="/logo.png"
            alt="RentVault"
            width={width}
            height={height}
            className={className}
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
