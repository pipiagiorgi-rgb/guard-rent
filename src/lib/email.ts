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
    <!--[if mso]>
    <style type="text/css">
        table { border-collapse: collapse; }
        td { padding: 0; }
    </style>
    <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <!-- Preview text -->
    <div style="display: none; max-height: 0; overflow: hidden;">
        ${previewText}
    </div>
    
    <!-- Main container -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f5;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                
                <!-- Email card -->
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="padding: 32px 32px 24px 32px; text-align: center; border-bottom: 1px solid #e5e7eb;">
                            <span style="font-size: 20px; font-weight: 700; color: #0f172a; letter-spacing: -0.5px;">RentVault</span>
                        </td>
                    </tr>
                    
                    <!-- Body -->
                    <tr>
                        <td style="padding: 32px;">
                            <h1 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #0f172a; line-height: 1.4;">
                                ${title}
                            </h1>
                            <div style="font-size: 14px; color: #475569; line-height: 1.6;">
                                ${bodyContent}
                            </div>
                            
                            ${ctaText && ctaUrl ? `
                            <!-- CTA Button -->
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 24px;">
                                <tr>
                                    <td>
                                        <a href="${ctaUrl}" target="_blank" style="display: inline-block; padding: 12px 24px; background-color: #0f172a; color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; border-radius: 8px;">
                                            ${ctaText}
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background-color: #f9fafb; border-radius: 0 0 12px 12px;">
                            <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
                                RentVault securely stores and organises your rental documents. Not legal advice.
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
