'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteCase(caseId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // 1. Delete storage objects first (optional, or rely on bucket policy/cron if cascade doesn't work for storage)
    // Supabase storage doesn't auto-cascade from DB rows usually. 
    // We should list and delete.
    const { data: assets } = await supabase.from('assets').select('storage_path').eq('case_id', caseId)

    if (assets && assets.length > 0) {
        const paths = assets.map(a => a.storage_path)
        await supabase.storage.from('guard-rent').remove(paths)
    }

    // 2. Delete DB Row (Cascades to assets, outputs)
    const { error } = await supabase
        .from('cases')
        .delete()
        .eq('case_id', caseId)
        .eq('user_id', user.id)

    if (error) {
        console.error('Delete error', error)
        throw new Error('Failed to delete case')
    }

    // 3. Log Audit (Optional, handled by trigger or here)
    await supabase.from('deletion_audit').insert({
        case_id: caseId,
        reason: 'user_request',
        objects_deleted: assets?.length || 0
    })

    redirect('/app')
}
