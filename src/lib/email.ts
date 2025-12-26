import { Resend } from 'resend'

// Lazy initialization of Resend client (only when API key is available)
function getResendClient(): Resend | null {
    if (!process.env.RESEND_API_KEY) {
        console.warn('[Email] RESEND_API_KEY not configured - emails will be logged only')
        return null
    }
    return new Resend(process.env.RESEND_API_KEY)
}

// Email sender address - MUST be from a verified Resend domain for production
const FROM_EMAIL = process.env.FROM_EMAIL || 'RentVault <onboarding@resend.dev>'

// Log email configuration on first use
let configLogged = false
function logEmailConfig() {
    if (configLogged) return
    configLogged = true
    console.log('[Email] Configuration:', {
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmail: FROM_EMAIL,
        isUsingDefault: !process.env.FROM_EMAIL
    })
    if (!process.env.FROM_EMAIL) {
        console.warn('[Email] Using default sandbox FROM_EMAIL - only verified emails can receive! Set FROM_EMAIL to a verified domain.')
    }
}

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
        body { margin: 0; padding: 0; min-width: 100%; width: 100% !important; height: 100% !important; background-color: #f8fafc; }
        table { border-spacing: 0; border-collapse: collapse; }
        img { border: 0; line-height: 100%; outline: none; text-decoration: none; }
        
        /* Interactive button hover */
        .cta-button:hover { background-color: #0c1c4e !important; transform: translateY(-1px); box-shadow: 0 6px 12px rgba(1, 18, 70, 0.15) !important; }
        
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
                    <!-- Brand Section (Text Only) -->
                    <tr>
                        <td align="center" style="padding: 48px 48px 0 48px;">
                            <a href="https://rentvault.co" target="_blank" style="text-decoration: none; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 26px; font-weight: 800; color: #011246; letter-spacing: -0.02em;">
                                RentVault
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Main Body -->
                    <tr>
                        <td class="content-padding" style="padding: 48px;">
                            <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 700; color: #011246; line-height: 1.25; letter-spacing: -0.01em;">
                                ${title}
                            </h1>
                            <div style="font-size: 16px; color: #475569; line-height: 1.6; letter-spacing: 0.01em;">
                                ${bodyContent}
                            </div>
                            
                            ${ctaText && ctaUrl ? `
                            <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top: 40px;">
                                <tr>
                                    <td>
                                        <!--[if mso]>
                                        <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${ctaUrl}" style="height:52px;v-text-anchor:middle;width:200px;" arcsize="24%" stroke="f" fillcolor="#011246">
                                            <w:anchorlock/>
                                            <center>
                                        <![endif]-->
                                        <a href="${ctaUrl}" class="cta-button" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #011246; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(1, 18, 70, 0.1); transition: all 0.2s ease;">
                                            ${ctaText}
                                        </a>
                                        <!--[if mso]>
                                            </center>
                                        </v:roundrect>
                                        <![endif]-->
                                    </td>
                                </tr>
                            </table>
                            ` : ''}
                        </td>
                    </tr>
                    
                    <!-- Safety & Tip Section -->
                    <tr>
                        <td style="padding: 0 48px 40px 48px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; border: 1px solid #f1f5f9;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <div style="font-size: 13px; color: #64748b; line-height: 1.5;">
                                            <strong style="color: #475569;">Security Tip:</strong> RentVault will never ask for your verification code, bank details, or payment information by email. If you have questions, reply to this email or visit our <a href="https://rentvault.co/guides" style="color: #011246; text-decoration: underline;">Help Center</a>.
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer-padding" style="padding: 40px 48px; border-top: 1px solid #f1f5f9; background-color: #fafbfc; border-radius: 0 0 20px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <p style="margin: 0; font-size: 13px; color: #475569; line-height: 1.6;">
                                            © RentVault 2025 · Securely stores and organises your rental documents. Not legal advice.
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
                                <a href="https://rentvault.co/privacy" style="color: #94a3b8; text-decoration: underline;">Privacy Policy</a> &nbsp;&bull;&nbsp; 
                                <a href="https://rentvault.co/terms" style="color: #94a3b8; text-decoration: underline;">Terms of Service</a> &nbsp;&bull;&nbsp;
                                <a href="https://rentvault.co/vault" style="color: #94a3b8; text-decoration: underline;">Dashboard</a>
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
    tags?: { name: string; value: string }[]
}

export async function sendEmail({ to, subject, text, html, tags }: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
    logEmailConfig() // Log config on first email
    const resend = getResendClient()

    // If no API key, log to console (development mode)
    if (!resend) {
        console.log('========== EMAIL (dev mode) ==========')
        console.log('To:', to)
        console.log('Subject:', subject)
        console.log('Tags:', tags)
        console.log('Body:', text)
        console.log('======================================')
        return { success: true }
    }

    try {
        console.log('[Email] Sending to:', to, '| Subject:', subject)

        const { data, error } = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            text,
            html,
            tags
        })

        if (error) {
            console.error('[Email] Resend error:', error)
            return { success: false, error: error.message }
        }

        console.log('[Email] Sent successfully:', data?.id)
        return { success: true }
    } catch (err: any) {
        console.error('[Email] Send error:', err)
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

    const subject = `[PDF] Your ${packName} is ready`

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

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'pdf' }]
    })
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
    dueDay,
    customLabel,
    rentAmount,
    leaseEndDate
}: {
    to: string
    type: 'termination_notice' | 'rent_payment' | 'custom'
    rentalLabel: string
    date: string
    offsets: number[]
    noticeMethod?: string
    dueDay?: string
    customLabel?: string
    rentAmount?: string
    leaseEndDate?: string
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
        subject = '[Reminder] Termination reminder scheduled'
        title = 'You\'re all set'
        const leaseEndFormatted = leaseEndDate ? new Date(leaseEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : null
        bodyContent = `
            <p style="margin: 0 0 16px 0;">We'll remind you before the deadline to avoid auto-renewal.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        ${leaseEndFormatted ? `
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Lease ends</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${leaseEndFormatted}</p>
                        ` : ''}
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">⚠️ Send notice by</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #b45309;">${formattedDate}</p>
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
        text = `You're all set.\n\nWe'll remind you before the deadline to avoid auto-renewal.\n\nContract: ${rentalLabel}${leaseEndFormatted ? `\nLease ends: ${leaseEndFormatted}` : ''}\nSend notice by: ${formattedDate}\nYou'll be notified: ${offsetText}${noticeMethod && noticeMethod !== 'not found' ? `\nNotice method: ${noticeMethod}` : ''}\n\nYou can change or disable this reminder anytime in RentVault.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    } else if (type === 'rent_payment') {
        subject = '[Reminder] Rent payment reminder scheduled'
        title = 'Reminder active'
        const dueDateText = dueDay ? `${dueDay}${getOrdinalSuffix(parseInt(dueDay))} of each month` : formattedDate
        bodyContent = `
            <p style="margin: 0 0 16px 0;">Your rent payment reminder is now active.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Contract</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        ${rentAmount ? `
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Monthly rent</p>
                        <p style="margin: 0 0 16px 0; font-weight: 700; font-size: 18px; color: #0f172a;">${rentAmount}</p>
                        ` : ''}
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Rent due</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${dueDateText}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">You'll be notified</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${offsetText}</p>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 13px; color: #64748b;">You can change or disable this reminder anytime in RentVault.</p>
        `
        text = `Reminder active.\n\nYour rent payment reminder is now active.\n\nContract: ${rentalLabel}${rentAmount ? `\nMonthly rent: ${rentAmount}` : ''}\nRent due: ${dueDateText}\nYou'll be notified: ${offsetText}\n\nYou can change or disable this reminder anytime in RentVault.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    } else {
        // Custom reminder
        const reminderName = customLabel || 'Custom reminder'
        subject = `[Reminder] ${reminderName} scheduled`
        title = 'Reminder active'
        bodyContent = `
            <p style="margin: 0 0 16px 0;">Your custom reminder is now active.</p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 16px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Reminder</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${reminderName}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">For rental</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">Date</p>
                        <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${formattedDate}</p>
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px;">You'll be notified</p>
                        <p style="margin: 0; font-weight: 600; color: #0f172a;">${offsetText}</p>
                    </td>
                </tr>
            </table>
            <p style="margin: 0; font-size: 13px; color: #64748b;">You can change or disable this reminder anytime in RentVault.</p>
        `
        text = `Reminder active.\n\nYour custom reminder is now active.\n\nReminder: ${reminderName}\nFor rental: ${rentalLabel}\nDate: ${formattedDate}\nYou'll be notified: ${offsetText}\n\nYou can change or disable this reminder anytime in RentVault.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    }

    const html = emailTemplate({
        title,
        previewText: `${type === 'termination_notice' ? 'Termination' : type === 'rent_payment' ? 'Rent' : customLabel || 'Custom'} reminder set for ${rentalLabel}`,
        bodyContent
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'reminder' }]
    })
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
    noticeMethod,
    caseId
}: {
    to: string
    type: 'termination_notice' | 'rent_payment'
    rentalLabel: string
    date: string
    daysUntil: number
    noticeMethod?: string
    caseId?: string
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

    // Link to contract page for AI draft feature
    const contractUrl = caseId ? `${process.env.SITE_URL || 'https://rentvault.app'}/vault/case/${caseId}/contract` : null

    let subject: string
    let title: string
    let bodyContent: string
    let text: string

    if (type === 'termination_notice') {
        subject = `[Reminder] Notice deadline ${urgency}`
        title = `Notice deadline ${urgency}`

        // AI Draft CTA section - only for termination notices
        const aiDraftCta = contractUrl ? `
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                    <td style="padding: 20px; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); border-radius: 12px; text-align: center;">
                        <p style="margin: 0 0 12px 0; color: white; font-size: 15px; font-weight: 500;">Need to draft your termination notice?</p>
                        <a href="${contractUrl}" style="display: inline-block; background: white; color: #1d4ed8; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; text-decoration: none;">
                            ✨ Draft with AI assistant
                        </a>
                        <p style="margin: 12px 0 0 0; color: rgba(255,255,255,0.8); font-size: 12px;">We'll help you write a professional notice based on your contract terms</p>
                    </td>
                </tr>
            </table>
        ` : ''

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
            ${aiDraftCta}
            <p style="margin: 0; font-size: 13px; color: #64748b;">If you wish to terminate the contract, make sure to send your notice before this date.</p>
        `
        text = `Notice deadline ${urgency}\n\nYour termination notice deadline is approaching.\n\nDeadline: ${formattedDate}\nContract: ${rentalLabel}${noticeMethod && noticeMethod !== 'not found' ? `\nNotice method: ${noticeMethod}` : ''}\n\n${contractUrl ? `Draft your notice with AI: ${contractUrl}\n\n` : ''}If you wish to terminate the contract, make sure to send your notice before this date.\n\n---\nRentVault securely stores and organises your rental documents. Not legal advice.`
    } else {
        subject = `[Reminder] Rent due ${urgency}`
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

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'reminder' }]
    })
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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'
    const settingsUrl = `${siteUrl}/vault/case/${caseId}/settings`

    const subject = `Your rental records: ${rentalLabel}`
    const title = 'Your storage period is ending'

    const bodyContent = `
        <p style="margin: 0 0 16px 0;">Your 12-month storage period for <strong>"${rentalLabel}"</strong> ends on <strong>${formattedDate}</strong>.</p>
        
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 16px;">
            <tr>
                <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">No action needed yet</p>
                    <p style="margin: 0; font-size: 14px; color: #334155;">Your documents remain fully accessible until then.</p>
                </td>
            </tr>
        </table>

        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">If you'd like to keep your records available after this date:</p>
        
        <ul style="margin: 0 0 16px 0; padding-left: 20px; color: #475569; font-size: 14px;">
            <li style="margin-bottom: 8px;"><strong>Continue storage</strong> for €9/year — adds 12 months</li>
            <li><strong>Download your files</strong> anytime before the end date</li>
        </ul>
        
        <p style="margin: 0; font-size: 13px; color: #64748b;">No auto-charges. You choose if and when to extend.</p>
    `

    const text = `Your rental records: ${rentalLabel}

Your 12-month storage period ends on ${formattedDate}.

No action is needed yet — your documents remain fully accessible until then.

If you'd like to keep your records available after this date:
- Continue storage for €9/year (adds 12 months)
- Or download your files anytime before the end date

No auto-charges. You choose if and when to extend.

View storage options: ${settingsUrl}

---
RentVault securely stores and organises your rental documents. Not legal advice.`

    const html = emailTemplate({
        title,
        previewText: `Your rental records for ${rentalLabel} — no action needed yet`,
        bodyContent,
        ctaText: 'View storage options',
        ctaUrl: settingsUrl
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'reminder' }]
    })
}

// ============================================================
// MAGIC LINK EMAIL
// ============================================================
export async function sendMagicLinkEmail(to: string, magicLink: string): Promise<{ success: boolean; error?: string }> {
    const subject = 'Your RentVault login link'

    const bodyContent = `
        \u003cp style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;\u003e
            Click the button below to securely sign in to your RentVault account. This link will expire in 1 hour.
        \u003c/p\u003e
        \u003cp style="margin: 24px 0 0 0; font-size: 14px; color: #64748b; line-height: 1.6;\u003e
            If you didn't request this email, you can safely ignore it.
        \u003c/p\u003e
    `

    const text = `Sign in to RentVault\n\nClick this link to securely sign in to your account:\n${magicLink}\n\nThis link will expire in 1 hour.\n\nIf you didn't request this email, you can safely ignore it.`

    const html = emailTemplate({
        title: 'Sign in to RentVault',
        previewText: 'Your secure login link is ready',
        bodyContent,
        ctaText: 'Sign in to RentVault',
        ctaUrl: magicLink
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'magic-link' }]
    })
}

