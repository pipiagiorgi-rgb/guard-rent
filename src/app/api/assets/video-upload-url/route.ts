import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const MAX_VIDEO_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
const ALLOWED_TYPES = ['video/mp4', 'video/quicktime']
const MAX_DURATION_SECONDS = 300 // 5 minutes

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            caseId,
            fileName,
            fileType,
            fileSize,
            fileHash,
            phase, // 'check-in' or 'handover'
            durationSeconds,
            resolution,
            codec
        } = body

        // Validate required fields
        if (!caseId || !fileName || !fileType || !fileSize || !phase) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Validate phase
        if (!['check-in', 'handover'].includes(phase)) {
            return NextResponse.json({ error: 'Invalid phase' }, { status: 400 })
        }

        // Validate file type
        if (!ALLOWED_TYPES.includes(fileType)) {
            return NextResponse.json({ error: 'Only MP4 and MOV videos are allowed' }, { status: 400 })
        }

        // Validate file size
        if (fileSize > MAX_VIDEO_SIZE) {
            return NextResponse.json({ error: 'Video must be under 2GB' }, { status: 400 })
        }

        // Validate duration
        if (durationSeconds && durationSeconds > MAX_DURATION_SECONDS) {
            return NextResponse.json({ error: 'Video must be under 5 minutes' }, { status: 400 })
        }

        // Verify case ownership
        const { data: rentalCase, error: caseError } = await supabase
            .from('cases')
            .select('case_id, checkin_completed_at, handover_completed_at')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (caseError || !rentalCase) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
        }

        // Check if this phase is already locked
        if (phase === 'check-in' && rentalCase.checkin_completed_at) {
            return NextResponse.json({ error: 'Check-in is already locked' }, { status: 400 })
        }
        if (phase === 'handover' && rentalCase.handover_completed_at) {
            return NextResponse.json({ error: 'Handover is already locked' }, { status: 400 })
        }

        // Check if video already exists for this phase
        const { data: existingVideo } = await supabase
            .from('assets')
            .select('asset_id')
            .eq('case_id', caseId)
            .eq('type', 'walkthrough_video')
            .eq('phase', phase)
            .single()

        if (existingVideo) {
            return NextResponse.json({ error: 'Video already exists for this phase. Delete it first.' }, { status: 400 })
        }

        // Generate storage path
        const ext = fileName.split('.').pop()?.toLowerCase() || 'mp4'
        const storagePath = `${user.id}/${caseId}/videos/walkthrough_${phase.replace('-', '')}.${ext}`

        // Create signed upload URL
        const { data: signedUrl, error: signedError } = await supabase.storage
            .from('assets')
            .createSignedUploadUrl(storagePath)

        if (signedError || !signedUrl) {
            console.error('Failed to create signed URL:', signedError)
            return NextResponse.json({ error: 'Failed to prepare upload' }, { status: 500 })
        }

        // Create asset record (pending upload)
        const { data: asset, error: assetError } = await supabase
            .from('assets')
            .insert({
                case_id: caseId,
                user_id: user.id,
                type: 'walkthrough_video',
                storage_path: storagePath,
                mime_type: fileType,
                size_bytes: fileSize,
                file_hash: fileHash || null,
                phase,
                duration_seconds: durationSeconds || null,
                resolution: resolution || null,
                codec: codec || null
            })
            .select('asset_id')
            .single()

        if (assetError) {
            console.error('Failed to create asset:', assetError)
            return NextResponse.json({ error: 'Failed to create asset record' }, { status: 500 })
        }

        console.log('Video upload prepared:', {
            caseId,
            phase,
            assetId: asset.asset_id,
            storagePath
        })

        return NextResponse.json({
            uploadUrl: signedUrl.signedUrl,
            token: signedUrl.token,
            assetId: asset.asset_id,
            storagePath
        })

    } catch (err: any) {
        console.error('Video upload URL error:', err)
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
