import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { label, country, lease_start, lease_end } = body

        if (!label || !country) {
            return NextResponse.json({ error: 'Label and country are required' }, { status: 400 })
        }

        // Calculate default retention_until (12 months from now)
        const retentionUntil = new Date()
        retentionUntil.setMonth(retentionUntil.getMonth() + 12)

        const { data: newCase, error: insertError } = await supabase
            .from('cases')
            .insert({
                user_id: user.id,
                label,
                country,
                lease_start: lease_start || null,
                lease_end: lease_end || null,
                retention_until: retentionUntil.toISOString(),
                status: 'active',
                deletion_status: 'active'
            })
            .select('case_id')
            .single()

        if (insertError) {
            console.error('Case creation error:', insertError)
            return NextResponse.json({ error: 'Failed to create case' }, { status: 500 })
        }

        return NextResponse.json({ case_id: newCase.case_id })

    } catch (err) {
        console.error('API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function GET() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: cases, error } = await supabase
            .from('cases')
            .select('case_id, label, country, status, created_at, lease_start, lease_end, last_activity_at')
            .eq('user_id', user.id)
            .order('last_activity_at', { ascending: false })

        if (error) {
            console.error('Fetch cases error:', error)
            return NextResponse.json({ error: 'Failed to fetch cases' }, { status: 500 })
        }

        return NextResponse.json({ cases })

    } catch (err) {
        console.error('API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
