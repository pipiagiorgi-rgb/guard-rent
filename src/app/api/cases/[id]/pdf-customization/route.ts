import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

interface PdfCustomization {
    personal_notes?: string | null
    property_rating?: number | null
    property_review?: string | null
    custom_title?: string | null
    custom_content?: string | null
    include_personal_notes?: boolean
    include_property_review?: boolean
    include_custom_section?: boolean
}

// GET - Fetch PDF customization
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id: caseId } = await params

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { data: rentalCase, error } = await supabase
            .from('cases')
            .select('pdf_customization')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (error || !rentalCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        return NextResponse.json({
            success: true,
            data: rentalCase.pdf_customization || {}
        })

    } catch (err: any) {
        console.error('GET pdf-customization error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// PUT - Save PDF customization
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    const { id: caseId } = await params

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body: PdfCustomization = await request.json()

        // Verify ownership
        const { data: existing } = await supabase
            .from('cases')
            .select('user_id')
            .eq('case_id', caseId)
            .single()

        if (!existing || existing.user_id !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        // Update
        const { error: updateError } = await supabase
            .from('cases')
            .update({ pdf_customization: body })
            .eq('case_id', caseId)

        if (updateError) {
            console.error('Update error:', updateError)
            return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            saved_at: new Date().toISOString()
        })

    } catch (err: any) {
        console.error('PUT pdf-customization error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
