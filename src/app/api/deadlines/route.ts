import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendReminderConfirmationEmail } from '@/lib/email'

// ============================================================
// POST - Create or update a reminder
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, type, date, dueDay, offsets, rentalLabel, noticeMethod } = body

        if (!caseId || !type) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        // Verify case ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id, user_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        // Calculate the actual date for rent payments
        let deadlineDate = date
        if (type === 'rent_payment' && dueDay) {
            // Next occurrence of rent due date
            const now = new Date()
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), parseInt(dueDay))
            if (thisMonth <= now) {
                thisMonth.setMonth(thisMonth.getMonth() + 1)
            }
            deadlineDate = thisMonth.toISOString().split('T')[0]
        }

        // Upsert the deadline (replace if exists)
        const { error: upsertError } = await supabase
            .from('deadlines')
            .upsert({
                case_id: caseId,
                type,
                date: deadlineDate,
                preferences: {
                    offsets,
                    dueDay: type === 'rent_payment' ? dueDay : null,
                    noticeMethod: type === 'termination_notice' ? noticeMethod : null
                },
                created_at: new Date().toISOString()
            }, {
                onConflict: 'case_id,type'
            })

        if (upsertError) {
            console.error('Deadline upsert error:', upsertError)

            // If unique constraint error, try update instead
            if (upsertError.code === '23505' || upsertError.code === '42P10') {
                const { error: updateError } = await supabase
                    .from('deadlines')
                    .update({
                        date: deadlineDate,
                        preferences: {
                            offsets,
                            dueDay: type === 'rent_payment' ? dueDay : null,
                            noticeMethod: type === 'termination_notice' ? noticeMethod : null
                        }
                    })
                    .eq('case_id', caseId)
                    .eq('type', type)

                if (updateError) {
                    console.error('Deadline update error:', updateError)
                    return NextResponse.json({ error: 'Failed to save reminder.' }, { status: 500 })
                }
            } else {
                return NextResponse.json({ error: 'Failed to save reminder.' }, { status: 500 })
            }
        }

        // Send confirmation email using centralized email utility
        await sendReminderConfirmationEmail({
            to: user.email!,
            type: type as 'termination_notice' | 'rent_payment',
            rentalLabel,
            date: deadlineDate,
            offsets,
            noticeMethod,
            dueDay
        })

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Deadline API error:', error)
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
}

// ============================================================
// DELETE - Disable a reminder
// ============================================================
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, type } = body

        if (!caseId || !type) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        // Verify ownership and delete
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        await supabase
            .from('deadlines')
            .delete()
            .eq('case_id', caseId)
            .eq('type', type)

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Deadline delete error:', error)
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
}
