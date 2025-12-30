import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { trackMetric } from '@/lib/metrics'
import { isAdminEmail } from '@/lib/admin'

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = isAdminEmail(user.email)

    try {
        const body = await request.json()
        const { assetId, forceDownload, fileName } = body

        if (!assetId) {
            return NextResponse.json({ error: 'Missing assetId' }, { status: 400 })
        }

        // Verify ownership and get path + case info
        const { data: asset } = await supabase
            .from('assets')
            .select('storage_path, user_id, type, case_id, phase')
            .eq('asset_id', assetId)
            .single()

        if (!asset || asset.user_id !== user.id) {
            return NextResponse.json({ error: 'Asset not found or access denied' }, { status: 404 })
        }

        // Determine download filename
        const downloadFileName = fileName || asset.storage_path.split('/').pop() || 'download'

        // Generate Signed Download URL with optional download header
        const options: { download?: string | boolean } = {}
        if (forceDownload) {
            options.download = downloadFileName
        }

        const { data: sigData, error: storageError } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUrl(asset.storage_path, 60, options)

        if (storageError) {
            console.error('Storage Sign Error:', storageError)
            return NextResponse.json({ error: 'Failed to generate download link' }, { status: 500 })
        }

        // Track video download metric (only for forceDownload which is actual download intent)
        if (forceDownload && asset.type === 'walkthrough_video' && asset.case_id) {
            // Get case stay_type for metrics
            const { data: caseData } = await supabase
                .from('cases')
                .select('stay_type')
                .eq('case_id', asset.case_id)
                .single()

            await trackMetric({
                event: 'video_downloaded',
                case_id: asset.case_id,
                user_id: user.id,
                stay_type: caseData?.stay_type || 'long_term',
                asset_type: 'walkthrough_video',
                phase: asset.phase || undefined,
                is_admin: isAdmin,
            })
        }

        return NextResponse.json({
            signedUrl: sigData.signedUrl
        }, {
            headers: {
                'Cache-Control': 'private, max-age=55' // Cache for duration of signed URL minus buffer
            }
        })

    } catch (err) {
        console.error('Download API Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

