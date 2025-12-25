import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            console.error('Auth error:', authError)
            return NextResponse.json({ error: 'Authentication failed', details: authError.message }, { status: 401 })
        }

        if (!user) {
            console.error('No user found in session')
            return NextResponse.json({ error: 'Not authenticated - please log in again' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, filename, mimeType, type, roomId, fileHash } = body

        if (!caseId || !filename || !type) {
            console.error('Missing fields:', { caseId: !!caseId, filename: !!filename, type: !!type })
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify ownership of the case
        const { data: rentalCase, error: caseError } = await supabase
            .from('cases')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (caseError) {
            console.error('Case query error:', caseError)
        }

        if (!rentalCase) {
            console.error('Case not found:', { caseId, userId: user.id })
            return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 })
        }

        // Generate unique asset ID and path
        const assetId = uuidv4()
        const extension = filename.split('.').pop() || 'jpg'
        const storagePath = `cases/${caseId}/${type}s/${assetId}.${extension}`

        // 1. Create DB Record first
        const { error: dbError } = await supabase
            .from('assets')
            .insert({
                asset_id: assetId,
                case_id: caseId,
                user_id: user.id,
                type: type,
                storage_path: storagePath,
                mime_type: mimeType || 'image/jpeg',
                original_name: filename,
                size_bytes: 0,
                room_id: roomId || null,
                file_hash: fileHash || null
            })

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            return NextResponse.json({ error: 'Failed to create asset record', details: dbError.message }, { status: 500 })
        }

        // 2. Audit Log (Evidence Integrity) - non-blocking
        try {
            await supabase.from('audit_logs').insert({
                case_id: caseId,
                user_id: user.id,
                action: 'upload_initiated',
                details: {
                    asset_id: assetId,
                    type,
                    filename,
                    room_id: roomId,
                    file_hash: fileHash
                }
            })
        } catch (auditErr) {
            console.error('Audit log error:', auditErr)
        }

        // 3. Generate Signed Upload URL
        const { data: signedUrlData, error: storageError } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUploadUrl(storagePath)

        if (storageError) {
            console.error('Storage Error:', storageError)
            return NextResponse.json({ error: 'Failed to create upload URL', details: storageError.message }, { status: 500 })
        }

        if (!signedUrlData?.signedUrl) {
            console.error('No signed URL returned')
            return NextResponse.json({ error: 'Storage service unavailable' }, { status: 500 })
        }

        return NextResponse.json({
            assetId,
            storagePath,
            signedUrl: signedUrlData.signedUrl,
            path: signedUrlData.path,
            publicUrl: null
        })

    } catch (err: any) {
        console.error('Upload API Error:', err)
        return NextResponse.json({
            error: 'Server error',
            details: err?.message || 'Unknown error'
        }, { status: 500 })
    }
}
