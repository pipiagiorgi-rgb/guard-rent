import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { sendAdminLoginNotification } from '@/lib/email'

// Use service role for server-side operations
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const { email, code } = await request.json()

        if (!email || !code) {
            return NextResponse.json({ error: 'Missing email or code' }, { status: 400 })
        }

        const cleanCode = code.replace(/\s/g, '')

        if (cleanCode.length !== 6) {
            return NextResponse.json({ error: 'Code must be 6 digits' }, { status: 400 })
        }

        // Find valid OTP
        const { data: otpRecord, error: fetchError } = await supabaseAdmin
            .from('otp_codes')
            .select('*')
            .eq('email', email.toLowerCase())
            .eq('code', cleanCode)
            .eq('used', false)
            .gt('expires_at', new Date().toISOString())
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (fetchError || !otpRecord) {
            console.log('OTP verification failed:', fetchError?.message || 'No valid code found')
            return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
        }

        // Mark OTP as used
        await supabaseAdmin
            .from('otp_codes')
            .update({ used: true })
            .eq('id', otpRecord.id)

        // Check if user exists
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        let userId: string
        let isNewUser = false

        if (existingUser) {
            userId = existingUser.id
        } else {
            // Create new user
            isNewUser = true
            const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
                email: email.toLowerCase(),
                email_confirm: true
            })

            if (createError || !newUser.user) {
                console.error('Failed to create user:', createError)
                return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
            }

            userId = newUser.user.id
        }

        // Generate a magic link that includes tokens
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email.toLowerCase(),
            options: {
                redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'}/vault`
            }
        })

        if (linkError || !linkData) {
            console.error('Failed to generate link:', linkError)
            return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
        }

        // Notify admin of login/registration (non-blocking)
        sendAdminLoginNotification({ userEmail: email, isNewUser }).catch(err => {
            console.error('Failed to send admin login notification:', err)
        })

        // The action_link contains the token - we need to redirect the user to this URL
        // to properly set the auth cookies
        console.log(`User ${email} verified successfully via OTP, redirecting to auth`)

        // Parse the action link to get token and redirect to our callback
        const actionUrl = new URL(linkData.properties.action_link)
        const token = actionUrl.searchParams.get('token')
        const type = actionUrl.searchParams.get('type')

        // Build callback URL with token
        const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://rentvault.co'}/auth/callback?token_hash=${token}&type=${type}`

        return NextResponse.json({
            success: true,
            redirectUrl: callbackUrl
        })

    } catch (error: any) {
        console.error('OTP verify error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
