'use client';

import { useState } from 'react';
import { useCaseStore } from '@/store/useCaseStore';
import { FileText, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import OpenAI from 'openai';
import Link from 'next/link';

export default function ContractClient({ id }: { id: string }) {
    const { getCase, updateCase, apiKey } = useCaseStore();
    const rentalCase = getCase(id);

    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!rentalCase) return null;

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!apiKey) {
            setError("Please configure your API Key in Settings first.");
            return;
        }

        setAnalyzing(true);
        setError(null);

        try {
            let textContent = "";
            if (file.type === "text/plain") {
                textContent = await file.text();
            } else {
                textContent = "Standard German Rental Contract for apartment at " + rentalCase.address;
            }

            const openai = new OpenAI({
                apiKey: apiKey,
                dangerouslyAllowBrowser: true
            });

            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: `Analyze contract and extract JSON: { noticePeriod, deposit, rentType, riskyClauses[] }`
                    },
                    {
                        role: "user",
                        content: textContent
                    }
                ],
                response_format: { type: "json_object" }
            });

            const result = JSON.parse(response.choices[0].message.content || "{}");

            updateCase(id, {
                contractAnalysis: {
                    summary: "Analysis complete",
                    noticePeriod: result.noticePeriod,
                    deposit: result.deposit,
                    issues: result.riskyClauses
                }
            });

        } catch (err: any) {
            setError(err.message || "Failed to analyze contract");
        } finally {
            setAnalyzing(false);
        }
    };

    const analysis = rentalCase.contractAnalysis;

    return (
        <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, marginBottom: '2rem' }}>Contract Quick Scan (Real AI)</h1>

            {!analysis && (
                <div className="card" style={{ padding: '3rem', textAlign: 'center', borderStyle: 'dashed', borderWidth: '2px' }}>
                    <div style={{ width: '4rem', height: '4rem', background: '#F3F4F6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <FileText size={32} color="var(--color-text-secondary)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Upload your rental contract</h3>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Supported: .txt (for real analysis) or others (simulated). <br />
                        <span style={{ fontSize: '0.875rem', color: 'var(--color-accent)' }}>Requires API Key in Settings</span>
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                        <label className="btn btn-primary" style={{ cursor: analyzing ? 'wait' : 'pointer', opacity: analyzing ? 0.7 : 1 }}>
                            {analyzing ? <Loader2 className="animate-spin" /> : 'Select File to Scan'}
                            <input type="file" onChange={handleFileUpload} disabled={analyzing} style={{ display: 'none' }} accept=".txt,.pdf,.jpg" />
                        </label>

                        {error && (
                            <div style={{ color: '#EF4444', fontSize: '0.875rem', maxWidth: '400px' }}>
                                Error: {error}
                                {error.includes("Settings") && <Link href="/settings" style={{ textDecoration: 'underline', marginLeft: '0.5rem' }}>Go to Settings</Link>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {analysis && (
                <div className="space-y-6">
                    <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-success)', background: '#ECFDF5' }}>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <CheckCircle className="text-success" />
                            <div>
                                <h3 style={{ fontWeight: 600, color: '#065F46' }}>Analysis Complete</h3>
                                <p style={{ fontSize: '0.875rem', color: '#047857' }}>AI has extracted the key terms from your document.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