// ============================================================
// OTP CODE EMAIL (6-digit verification code)
// ============================================================
export async function sendOtpEmail(to: string, code: string): Promise<{ success: boolean; error?: string }> {
    const subject = 'Your RentVault verification code'

    const bodyContent = `
        <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Enter this code on the sign-in page to access your RentVault account:
        </p>
        <div style="background: #f8fafc; border: 2px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
            <div style="font-family: 'SF Mono', SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 42px; font-weight: 700; color: #011246; letter-spacing: 0.4em; line-height: 1;">
                ${code}
            </div>
            <p style="margin: 12px 0 0 0; font-size: 13px; color: #64748b;">
                This code expires in 10 minutes
            </p>
        </div>
        <p style="margin: 0; font-size: 14px; color: #64748b; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email.
        </p>
    `

    const text = `Your RentVault verification code\n\nEnter this code on the sign-in page: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`

    const html = emailTemplate({
        title: 'Your verification code',
        previewText: `Your RentVault code is ${code}`,
        bodyContent
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'otp' }]
    })
}

// ============================================================
// STORAGE REMINDER EMAIL
// ============================================================
interface StorageReminderProps {
    to: string
    daysRemaining: number
    caseLabel: string
    renewalLink: string
}

export async function sendStorageReminderEmail({ to, daysRemaining, caseLabel, renewalLink }: StorageReminderProps) {
    if (daysRemaining <= 0) return

    const subject = `Action Required: Storage for "${caseLabel}" expires in ${daysRemaining} days`

    // Determine urgency color
    const color = daysRemaining <= 7 ? '#ef4444' : daysRemaining <= 30 ? '#f59e0b' : '#3b82f6'

    await sendEmail({
        to,
        subject,
        text: `Urgent: Storage for "${caseLabel}" expires in ${daysRemaining} days. Renew now: ${renewalLink}`,
        html: `
            ${emailTemplate({
            title: 'Storage Expiry Warning',
            previewText: `Storage for "${caseLabel}" expires in ${daysRemaining} days`,
            bodyContent: `
                <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                    The secure storage for your rental <strong>${caseLabel}</strong> will expire in <span style="color: ${color}; font-weight: bold;">${daysRemaining} days</span>.
                </p>

                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #64748b; font-size: 14px;">
                        <strong>What happens next?</strong><br>
                        After expiry, your documents will be held for a 30-day grace period before being <strong>permanently deleted</strong>. You will lose access to all photos, contracts, and evidence.
                    </p>
                </div>

                <p style="color: #94a3b8; font-size: 14px; text-align: center;">
                    or <a href="${renewalLink}" style="color: #475569;">download your data</a> before it's gone.
                </p>
                `,
            ctaText: 'Extend Storage',
            ctaUrl: renewalLink
        })}
        `,
        tags: [{ name: 'type', value: 'storage_reminder' }]
    })
}

