import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { caseId, filename, mimeType, type, roomId, fileHash } = body

        if (!caseId || !filename || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify ownership of the case
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found or access denied' }, { status: 404 })
        }

        // Generate unique asset ID and path
        const assetId = uuidv4()
        const extension = filename.split('.').pop()
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
                mime_type: mimeType,
                size_bytes: 0,
                room_id: roomId || null,
                file_hash: fileHash || null // Integrity hash
            })

        // 2. Audit Log (Evidence Integrity)
        if (!dbError) {
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
        }

        if (dbError) {
            console.error('DB Insert Error:', dbError)
            return NextResponse.json({ error: 'Database error' }, { status: 500 })
        }

        // 2. Generate Signed Upload URL
        // Bucket name from spec: 'guard-rent'
        const { data: signedUrlData, error: storageError } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUploadUrl(storagePath)

        if (storageError) {
            console.error('Storage Error:', storageError)
            return NextResponse.json({ error: 'Storage signing error' }, { status: 500 })
        }

        return NextResponse.json({
            assetId,
            storagePath,
            signedUrl: signedUrlData.signedUrl,
            path: signedUrlData.path, // token included
            publicUrl: null // Private bucket
        })

    } catch (err) {
        console.error('Upload API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
