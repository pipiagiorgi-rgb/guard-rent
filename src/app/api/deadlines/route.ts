import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendReminderConfirmationEmail } from '@/lib/email'

// ============================================================
// POST - Create or update a reminder
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            console.error('Deadline auth error:', authError)
            return NextResponse.json({ error: 'Authentication failed.' }, { status: 401 })
        }

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const body = await request.json()
        console.log('Deadline API body:', JSON.stringify(body, null, 2))
        const { caseId, type, date, dueDay, offsets, rentalLabel, noticeMethod, label } = body

        if (!caseId || !type) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        // Verify case ownership and get contract data for email
        const { data: rentalCase, error: caseError } = await supabase
            .from('cases')
            .select('case_id, user_id, contract_analysis, lease_end')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (caseError) {
            console.error('Case query error:', caseError)
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        // Extract rent amount and lease end from contract for email
        const contractRentAmount = rentalCase.contract_analysis?.analysis?.rent_amount?.value
        const contractLeaseEnd = rentalCase.lease_end || rentalCase.contract_analysis?.analysis?.lease_end_date?.value

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

        // Validate date is present for non-rent types
        if (!deadlineDate && type !== 'rent_payment') {
            console.error('Missing date for deadline type:', type)
            return NextResponse.json({ error: 'Please provide a valid date.' }, { status: 400 })
        }

        // For custom reminders, delete any existing with same label first (workaround for unique constraint)
        if (type === 'custom') {
            console.log('Creating custom deadline:', { caseId, type, date: deadlineDate, preferences })

            // Delete existing custom reminder with same label to allow re-setting
            if (label) {
                await supabase
                    .from('deadlines')
                    .delete()
                    .eq('case_id', caseId)
                    .eq('type', 'custom')
                    .contains('preferences', { label })
            }

            const { data: newReminder, error: insertError } = await supabase
                .from('deadlines')
                .insert({
                    case_id: caseId,
                    type,
                    date: deadlineDate,
                    preferences,
                    created_at: new Date().toISOString()
                })
                .select('deadline_id')
                .single()

            if (insertError) {
                console.error('Custom deadline insert error:', JSON.stringify(insertError, null, 2))
                return NextResponse.json({
                    error: `Failed to save reminder: ${insertError.message || insertError.code || 'Unknown error'}`
                }, { status: 500 })
            }

            reminderId = newReminder?.deadline_id
            console.log('Custom deadline created:', reminderId)
        } else {
            // For standard reminders, check if exists first then update or insert
            const { data: existing } = await supabase
                .from('deadlines')
                .select('deadline_id')
                .eq('case_id', caseId)
                .eq('type', type)
                .single()

            if (existing) {
                // Update existing reminder
                const { error: updateError } = await supabase
                    .from('deadlines')
                    .update({
                        date: deadlineDate,
                        preferences
                    })
                    .eq('deadline_id', existing.deadline_id)

                if (updateError) {
                    console.error('Deadline update error:', updateError)
                    return NextResponse.json({ error: 'Failed to save reminder.' }, { status: 500 })
                }
                reminderId = existing.deadline_id
            } else {
                // Insert new reminder
                const { data: newReminder, error: insertError } = await supabase
                    .from('deadlines')
                    .insert({
                        case_id: caseId,
                        type,
                        date: deadlineDate,
                        preferences,
                        created_at: new Date().toISOString()
                    })
                    .select('deadline_id')
                    .single()

                if (insertError) {
                    console.error('Deadline insert error:', insertError)
                    return NextResponse.json({ error: 'Failed to save reminder.' }, { status: 500 })
                }
                reminderId = newReminder?.deadline_id
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
                customLabel: label,
                rentAmount: contractRentAmount,
                leaseEndDate: contractLeaseEnd
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
                .eq('deadline_id', id)  // Column is 'deadline_id', not 'id'
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
