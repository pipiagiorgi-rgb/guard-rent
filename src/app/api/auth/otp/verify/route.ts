import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { createClient as createServerClient } from '@/lib/supabase/server'

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

        if (existingUser) {
            userId = existingUser.id
        } else {
            // Create new user
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

        // Generate session for the user
        const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'magiclink',
            email: email.toLowerCase()
        })

        if (sessionError) {
            console.error('Failed to generate session link:', sessionError)
            return NextResponse.json({ error: 'Failed to authenticate' }, { status: 500 })
        }

        // Extract the token from the generated link and verify it
        // The link contains a token that we can use to sign in
        const linkUrl = new URL(sessionData.properties.hashed_token ?
            `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/verify?token=${sessionData.properties.hashed_token}&type=magiclink` :
            sessionData.properties.action_link)

        // Use the server client to verify the token
        const supabase = await createServerClient()

        // Since we can't directly create a session, we'll use verifyOtp with the generated token
        // Actually, let's use a different approach - sign in with magic link token

        // For now, return success and let the client redirect to a callback that uses the magic link
        // This is a workaround - the proper solution requires more complex session handling

        console.log(`User ${email} verified successfully via OTP`)

        return NextResponse.json({
            success: true,
            redirectUrl: sessionData.properties.action_link
        })

    } catch (error: any) {
        console.error('OTP verify error:', error)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
