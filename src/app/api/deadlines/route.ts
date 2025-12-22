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
        const { caseId, type, date, dueDay, offsets, rentalLabel, noticeMethod, label } = body

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

        // Build preferences object
        const preferences: Record<string, any> = { offsets }
        if (type === 'rent_payment') preferences.dueDay = dueDay
        if (type === 'termination_notice') preferences.noticeMethod = noticeMethod
        if (type === 'custom') preferences.label = label

        let reminderId: string | undefined

        // For custom reminders, always insert new (no upsert)
        if (type === 'custom') {
            const { data: newReminder, error: insertError } = await supabase
                .from('deadlines')
                .insert({
                    case_id: caseId,
                    type,
                    due_date: deadlineDate,
                    preferences,
                    created_at: new Date().toISOString()
                })
                .select('id')
                .single()

            if (insertError) {
                console.error('Custom deadline insert error:', insertError)
                return NextResponse.json({ error: 'Failed to save reminder.' }, { status: 500 })
            }

            reminderId = newReminder?.id
        } else {
            // For standard reminders, upsert (replace if exists)
            const { error: upsertError } = await supabase
                .from('deadlines')
                .upsert({
                    case_id: caseId,
                    type,
                    due_date: deadlineDate,
                    preferences,
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
                            due_date: deadlineDate,
                            preferences
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
        }

        // Send confirmation email for ALL reminder types
        try {
            await sendReminderConfirmationEmail({
                to: user.email!,
                type: type as 'termination_notice' | 'rent_payment' | 'custom',
                rentalLabel,
                date: deadlineDate,
                offsets,
                noticeMethod,
                dueDay,
                customLabel: label
            })
        } catch (emailError) {
            // Log but don't fail the request if email fails
            console.error('Failed to send confirmation email:', emailError)
        }

        return NextResponse.json({ success: true, id: reminderId })

    } catch (error: any) {
        console.error('Deadline API error:', error)
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
}

// ============================================================
// DELETE - Remove a reminder
// ============================================================
export async function DELETE(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, type, id } = body

        if (!caseId || !type) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        // Verify ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        // For custom reminders, delete by ID
        if (type === 'custom' && id) {
            await supabase
                .from('deadlines')
                .delete()
                .eq('id', id)
                .eq('case_id', caseId)
        } else {
            // For standard reminders, delete by type
            await supabase
                .from('deadlines')
                .delete()
                .eq('case_id', caseId)
                .eq('type', type)
        }

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Deadline delete error:', error)
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
}