// ============================================================
// EVIDENCE LOCKED EMAIL (backup confirmation)
// ============================================================
export async function sendEvidenceLockedEmail({
    to,
    rentalLabel,
    lockType,
    lockTimestamp,
    caseId,
    photoCount
}: {
    to: string
    rentalLabel: string
    lockType: 'check-in' | 'handover'
    lockTimestamp: string
    caseId: string
    photoCount: number
}): Promise<{ success: boolean; error?: string }> {
    const formattedDate = new Date(lockTimestamp).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
    })

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'
    const dashboardUrl = `${siteUrl}/vault/case/${caseId}`
    const issuesUrl = `${siteUrl}/vault/case/${caseId}/issues`

    // ─────────────────────────────────────────────────────────────
    // MOVE-IN EMAIL: Warm, welcoming, introduces Issues feature
    // ─────────────────────────────────────────────────────────────
    if (lockType === 'check-in') {
        const subject = `Welcome to your new home — your Move-In is complete`
        const title = `Your Move-In is complete`

        const bodyContent = `
            <p style="margin: 0 0 16px 0; font-size: 16px;">
                Congratulations on your move-in.
            </p>
            <p style="margin: 0 0 24px 0;">
                We hope you enjoy settling into your new home. Your move-in record has now been securely completed and time-stamped. We're here to help you keep everything organised and protected throughout your tenancy.
            </p>

            <!-- Confirmation box -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 8px 0; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Move-In Sealed</p>
                        <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">${formattedDate} (UTC)</p>
                        <p style="margin: 0; font-size: 14px; color: #166534;">
                            ${photoCount} photo${photoCount !== 1 ? 's' : ''} recorded · Immutable · Downloadable anytime
                        </p>
                    </td>
                </tr>
            </table>

            <!-- Issues feature introduction -->
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 24px;">
                <tr>
                    <td style="padding: 16px;">
                        <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f172a;">If anything comes up during your tenancy</p>
                        <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569;">
                            For example, a small maintenance issue or unexpected damage — you can log it in RentVault at any time.
                        </p>
                        <p style="margin: 0; font-size: 14px; color: #64748b;">
                            This is completely optional, but it helps you keep a clear, dated record if you ever need it later.
                        </p>
                    </td>
                </tr>
            </table>

            <!-- Storage & exports -->
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #475569;">
                Your records are securely stored and accessible from your dashboard. You can generate official PDFs or extend storage later if you choose — nothing is required now.
            </p>

            <!-- Closing -->
            <p style="margin: 0; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
                We'll be here throughout your tenancy if you need reminders, records, or exports. Enjoy your new place — and welcome.
            </p>
        `

        const text = `Welcome to your new home — your Move-In is complete

Congratulations on your move-in.

We hope you enjoy settling into your new home. Your move-in record has now been securely completed and time-stamped. We're here to help you keep everything organised and protected throughout your tenancy.

Move-In Sealed
${formattedDate} (UTC)
${photoCount} photo${photoCount !== 1 ? 's' : ''} recorded · Immutable · Downloadable anytime

If anything comes up during your tenancy
For example, a small maintenance issue or unexpected damage — you can log it in RentVault at any time. This is completely optional, but it helps you keep a clear, dated record if you ever need it later.

Your records are securely stored and accessible from your dashboard. You can generate official PDFs or extend storage later if you choose — nothing is required now.

We'll be here throughout your tenancy if you need reminders, records, or exports. Enjoy your new place — and welcome.

View your dashboard: ${dashboardUrl}

---
RentVault securely stores and organises your rental documents. Not legal advice.`

        const html = emailTemplate({
            title,
            previewText: `Your move-in evidence is now complete and secured`,
            bodyContent,
            ctaText: 'Go to Dashboard',
            ctaUrl: dashboardUrl
        })

        return sendEmail({
            to,
            subject,
            text,
            html,
            tags: [{ name: 'type', value: 'evidence_locked' }]
        })
    }

    // ─────────────────────────────────────────────────────────────
    // MOVE-OUT EMAIL: Factual confirmation but still supportive
    // ─────────────────────────────────────────────────────────────
    const exportUrl = `${siteUrl}/vault/case/${caseId}/exports`
    const subject = `Move-Out confirmed for ${rentalLabel}`
    const title = `Your Move-Out is complete`

    const bodyContent = `
        <p style="margin: 0 0 16px 0;">
            We hope RentVault gave you a clear and secure way to record your rental handover.
        </p>
        <p style="margin: 0 0 24px 0;">
            This email confirms your Move-Out evidence has been sealed and time-stamped.
        </p>

        <!-- Confirmation box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 24px;">
            <tr>
                <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Move-Out Sealed</p>
                    <p style="margin: 0 0 12px 0; font-weight: 600; color: #166534;">${formattedDate} (UTC)</p>
                    <p style="margin: 0; font-size: 14px; color: #166534;">
                        ${photoCount} photo${photoCount !== 1 ? 's' : ''} recorded · Evidence locked
                    </p>
                </td>
            </tr>
        </table>

        <!-- Details box -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 8px; margin-bottom: 24px;">
            <tr>
                <td style="padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Rental</p>
                    <p style="margin: 0 0 16px 0; font-weight: 600; color: #0f172a;">${rentalLabel}</p>
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">What this means</p>
                    <ul style="margin: 0; padding-left: 16px; color: #475569; font-size: 14px;">
                        <li style="margin-bottom: 4px;">Photos and timestamps are now immutable</li>
                        <li style="margin-bottom: 4px;">Evidence cannot be added, edited, or deleted</li>
                        <li>You can generate a PDF report from Exports</li>
                    </ul>
                </td>
            </tr>
        </table>

        <!-- Storage notice -->
        <p style="margin: 0 0 16px 0; font-size: 14px; color: #475569;">
            Your records are stored securely for 12 months. We'll notify you well in advance before any changes to access or retention.
        </p>

        <p style="margin: 0; font-size: 14px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 16px;">
            If you rent again in the future, you can use RentVault to keep the same kind of clear records from day one.
        </p>
    `

    const text = `Move-Out confirmed for ${rentalLabel}

We hope RentVault gave you a clear and secure way to record your rental handover.

This email confirms your Move-Out evidence has been sealed and time-stamped.

Move-Out Sealed
${formattedDate} (UTC)
${photoCount} photo${photoCount !== 1 ? 's' : ''} recorded · Evidence locked

Rental: ${rentalLabel}

What this means:
- Photos and timestamps are now immutable
- Evidence cannot be added, edited, or deleted
- You can generate a PDF report from Exports

Your records are stored securely for 12 months. We'll notify you well in advance before any changes to access or retention.

If you rent again in the future, you can use RentVault to keep the same kind of clear records from day one.

Download your evidence pack: ${exportUrl}

---
RentVault securely stores and organises your rental documents. Not legal advice.`

    const html = emailTemplate({
        title,
        previewText: `Your Move-Out evidence is now complete and secured`,
        bodyContent,
        ctaText: 'Download Evidence Pack',
        ctaUrl: exportUrl
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'evidence_locked' }]
    })
}

