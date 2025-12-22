import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// ============================================================
// POST - Get AI-powered reminder suggestions based on contract
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const { caseId } = await request.json()

        if (!caseId) {
            return NextResponse.json({ error: 'Missing case ID.' }, { status: 400 })
        }

        // Get case with contract analysis
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id, label, contract_analysis, lease_start, lease_end, country')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Case not found.' }, { status: 404 })
        }

        // Extract relevant contract info
        const analysis = rentalCase.contract_analysis?.analysis || {}
        const leaseEnd = rentalCase.lease_end || analysis.lease_end_date?.value
        const noticePeriod = analysis.notice_period?.value
        const depositInfo = analysis.deposit?.value
        const rentDueDay = analysis.rent_due_day?.value
        const specialClauses = analysis.special_clauses?.value
        const country = rentalCase.country

        // Build context for AI
        const contractContext = `
Rental property: ${rentalCase.label}
Country: ${country || 'Not specified'}
Lease end date: ${leaseEnd || 'Not found'}
Notice period: ${noticePeriod || 'Not found'}
Deposit: ${depositInfo || 'Not found'}
Rent due day: ${rentDueDay || 'Not found'}
Special clauses: ${specialClauses || 'None found'}
        `.trim()

        // Call OpenAI for suggestions
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            temperature: 0.3,
            messages: [
                {
                    role: 'system',
                    content: `You are a helpful assistant that suggests practical reminder dates for tenants based on their rental contract. 

Your goal is to suggest 3-5 useful reminders that help tenants:
- Not miss important deadlines
- Protect their deposit
- Stay organized with their tenancy

Be practical and specific. Each suggestion should include:
- A short label (max 30 chars)
- A specific date (YYYY-MM-DD format)
- A brief reason why this reminder is helpful (1 sentence)

If lease end date is available, calculate dates relative to it.
If information is missing, make reasonable assumptions or skip that type of reminder.

Today's date is: ${new Date().toISOString().split('T')[0]}`
                },
                {
                    role: 'user',
                    content: `Based on this rental contract, suggest helpful reminders:

${contractContext}

Return a JSON array with this format:
[
  { "label": "Reminder name", "date": "YYYY-MM-DD", "reason": "Why this is helpful" }
]

Only return the JSON array, nothing else.`
                }
            ]
        })

        const responseText = completion.choices[0]?.message?.content || '[]'

        // Parse JSON response
        let suggestions = []
        try {
            // Clean up response (remove markdown code blocks if present)
            const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
            suggestions = JSON.parse(cleaned)
        } catch (parseError) {
            console.error('Failed to parse AI response:', responseText)
            return NextResponse.json({
                suggestions: [],
                error: 'Could not generate suggestions. Please try again.'
            })
        }

        // Filter out past dates and validate format
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const validSuggestions = suggestions.filter((s: any) => {
            if (!s.label || !s.date || !s.reason) return false
            const suggestionDate = new Date(s.date)
            return suggestionDate >= today && !isNaN(suggestionDate.getTime())
        }).slice(0, 5) // Max 5 suggestions

        return NextResponse.json({ suggestions: validSuggestions })

    } catch (error: any) {
        console.error('Suggest reminders error:', error)
        return NextResponse.json({
            error: 'Something went wrong.',
            suggestions: []
        }, { status: 500 })
    }
}
