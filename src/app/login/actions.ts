'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string

    // Validate email
    if (!email || !email.includes('@')) {
        redirect('/login?error=Invalid email address')
    }

    // Get the site URL - use VERCEL_URL in production, or localhost for dev
    const vercelUrl = process.env.VERCEL_URL;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

    let origin: string;
    if (siteUrl) {
        origin = siteUrl;
    } else if (vercelUrl) {
        origin = `https://${vercelUrl}`;
    } else {
        origin = 'http://localhost:3000';
    }

    // For RentVault specifically, always use the custom domain
    if (vercelUrl?.includes('guard-rent') || vercelUrl?.includes('vercel.app')) {
        origin = 'https://rentvault.ai';
    }

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    })

    if (error) {
        console.error("Login error:", error.message, error.status, JSON.stringify(error));
        redirect(`/login?error=${encodeURIComponent(error.message || 'Could not send magic link')}`)
    }

    revalidatePath('/', 'layout')
    redirect('/login?message=Check your email for the login link!')
}