// ============================================================
// STORAGE EXTENSION CONFIRMATION EMAIL
// ============================================================
interface StorageExtensionProps {
    to: string
    rentalLabel: string
    yearsAdded: number
    totalYears: number
    newExpiryDate: string
    caseId: string
}

export async function sendStorageExtensionEmail({
    to,
    rentalLabel,
    yearsAdded,
    totalYears,
    newExpiryDate,
    caseId
}: StorageExtensionProps): Promise<{ success: boolean; error?: string }> {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'
    const storageUrl = `${siteUrl}/vault/case/${caseId}/storage`
    const exportsUrl = `${siteUrl}/vault/case/${caseId}/exports`

    const formattedDate = new Date(newExpiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    const subject = `Storage extended — your RentVault records are secure until ${formattedDate}`

    const text = `
Storage Extended

Your rental records for "${rentalLabel}" are now secured until ${formattedDate}.

What was purchased: ${yearsAdded} year${yearsAdded > 1 ? 's' : ''} of additional storage
Total storage: ${totalYears} year${totalYears > 1 ? 's' : ''}
New expiry date: ${formattedDate}

Your records remain sealed and unchanged. This extension only affects how long they are stored.

View your storage status: ${storageUrl}
Access your exports: ${exportsUrl}

Thank you for using RentVault.
`

    const html = emailTemplate({
        title: 'Storage Extended',
        previewText: `Your records are secure until ${formattedDate}`,
        bodyContent: `
            <p style="color: #475569; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
                Your rental records for <strong>${rentalLabel}</strong> are now secured until <strong>${formattedDate}</strong>.
            </p>

            <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table style="width: 100%; font-size: 14px; color: #166534;">
                    <tr>
                        <td style="padding: 4px 0;"><strong>Storage added:</strong></td>
                        <td style="text-align: right;">${yearsAdded} year${yearsAdded > 1 ? 's' : ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>Total storage:</strong></td>
                        <td style="text-align: right;">${totalYears} year${totalYears > 1 ? 's' : ''}</td>
                    </tr>
                    <tr>
                        <td style="padding: 4px 0;"><strong>New expiry date:</strong></td>
                        <td style="text-align: right;">${formattedDate}</td>
                    </tr>
                </table>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 22px; margin-bottom: 24px;">
                Your records remain sealed and unchanged. This extension only affects how long they are stored.
            </p>

            <p style="color: #94a3b8; font-size: 14px; text-align: center; margin-top: 24px;">
                <a href="${exportsUrl}" style="color: #475569;">Access your exports</a>
            </p>
        `,
        ctaText: 'View Storage Status',
        ctaUrl: storageUrl
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'storage_extension' }]
    })
}

