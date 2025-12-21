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
        sm: { width: 100, height: 28 },
        md: { width: 130, height: 36 },
        lg: { width: 160, height: 44 }
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
