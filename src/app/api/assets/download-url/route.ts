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
        const { assetId } = body

        if (!assetId) {
            return NextResponse.json({ error: 'Missing assetId' }, { status: 400 })
        }

        // Verify ownership and get path
        const { data: asset } = await supabase
            .from('assets')
            .select('storage_path, user_id')
            .eq('asset_id', assetId)
            .single()

        if (!asset || asset.user_id !== user.id) {
            return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 })
        }

        // Generate Signed Download URL (valid for 60 seconds is usually enough for redirect or immediate fetch)
        const { data: sigData, error: storageError } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUrl(asset.storage_path, 60)

        if (storageError) {
            console.error('Storage Sign Error:', storageError)
            return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
        }

        return NextResponse.json({
            signedUrl: sigData.signedUrl
        })

    } catch (err) {
        console.error('Download API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