/**
 * Send Related Contracts Purchase Confirmation Email
 * REAL USERS ONLY - not sent for admin access
 */
export async function sendRelatedContractsPurchaseEmail({
    to,
    rentalLabel,
    dashboardUrl
}: {
    to: string
    rentalLabel: string
    dashboardUrl: string
}) {
    const subject = 'Related contracts added to your rental'

    const text = `You've added Related contracts to your rental "${rentalLabel}" in RentVault.

You can now:
• Upload and store contracts linked to your rental (internet, utilities, parking, insurance)
• Translate these contracts for easier reading
• Set reminder emails for notice periods when they're clearly stated

This applies for the entire duration of this rental, including any extensions.
No further action is required.

Related contracts are stored for reference and reminders only.
They are not sealed evidence and are not included in evidence reports.

You can manage related contracts anytime from your rental dashboard:
${dashboardUrl}

© RentVault 2025 · Securely stores and organises your rental documents. Not legal advice.`

    const html = emailTemplate({
        title: 'Related contracts added',
        previewText: `Related contracts enabled for "${rentalLabel}"`,
        bodyContent: `
            <p style="color: #1e293b; font-size: 15px; line-height: 24px; margin-bottom: 16px;">
                You've added <strong>Related contracts</strong> to your rental <strong>"${rentalLabel}"</strong> in RentVault.
            </p>

            <p style="color: #1e293b; font-size: 15px; line-height: 24px; margin-bottom: 8px;">
                You can now:
            </p>
            <ul style="color: #1e293b; font-size: 15px; line-height: 24px; margin-bottom: 16px; padding-left: 20px;">
                <li>Upload and store contracts linked to your rental (internet, utilities, parking, insurance)</li>
                <li>Translate these contracts for easier reading</li>
                <li>Set reminder emails for notice periods when they're clearly stated</li>
            </ul>

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #166534; font-size: 14px; line-height: 22px; margin: 0;">
                    <strong>✓ This applies for the entire duration of this rental, including any extensions.</strong><br>
                    No further action is required.
                </p>
            </div>

            <div style="background: #fefce8; border: 1px solid #fef08a; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #854d0e; font-size: 14px; line-height: 22px; margin: 0;">
                    <strong>Reference only:</strong> Related contracts are stored for reference and reminders only.
                    They are not sealed evidence and are not included in evidence reports.
                </p>
            </div>

            <p style="color: #64748b; font-size: 14px; line-height: 22px;">
                You can manage related contracts anytime from your rental dashboard.
            </p>
        `,
        ctaText: 'View Your Rental',
        ctaUrl: dashboardUrl
    })

    return sendEmail({
        to,
        subject,
        text,
        html,
        tags: [{ name: 'type', value: 'related_contracts_purchase' }]
    })
}

