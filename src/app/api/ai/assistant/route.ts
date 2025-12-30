import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { isAdminEmail } from '@/lib/admin'
import { SHORT_STAY_ASSISTANT_PROMPT } from '@/lib/ai-prompts'

// Lazy initialization to avoid build errors
function getOpenAIClient() {
    return new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has access (admin or purchased short_stay pack for the case)
    const isAdmin = isAdminEmail(user.email)

    try {
        const body = await request.json()
        const { caseId, messages, bookingContext } = body as {
            caseId: string
            messages: Message[]
            bookingContext?: {
                platform?: string
                checkIn?: string
                checkOut?: string
                arrivalPhotos?: number
                departurePhotos?: number
            }
        }

        if (!caseId || !messages || messages.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Verify ownership
        const { data: caseData } = await supabase
            .from('cases')
            .select('case_id, stay_type, platform_name, check_in_date, check_out_date')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!caseData) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 })
        }

        // For non-admins, check if they have the short_stay pack
        if (!isAdmin) {
            const { data: purchases } = await supabase
                .from('purchases')
                .select('pack_type')
                .eq('case_id', caseId)

            const hasShortStayPack = purchases?.some(p => p.pack_type === 'short_stay')

            if (!hasShortStayPack) {
                return NextResponse.json({ error: 'Short-stay pack required for AI Assistant' }, { status: 403 })
            }
        }

        // Build context-aware system prompt
        let contextPrompt = SHORT_STAY_ASSISTANT_PROMPT
        if (bookingContext) {
            contextPrompt += `\n\nCurrent booking context:
- Platform: ${bookingContext.platform || 'Not specified'}
- Check-in: ${bookingContext.checkIn || 'Not specified'}
- Check-out: ${bookingContext.checkOut || 'Not specified'}
- Arrival photos taken: ${bookingContext.arrivalPhotos || 0}
- Departure photos taken: ${bookingContext.departurePhotos || 0}`
        }

        // Call OpenAI
        const openai = getOpenAIClient()
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: contextPrompt },
                ...messages.map(m => ({ role: m.role, content: m.content }))
            ],
            max_tokens: 1000,
            temperature: 0.7
        })

        const reply = completion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

        return NextResponse.json({ reply })

    } catch (err: any) {
        console.error('Assistant API Error:', err)
        return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
    }
}
