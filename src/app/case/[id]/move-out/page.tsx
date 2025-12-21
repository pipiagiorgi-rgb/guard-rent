import { Download, CheckSquare, FileText } from 'lucide-react';

export function generateStaticParams() {
    return [{ id: 'demo' }];
}

export default function MoveOutPage() {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700 }}>Move-out & Recovery</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>Compile your evidence pack to ensure deposit return.</p>
                </div>
                <button className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem' }}>
                    <Download size={18} /> Download Recovery Pack
                </button>
            </div>

            <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Move-out Checklist</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} defaultChecked />
                        <span style={{ textDecoration: 'line-through', color: 'var(--color-text-muted)' }}>Send Termination Notice (3 months prior)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span>Schedule Handover Appointment</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span>Final Cosmetic Repairs (if valid)</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                        <input type="checkbox" style={{ width: '1.25rem', height: '1.25rem' }} />
                        <span>Document Move-out Condition (Photos)</span>
                    </label>
                </div>
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Evidence Pack Preview</h3>
            <div className="grid-cols-3">
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <FileText size={32} style={{ marginBottom: '1rem', color: 'var(--color-primary)' }} />
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Lease Data</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Dates, Rent, Deposit Proof</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                    <CheckSquare size={32} style={{ marginBottom: '1rem', color: 'var(--color-success)' }} />
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Check-in Report</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Baseline condition established</p>
                </div>
                <div className="card" style={{ textAlign: 'center', padding: '2rem', borderStyle: 'dashed' }}>
                    <div style={{ width: '2rem', height: '2rem', background: '#F3F4F6', borderRadius: '50%', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>?</div>
                    <h4 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Move-out Report</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>Pending upload...</p>
                </div>
            </div>
        </div>
    );
}
