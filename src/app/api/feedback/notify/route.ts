import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
    try {
        const { type, message, pageUrl, userEmail } = await req.json()

        const typeLabels: Record<string, string> = {
            bug: '🐛 Bug Report',
            feature: '💡 Feature Request',
            general: '💬 General Feedback'
        }

        const subject = `[RentVault] ${typeLabels[type] || 'Feedback'}`

        const html = `
            <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #1e293b; margin-bottom: 16px;">${typeLabels[type] || 'New Feedback'}</h2>
                
                <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                    <p style="margin: 0; color: #334155; white-space: pre-wrap;">${message}</p>
                </div>
                
                <table style="width: 100%; font-size: 14px; color: #64748b;">
                    <tr>
                        <td style="padding: 4px 0;"><strong>From:</strong></td>
                        <td style="padding: 4px 0;">${userEmail || 'Anonymous'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>Page:</strong></td>
                        <td style="padding: 4px 0;">${pageUrl || 'Unknown'}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>Time:</strong></td>
                        <td style="padding: 4px 0;">${new Date().toISOString()}</td>
                    </tr>
                </table>
            </div>
        `

        const text = `
${typeLabels[type] || 'New Feedback'}

${message}

---
From: ${userEmail || 'Anonymous'}
Page: ${pageUrl || 'Unknown'}
Time: ${new Date().toISOString()}
        `.trim()

        await sendEmail({
            to: 'support@rentvault.co',
            subject,
            html,
            text,
            tags: [{ name: 'category', value: 'feedback' }]
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Feedback notification error:', error)
        return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
}
