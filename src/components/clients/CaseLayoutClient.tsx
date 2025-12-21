'use client';

import Link from 'next/link';
import { useCaseStore } from '@/store/useCaseStore';
import { usePathname } from 'next/navigation';

export default function CaseLayoutClient({
    id,
    children
}: {
    id: string,
    children: React.ReactNode
}) {
    const { getCase } = useCaseStore();
    const rentalCase = getCase(id);
    const pathname = usePathname();

    // Handle missing case or hydration
    if (!rentalCase) {
        return (
            <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
                <h2>Case not found</h2>
                <p className="text-muted" style={{ marginBottom: '1rem' }}>ID: {id}</p>
                <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: '1rem' }}>Back to Dashboard</Link>
            </div>
        );
    }

    const isActive = (path: string) => pathname.endsWith(path);

    return (
        <div className="container" style={{ padding: '2rem 0', display: 'flex', gap: '3rem', minHeight: 'calc(100vh - 4rem)' }}>
            {/* Sidebar Navigation */}
            <aside style={{ width: '250px', flexShrink: 0 }}>
                <div style={{ marginBottom: '2rem' }}>
                    <Link href="/dashboard" style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                        ← Back to Dashboard
                    </Link>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{rentalCase.name}</h2>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{rentalCase.address}</p>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link href={`/case/${id}`} className="nav-item" style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500,
                        background: isActive(`/case/${id}`) ? '#F3F4F6' : 'transparent',
                        color: isActive(`/case/${id}`) ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                    }}>
                        Overview
                    </Link>
                    <Link href={`/case/${id}/contract`} className="nav-item" style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500,
                        background: isActive('contract') ? '#F3F4F6' : 'transparent',
                        color: isActive('contract') ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                    }}>
                        1. Contract Scan
                    </Link>
                    <Link href={`/case/${id}/check-in`} className="nav-item" style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500,
                        background: isActive('check-in') ? '#F3F4F6' : 'transparent',
                        color: isActive('check-in') ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                    }}>
                        2. Check-in
                    </Link>
                    <Link href={`/case/${id}/move-out`} className="nav-item" style={{
                        padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 500,
                        background: isActive('move-out') ? '#F3F4F6' : 'transparent',
                        color: isActive('move-out') ? 'var(--color-text-main)' : 'var(--color-text-secondary)'
                    }}>
                        3. Move-out
                    </Link>
                </nav>
            </aside>

            {/* Main Content Area */}
            <main style={{ flex: 1 }}>
                {children}
            </main>
        </div>
    );
}
