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
        const {
            label,
            country,
            stay_type,
            // Long-term fields
            lease_start,
            lease_end,
            // Short-stay fields
            platform_name,
            reservation_id,
            check_in_date,
            check_out_date
        } = body

        if (!label || !country) {
            return NextResponse.json({ error: 'Label and country are required' }, { status: 400 })
        }

        // Calculate retention_until based on stay type
        let retentionUntil: Date
        if (stay_type === 'short_stay' && check_out_date) {
            // Short-stay: 30 days after check-out
            retentionUntil = new Date(check_out_date)
            retentionUntil.setDate(retentionUntil.getDate() + 30)
        } else if (stay_type === 'short_stay') {
            // Short-stay without check-out date: 30 days from now
            retentionUntil = new Date()
            retentionUntil.setDate(retentionUntil.getDate() + 30)
        } else {
            // Long-term: 12 months from now
            retentionUntil = new Date()
            retentionUntil.setMonth(retentionUntil.getMonth() + 12)
        }

        const { data: newCase, error: insertError } = await supabase
            .from('cases')
            .insert({
                user_id: user.id,
                label,
                country,
                stay_type: stay_type || 'long_term',
                // Long-term fields
                lease_start: lease_start || null,
                lease_end: lease_end || null,
                // Short-stay fields
                platform_name: platform_name || null,
                reservation_id: reservation_id || null,
                check_in_date: check_in_date || null,
                check_out_date: check_out_date || null,
                // Common
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
