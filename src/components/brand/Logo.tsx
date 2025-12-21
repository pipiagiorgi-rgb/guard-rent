// RentVault Logo Components
// Usage: <Logo /> for standard logo, <Logo size="lg" /> for larger

interface LogoProps {
    className?: string
    size?: 'sm' | 'md' | 'lg'
}

// Two-tone elegant logo with stylized R and V
// R and V: #0F172A (Deep Slate/Navy)
// e, n, t, a, u, l, t: #475569 (Blue-Grey)
export function Logo({ className = '', size = 'md' }: LogoProps) {
    const sizes = {
        sm: 'text-lg',
        md: 'text-xl',
        lg: 'text-2xl'
    }

    return (
        <span className={`font-bold tracking-tight ${sizes[size]} ${className}`} style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            <span style={{ color: '#0F172A' }}>R</span>
            <span style={{ color: '#475569' }}>ent</span>
            <span style={{ color: '#0F172A' }}>V</span>
            <span style={{ color: '#475569' }}>ault</span>
        </span>
    )
}

// Alias for backwards compatibility
export function LogoText({ className = '' }: { className?: string }) {
    return <Logo className={className} />
}

export default Logo
