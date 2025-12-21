import { Resend } from 'resend'

// Lazy initialization of Resend client (only when API key is available)
function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        return null
    }
    return new Resend(process.env.RESEND_API_KEY)
}

// Email sender address
const FROM_EMAIL = process.env.FROM_EMAIL || 'RentVault <noreply@rentvault.com>'

// ============================================================
// HTML EMAIL TEMPLATE (Supabase-inspired minimal design)
// ============================================================
function emailTemplate({
    title,
    previewText,
    bodyContent,
    ctaText,
    ctaUrl
}: {
    title: string
    previewText: string
    bodyContent: string
    ctaText?: string
    ctaUrl?: string
}): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${title}</title>
    <style>
        /* Base styles */
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; background-color: #f8fafc; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Interactive button hover (some clients support this) */
        .cta-button:hover { background-color: #0c1c4e !important; }
        
        @media only screen and (max-width: 600px) {
            .email-container { width: 100% !important; border-radius: 0 !important; }
            .content-padding { padding: 40px 24px !important; }
            .footer-padding { padding: 32px 24px !important; }
        }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
    <div style="display: none; max-height: 0; overflow: hidden; opacity: 0;">${previewText}</div>
    
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc;">
        <tr>
            <td align="center" style="padding: 60px 0;">
                <table role="presentation" class="email-container" width="560" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);">
                    <!-- Brand Section -->
                    <tr>
                        <td align="center" style="padding: 48px 48px 0 48px;">
                            <a href="https://rentvault.ai" target="_blank" style="text-decoration: none;">
                                <img src="https://rentvault.ai/logo.png" alt="RentVault" width="150" style="display: block; width: 150px; height: auto; border: 0;">
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Main Body -->
                    <tr>
                        <td class="content-padding" style="padding: 48px;">
                            <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 800; color: #011246; line-height: 1.25; letter-spacing: -0.02em;">
                                ${title}
                            </h1>
                            <div style="font-size: 16px; color: #475569; line-height: 1.6; letter-spacing: 0.01em;">
                                ${bodyContent}
                            </div>
                            
                            ${ctaText && ctaUrl ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                                <tr>
                                    <td>
                                        <a href="${ctaUrl}" class="cta-button" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #011246; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(1, 18, 70, 0.1), 0 2px 4px -1px rgba(1, 18, 70, 0.06);">
                                            ${ctaText}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                    
                    <!-- Features/Benefits Section (Subtle reinforcement) -->
                    <tr>
                        <td style="padding: 0 48px 40px 48px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
                                            <strong style="color: #475569;">Security Tip:</strong> RentVault will never ask for your password or bank details via email.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Professional Footer -->
                    <tr>
                        <td class="footer-padding" style="padding: 40px 48px; border-top: 1px solid #f1f5f9; background-color: #fafbfc; border-radius: 0 0 20px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 12px; font-weight: 600; color: #94a3b8; line-height: 1.6; text-transform: uppercase; letter-spacing: 0.05em;">
                                            Privacy-first housing
                                        </p>
                                        <p style="margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; line-height: 1.6;">
                                            RentVault securely stores and organises your rental evidence. Not legal advice.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding-top: 24px;">
                                        <p style="margin: 0; font-size: 11px; color: #cbd5e1; letter-spacing: 0.02em;">
                                            &copy; ${new Date().getFullYear()} RentVault.ai. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                    <tr>
                        <td align="center">
                            <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                                <a href="https://rentvault.ai/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> &nbsp;&bull;&nbsp; 
                                <a href="https://rentvault.ai/terms" style="color: #94a3b8; text-decoration: underline;">Terms of Service</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `.trim()
}

// ============================================================
// SEND EMAIL
// ============================================================
interface SendEmailOptions {
    to: string
    subject: string
    text: string
    html?: string
}

export async function sendEmail({ to, subject, text, html }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    const resend = getResendClient()

    // If no API key, log to console (development mode)
    if (!resend) {
        console.log('========== EMAIL (dev mode) ==========')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('Body:', text)
        console.log('======================================')
        return { success: true }
    }

    try {
        const { error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            text,
            html
        })

        if (error) {
            console.error('Resend error:', error)
            return { success: false, error: error.message }
        }

        return { success: true }
    } catch (err: any) {
        console.error('Email send error:', err)
        return { success: false, error: err.message || 'Failed to send email' }
    }
}

// ============================================================
// PDF EMAIL
// ============================================================
export async function sendPdfEmail({
    to,
    rentalLabel,
    packName,
    downloadUrl
}: {
    to: string
    rentalLabel: string
    packName: string
    downloadUrl: string
}): Promise<{ success: boolean; error?: string }> {
    const formattedDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const subject = `Your ${packName} is ready`

    const text = `
Your ${packName} for "${rentalLabel}" is ready.

Download your PDF: ${downloadUrl}

This link will expire in 1 hour. You can generate a new PDF anytime from RentVault.

Generated on: ${formattedDate}

---
RentVault securely stores and organises your rental documents. Not legal advice.
    `.trim()

    const html = emailTemplate({
        title: `Your ${packName} is ready`,
        previewText: `Download your ${packName} for ${rentalLabel}`,
        bodyContent: `
            <p style="margin: 0 0 16px 0;">Your <strong>${packName}</strong> for "<strong>${rentalLabel}</strong>" is ready to download.</p>
            <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 12px;">This link expires in 1 hour.</p>
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">Generated on ${formattedDate}</p>
        `,
        ctaText: 'Download PDF',
        ctaUrl: downloadUrl
    })

    return sendEmail({ to, subject, text, html })
}

// ============================================================
// REMINDER CONFIRMATION EMAIL
// ============================================================
export async function sendReminderConfirmationEmail({
    to,
    type,
    rentalLabel,
    date,
    offsets,
    noticeMethod,
    dueDay
}: {
    to: string
    type: 'termination_notice' | 'rent_payment'
    rentalLabel: string
    date: string
    offsets: number[]
    noticeMethod?: string
    dueDay?: string
}): Promise<{ success: boolean; error?: string }> {
    const offsetText = offsets
        .sort((a, b) => b - a)
        .map(d => d === 0 ? 'on the due date' : `${d} days before`)
        .join(', ')

    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    let subject: string
    let title: string
    let bodyContent: string
    let text: string

    if (type === 'termination_notice') {
        subject = 'Termination reminder scheduled'
        title = 'You\'re all set'
        bodyContent = `
            <p style="margin: 0 0 16px 0;">We'll remind you if action is needed to terminate your rental contract.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Notice deadline</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${formattedDate}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">You'll be notified</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${offsetText}</p>
                        ${noticeMethod && noticeMethod !== 'not found' ? `
                        <p style="margin: 16px 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Notice method</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${noticeMethod}</p>
                        ` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 13px; color: #64748b;">You can change or disable this reminder anytime in RentVault.</p>
        `
        text = `You're all set.\n\nWe'll remind you if action is needed to terminate your rental contract.\n\nContract: ${rentalLabel}\nNotice deadline: ${formattedDate}\nYou'll be notified: ${offsetText}${noticeMethod && noticeMethod !== 'not found' ? `\nNotice method: ${noticeMethod}` : ''}\n\nYou can change or disable this reminder anytime in RentVault.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    } else {
        subject = 'Rent payment reminder scheduled'
        title = 'Reminder active'
        const dueDateText = dueDay ? `${dueDay}${getOrdinalSuffix(parseInt(dueDay))} of each month` : formattedDate
        bodyContent = `
            <p style="margin: 0 0 16px 0;">Your rent payment reminder is now active.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Rent due</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${dueDateText}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">You'll be notified</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${offsetText}</p>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 13px; color: #64748b;">You can change or disable this reminder anytime in RentVault.</p>
        `
        text = `Reminder active.\n\nYour rent payment reminder is now active.\n\nContract: ${rentalLabel}\nRent due: ${dueDateText}\nYou'll be notified: ${offsetText}\n\nYou can change or disable this reminder anytime in RentVault.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    }

    const html = emailTemplate({
        title,
        previewText: `${type === 'termination_notice' ? 'Termination' : 'Rent'} reminder set for ${rentalLabel}`,
        bodyContent
    })

    return sendEmail({ to, subject, text, html })
}

// ============================================================
// DEADLINE REMINDER EMAIL (actual notification)
// ============================================================
export async function sendDeadlineReminderEmail({
    to,
    type,
    rentalLabel,
    date,
    daysUntil,
    noticeMethod
}: {
    to: string
    type: 'termination_notice' | 'rent_payment'
    rentalLabel: string
    date: string
    daysUntil: number
    noticeMethod?: string
}): Promise<{ success: boolean; error?: string }> {
    const formattedDate = new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const urgency = daysUntil === 0 ? 'today' :
        daysUntil === 1 ? 'tomorrow' :
            `in ${daysUntil} days`

    const urgencyColor = daysUntil <= 7 ? '#dc2626' : '#f59e0b'

    let subject: string
    let title: string
    let bodyContent: string
    let text: string

    if (type === 'termination_notice') {
        subject = `Notice deadline ${urgency}`
        title = `Notice deadline ${urgency}`
        bodyContent = `
            <p style="margin: 0 0 16px 0;">Your termination notice deadline is approaching.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Deadline</p>
                        <p style="margin: 0; font-weight: 700; color: ${urgencyColor}; font-size: 16px;">${formattedDate}</p>
                    </td>
                </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        ${noticeMethod && noticeMethod !== 'not found' ? `
                        <p style="margin: 16px 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Notice method</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${noticeMethod}</p>
                        ` : ''}
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 13px; color: #64748b;">If you wish to terminate the contract, make sure to send your notice before this date.</p>
        `
        text = `Notice deadline ${urgency}\n\nYour termination notice deadline is approaching.\n\nDeadline: ${formattedDate}\nContract: ${rentalLabel}${noticeMethod && noticeMethod !== 'not found' ? `\nNotice method: ${noticeMethod}` : ''}\n\nIf you wish to terminate the contract, make sure to send your notice before this date.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    } else {
        subject = `Rent due ${urgency}`
        title = `Rent due ${urgency}`
        bodyContent = `
            <p style="margin: 0 0 16px 0;">Your rent payment is due soon.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Due date</p>
                        <p style="margin: 0; font-weight: 700; color: ${urgencyColor}; font-size: 16px;">${formattedDate}</p>
                    </td>
                </tr>
            </table>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                    </td>
                </tr>
            </table>
        `
        text = `Rent due ${urgency}\n\nYour rent payment is due soon.\n\nDue date: ${formattedDate}\nContract: ${rentalLabel}\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    }

    const html = emailTemplate({
        title,
        previewText: `${type === 'termination_notice' ? 'Notice' : 'Rent'} deadline ${urgency} for ${rentalLabel}`,
        bodyContent
    })

    return sendEmail({ to, subject, text, html })
}

function getOrdinalSuffix(n: number): string {
    const s = ['th', 'st', 'nd', 'rd']
    const v = n % 100
    return s[(v - 20) % 10] || s[v] || s[0]
}

// ============================================================
// RETENTION WARNING EMAIL (30 days before data expiry)
// ============================================================
export async function sendRetentionWarningEmail({
    to,
    rentalLabel,
    caseId,
    expiryDate,
    daysUntil
}: {
    to: string
    rentalLabel: string
    caseId: string
    expiryDate: string
    daysUntil: number
}): Promise<{ success: boolean; error?: string }> {
    const formattedDate = new Date(expiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.ai'
    const settingsUrl = `${siteUrl}/app/case/${caseId}/settings`

    const subject = `Your rental data expires ${daysUntil <= 7 ? 'soon' : `in ${daysUntil} days`}`
    const title = 'Storage expiry reminder'

    const bodyContent = `
        <p style="margin: 0 0 16px 0;">Your documents for <strong>"${rentalLabel}"</strong> will be permanently deleted on <strong>${formattedDate}</strong>.</p>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; margin-bottom: 16px;">
            <tr>
                <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Data expires</p>
                    <p style="margin: 0; font-weight: 700; color: #92400e; font-size: 16px;">${formattedDate}</p>
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">You have two options:</p>
        
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #475569; font-size: 14px;">
            <li style="margin-bottom: 8px;"><strong>Extend storage</strong> for another 12 months for €9</li>
            <li><strong>Download your files</strong> and let the data expire</li>
        </ul>
        
        <p style="margin: 0; font-size: 13px; color: #64748b;">After the expiry date, all photos, documents, and data for this rental will be permanently deleted and cannot be recovered.</p>
    `

    const text = `Storage expiry reminder

Your documents for "${rentalLabel}" will be permanently deleted on ${formattedDate}.

You have two options:
- Extend storage for another 12 months for €9
- Download your files and let the data expire

After the expiry date, all photos, documents, and data for this rental will be permanently deleted and cannot be recovered.

Manage your rental: ${settingsUrl}

---
RentVault securely stores and organises your rental documents. Not legal advice.`

    const html = emailTemplate({
        title,
        previewText: `Your rental data expires ${formattedDate}`,
        bodyContent,
        ctaText: 'Manage storage',
        ctaUrl: settingsUrl
    })

    return sendEmail({ to, subject, text, html })
}
