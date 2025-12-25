import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/related-contracts/[id]
 * Get a single related contract
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const { data: contract, error } = await supabase
        .from('related_contracts')
        .select('*')
        .eq('contract_id', id)
        .eq('user_id', user.id)
        .single()

    if (error || !contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    return NextResponse.json({ contract })
}

/**
 * PATCH /api/related-contracts/[id]
 * Update a related contract
 */
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()

    // Only allow updating specific fields
    const allowedFields = ['contract_type', 'custom_type', 'provider_name', 'start_date', 'end_date', 'notice_period_days', 'notice_period_source', 'storage_path', 'file_name', 'extracted_data']
    const updates: Record<string, any> = { updated_at: new Date().toISOString() }

    for (const field of allowedFields) {
        if (body[field] !== undefined) {
            updates[field] = body[field]
        }
    }

    const { data: contract, error } = await supabase
        .from('related_contracts')
        .update(updates)
        .eq('contract_id', id)
        .eq('user_id', user.id)
        .select()
        .single()

    if (error) {
        console.error('Error updating related contract:', error)
        return NextResponse.json({ error: 'Failed to update contract' }, { status: 500 })
    }

    return NextResponse.json({ contract })
}

/**
 * DELETE /api/related-contracts/[id]
 * Delete a related contract
 */
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get contract to check ownership and get storage path
    const { data: contract } = await supabase
        .from('related_contracts')
        .select('contract_id, storage_path')
        .eq('contract_id', id)
        .eq('user_id', user.id)
        .single()

    if (!contract) {
        return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
    }

    // Delete from storage if exists
    if (contract.storage_path) {
        await supabase.storage
            .from('guard-rent')
            .remove([contract.storage_path])
    }

    // Delete record
    const { error } = await supabase
        .from('related_contracts')
        .delete()
        .eq('contract_id', id)
        .eq('user_id', user.id)

    if (error) {
        console.error('Error deleting related contract:', error)
        return NextResponse.json({ error: 'Failed to delete contract' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
