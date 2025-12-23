'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Validate email
    if (!email || !email.includes('@')) {
        return { error: 'Invalid email address' }
    }

    // Use OTP mode (no emailRedirectTo = sends 6-digit code instead of magic link)
    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            // No emailRedirectTo means Supabase sends OTP code instead of magic link
            shouldCreateUser: true,
        },
    })

    if (error) {
        console.error("Login error:", error.message, error.status, JSON.stringify(error));
        return { error: error.message || 'Could not send verification code' }
    }

    return { success: true, email }
}

export async function verifyOtp(email: string, token: string) {
    const supabase = await createClient()

    // Validate inputs
    if (!email || !token) {
        return { error: 'Missing email or verification code' }
    }

    // Clean the token (remove spaces)
    const cleanToken = token.replace(/\s/g, '')

    if (cleanToken.length !== 6) {
        return { error: 'Verification code must be 6 digits' }
    }

    const { error } = await supabase.auth.verifyOtp({
        email,
        token: cleanToken,
        type: 'magiclink'
    })

    if (error) {
        console.error("OTP verification error:", error.message);
        return { error: error.message || 'Invalid or expired code' }
    }

    revalidatePath('/', 'layout')
    redirect('/vault')
}
