import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// DELETE: Remove a walkthrough video
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const assetId = searchParams.get('assetId')
        const caseId = searchParams.get('caseId')

        if (!assetId || !caseId) {
            return NextResponse.json({ error: 'Missing assetId or caseId' }, { status: 400 })
        }

        // Verify case ownership and get lock status
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('checkin_completed_at, handover_completed_at')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
        }

        // Get the asset to check its phase
        const { data: asset } = await supabase
            .from('assets')
            .select('asset_id, storage_path, phase')
            .eq('asset_id', assetId)
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .eq('type', 'walkthrough_video')
            .single()

        if (!asset) {
            return NextResponse.json({ error: 'Video not found' }, { status: 404 })
        }

        // Check if phase is locked
        if (asset.phase === 'check-in' && rentalCase.checkin_completed_at) {
            return NextResponse.json({ error: 'Check-in is locked. Video cannot be deleted.' }, { status: 400 })
        }
        if (asset.phase === 'handover' && rentalCase.handover_completed_at) {
            return NextResponse.json({ error: 'Handover is locked. Video cannot be deleted.' }, { status: 400 })
        }

        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('assets')
            .remove([asset.storage_path])

        if (storageError) {
            console.error('Failed to delete from storage:', storageError)
            // Continue to delete record anyway
        }

        // Delete asset record
        const { error: deleteError } = await supabase
            .from('assets')
            .delete()
            .eq('asset_id', assetId)

        if (deleteError) {
            console.error('Failed to delete asset record:', deleteError)
            return NextResponse.json({ error: 'Failed to delete video' }, { status: 500 })
        }

        console.log('Video deleted:', assetId)
        return NextResponse.json({ success: true })

    } catch (err: any) {
        console.error('Video delete error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
