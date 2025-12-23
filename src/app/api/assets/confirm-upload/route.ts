import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { assetId, caseId } = await request.json()

        if (!assetId || !caseId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // 1. Fetch asset record to get storage path and client hash
        const { data: asset } = await supabase
            .from('assets')
            .select('storage_path, file_hash')
            .eq('asset_id', assetId)
            .eq('case_id', caseId)
            .single()

        if (!asset) {
            return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
        }

        // 2. Download file from storage
        const { data: fileData, error: storageError } = await supabase.storage
            .from('guard-rent')
            .download(asset.storage_path)

        if (storageError || !fileData) {
            console.error('Download error:', storageError)
            return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 })
        }

        // 3. Compute Server-Side Hash
        const arrayBuffer = await fileData.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const hash = crypto.createHash('sha256').update(buffer).digest('hex')

        // 4. Update Asset Record
        const { error: updateError } = await supabase
            .from('assets')
            .update({
                file_hash_server: hash,
                size_bytes: fileData.size,
                mime_type: fileData.type
            })
            .eq('asset_id', assetId)

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json({ error: 'Failed to update asset' }, { status: 500 })
        }

        // 5. Audit Log: Upload Completed
        await supabase.from('audit_logs').insert({
            case_id: caseId,
            user_id: user.id,
            action: 'upload_completed',
            details: {
                asset_id: assetId,
                server_hash: hash,
                client_hash_match: asset.file_hash === hash,
                size_bytes: fileData.size
            }
        })

        return NextResponse.json({
            success: true,
            verified: asset.file_hash === hash
        })

    } catch (err: any) {
        console.error('Confirm Upload Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
