import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const token_hash = searchParams.get('token_hash')
    const type = searchParams.get('type')
    const next = searchParams.get('next') ?? '/app'

    // Helper to get redirect base URL
    const getBaseUrl = () => {
        const isLocal = origin.includes('localhost')
        if (isLocal) return origin
        return 'https://rentvault.ai'
    }

    const baseUrl = getBaseUrl()

    console.log('Auth callback received:', {
        code: code ? 'present' : 'missing',
        token_hash: token_hash ? 'present' : 'missing',
        type,
        origin
    })

    // Handle token_hash for email confirmation (magic link)
    if (token_hash && type) {
        const supabase = await createClient()
        const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as any,
        })

        if (!error) {
            console.log('Auth successful via token_hash')
            // Redirect to confirm page with success, then to app
            return NextResponse.redirect(`${baseUrl}/auth/confirm?success=true`)
        }
        console.error('Auth error (token_hash):', error.message)
        return NextResponse.redirect(`${baseUrl}/auth/confirm?error=${encodeURIComponent(error.message)}`)
    }

    // Handle code for PKCE flow
    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('Auth successful via code')
            // Redirect to confirm page with success
            return NextResponse.redirect(`${baseUrl}/auth/confirm?success=true`)
        }
        console.error('Auth error (code):', error.message)
        return NextResponse.redirect(`${baseUrl}/auth/confirm?error=${encodeURIComponent(error.message)}`)
    }

    // No code or token_hash provided
    console.error('No code or token_hash in callback')
    return NextResponse.redirect(`${baseUrl}/auth/confirm?error=Invalid Login Link`)
}

