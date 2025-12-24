import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request, { params }: { params: Promise<{ roomId: string }> }) {
    const { roomId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        // Verify room ownership through case
        const { data: room } = await supabase
            .from('rooms')
            .select('room_id, case_id, cases!inner(user_id, checkin_completed_at)')
            .eq('room_id', roomId)
            .single()

        if (!room) {
            return NextResponse.json({ error: 'Room not found' }, { status: 404 })
        }

        // @ts-ignore - nested select
        if (room.cases.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Check if check-in is locked
        // @ts-ignore - nested select
        if (room.cases.checkin_completed_at) {
            return NextResponse.json({ error: 'Cannot delete room - check-in is locked' }, { status: 400 })
        }

        // Delete associated assets first (cascade should handle this, but be explicit)
        await supabase
            .from('assets')
            .delete()
            .eq('room_id', roomId)

        // Delete room
        const { error: deleteError } = await supabase
            .from('rooms')
            .delete()
            .eq('room_id', roomId)

        if (deleteError) throw deleteError

        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error('Delete room error:', err)
        return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 })
    }
}
