'use client';

import { useCaseStore } from '@/store/useCaseStore';

export default function CaseOverviewClient({ id }: { id: string }) {
    const { getCase } = useCaseStore();
    const rentalCase = getCase(id);

    if (!rentalCase) return null;

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Case Overview</h1>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Rental Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Address</div>
                        <div style={{ fontWeight: 500 }}>{rentalCase.address}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Status</div>
                        <div style={{ fontWeight: 500 }}>{rentalCase.status}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Created</div>
                        <div style={{ fontWeight: 500 }}>{rentalCase.createdAt}</div>
                    </div>

                    {/* Mock or Real Data from Contract Analysis */}
                    <div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Notice Period</div>
                        <div style={{ fontWeight: 500 }}>{rentalCase.contractAnalysis?.noticePeriod || 'Pending Scan'}</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className="card" style={{ padding: '1.5rem' }}>
                    <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Next Steps</h4>
                    {!rentalCase.contractAnalysis ? (
                        <div style={{ padding: '1rem', background: '#FFF7ED', borderRadius: 'var(--radius-md)', color: '#C2410C', marginBottom: '1rem' }}>
                            <strong>Action Required:</strong> Scan Contract
                        </div>
                    ) : (
                        <div style={{ padding: '1rem', background: '#EFF6FF', borderRadius: 'var(--radius-md)', color: 'var(--color-accent)', marginBottom: '1rem' }}>
                            <strong>Action Required:</strong> Complete Check-in Photos
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
