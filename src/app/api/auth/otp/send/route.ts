import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { sendOtpEmail } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Generate 6-digit code
function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        // Generate OTP
        const code = generateOtp()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Invalidate any existing codes for this email
        await supabaseAdmin
            .from('otp_codes')
            .update({ used: true })
            .eq('email', email.toLowerCase())
            .eq('used', false)

        // Store new OTP
        const { error: insertError } = await supabaseAdmin
            .from('otp_codes')
            .insert({
                email: email.toLowerCase(),
                code,
                expires_at: expiresAt.toISOString()
            })

        if (insertError) {
            console.error('Failed to store OTP:', insertError)
            return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 })
        }

        // Send email via Resend
        const emailResult = await sendOtpEmail(email, code)

        if (!emailResult.success) {
            console.error('Failed to send OTP email:', emailResult.error)
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
        }

        console.log(`OTP sent to ${email}`)
        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('OTP send error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
