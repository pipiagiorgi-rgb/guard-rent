import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    const { id: caseId } = await params

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('user_id, keys_returned_at')
            .eq('case_id', caseId)
            .single()

        if (!rentalCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        if (rentalCase.user_id !== user.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        if (rentalCase.keys_returned_at) return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })

        const now = new Date().toISOString()

        const { error: updateError } = await supabase
            .from('cases')
            .update({ keys_returned_at: now })
            .eq('case_id', caseId)

        if (updateError) throw updateError

        // Audit Log
        await supabase.from('audit_logs').insert({
            case_id: caseId,
            user_id: user.id,
            action: 'keys_returned',
            details: { timestamp: now }
        })

        return NextResponse.json({ success: true, timestamp: now })

    } catch (err: any) {
        console.error('Keys Log Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
