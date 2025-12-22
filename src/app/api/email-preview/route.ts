import { NextRequest, NextResponse } from 'next/server'

// ============================================================
// EMAIL PREVIEW ROUTE (Development Only)
// ============================================================
// This route allows previewing email templates in the browser
// without actually sending emails. Only accessible in development.
//
// Usage:
//   GET /api/email-preview?template=pdf
//   GET /api/email-preview?template=reminder-confirmation
//   GET /api/email-preview?template=deadline-reminder
//   GET /api/email-preview?template=retention-warning
// ============================================================

import {
    generatePdfEmailHtml,
    generateReminderConfirmationHtml,
    generateDeadlineReminderHtml,
    generateRetentionWarningHtml
} from '@/lib/email-templates'

export async function GET(request: NextRequest) {
    // Block in production
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
            { error: 'Email preview is only available in development' },
            { status: 404 }
        )
    }

    const template = request.nextUrl.searchParams.get('template')

    if (!template) {
        return new NextResponse(
            `
            <!DOCTYPE html>
            <html>
            <head><title>Email Template Preview</title></head>
            <body style="font-family: system-ui; padding: 40px; max-width: 600px; margin: 0 auto;">
                <h1>📧 Email Template Preview</h1>
                <p>Select a template to preview:</p>
                <ul style="list-style: none; padding: 0;">
                    <li style="margin: 16px 0;"><a href="?template=pdf" style="color: #0066cc; text-decoration: none; font-size: 18px;">📄 PDF Export Email</a></li>
                    <li style="margin: 16px 0;"><a href="?template=reminder-confirmation" style="color: #0066cc; text-decoration: none; font-size: 18px;">✅ Reminder Confirmation Email</a></li>
                    <li style="margin: 16px 0;"><a href="?template=deadline-reminder" style="color: #0066cc; text-decoration: none; font-size: 18px;">⏰ Deadline Reminder Email</a></li>
                    <li style="margin: 16px 0;"><a href="?template=retention-warning" style="color: #0066cc; text-decoration: none; font-size: 18px;">⚠️ Retention Warning Email</a></li>
                </ul>
                <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
                <p style="color: #666; font-size: 14px;">All templates use sample data for preview.</p>
            </body>
            </html>
            `.trim(),
            { headers: { 'Content-Type': 'text/html' } }
        )
    }

    let html: string

    switch (template) {
        case 'pdf':
            html = generatePdfEmailHtml({
                rentalLabel: 'Sample Apartment Berlin',
                packName: 'Check-In Pack',
                downloadUrl: 'https://example.com/download/sample.pdf'
            })
            break

        case 'reminder-confirmation':
            html = generateReminderConfirmationHtml({
                type: 'termination_notice',
                rentalLabel: 'Sample Apartment Berlin',
                date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                offsets: [30, 7, 0],
                noticeMethod: 'Registered letter'
            })
            break

        case 'deadline-reminder':
            html = generateDeadlineReminderHtml({
                type: 'termination_notice',
                rentalLabel: 'Sample Apartment Berlin',
                date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                daysUntil: 7,
                noticeMethod: 'Registered letter'
            })
            break

        case 'retention-warning':
            html = generateRetentionWarningHtml({
                rentalLabel: 'Sample Apartment Berlin',
                caseId: 'sample-case-id',
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                daysUntil: 30
            })
            break

        default:
            return NextResponse.json(
                { error: `Unknown template: ${template}` },
                { status: 400 }
            )
    }

    return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html' }
    })
}
