import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { type, message, pageUrl, userEmail, rentalLabel, caseId } = await req.json()

        const typeLabels: Record<string, string> = {
            bug: 'Bug',
            feature: 'Idea',
            general: 'Other'
        }

        const typeLabel = typeLabels[type] || 'Other'
        const subject = `[RentVault Feedback] ${typeLabel}`
        const timestamp = new Date().toISOString()
        const environment = process.env.NODE_ENV === 'production' ? 'Production' : 'Development'

        const html = `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e293b; margin-bottom: 16px;">${typeLabel} Report</h2>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #334155; white-space: pre-wrap;">${message}</p>
                </div>
                
                <table style="width: 100%; font-size: 14px; color: #64748b;">
                    <tr>
                        <td style="padding: 4px 0;"><strong>Type:</strong></td>
                        <td style="padding: 4px 0;">${typeLabel}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>User email:</strong></td>
                        <td style="padding: 4px 0;">${userEmail || 'Anonymous'}</td>
                    </tr>
                    ${rentalLabel ? `
                    <tr>
                        <td style="padding: 4px 0;"><strong>Rental:</strong></td>
                        <td style="padding: 4px 0;">${rentalLabel}</td>
                    </tr>
                    ` : ''}
                    ${caseId ? `
                    <tr>
                        <td style="padding: 4px 0;"><strong>Case ID:</strong></td>
                        <td style="padding: 4px 0;">${caseId}</td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 4px 0;"><strong>Page:</strong></td>
                        <td style="padding: 4px 0;">${pageUrl || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>Timestamp (UTC):</strong></td>
                        <td style="padding: 4px 0;">${timestamp}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>Environment:</strong></td>
                        <td style="padding: 4px 0;">${environment}</td>
                    </tr>
                </table>
            </div>
        `

        const text = `
${typeLabel} Report

${message}

---
Type: ${typeLabel}
User email: ${userEmail || 'Anonymous'}
${rentalLabel ? `Rental: ${rentalLabel}` : ''}
${caseId ? `Case ID: ${caseId}` : ''}
Page: ${pageUrl || 'Unknown'}
Timestamp (UTC): ${timestamp}
Environment: ${environment}
        `.trim()

        const result = await sendEmail({
            to: 'support@rentvault.co',
            subject,
            html,
            text,
            tags: [{ name: 'category', value: 'feedback' }]
        })

        if (!result.success) {
            console.error('Feedback email failed:', result.error)
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Feedback notification error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
