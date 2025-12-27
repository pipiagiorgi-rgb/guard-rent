import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

/**
 * POST /api/ai/related-contract
 * AI assistant for related contracts (summarize, translate, Q&A, draft notice)
 * 
 * This is document-scoped AI - only context from the specific related contract is used.
 * Related contracts are reference-only documents (NOT sealed evidence).
 */
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { contractId, action, question, targetLanguage } = body

        if (!contractId || !action) {
            return NextResponse.json({ error: 'Missing contractId or action' }, { status: 400 })
        }

        // Get the related contract
        const { data: contract, error: contractError } = await supabase
            .from('related_contracts')
            .select('*')
            .eq('contract_id', contractId)
            .eq('user_id', user.id)
            .single()

        if (contractError || !contract) {
            return NextResponse.json({ error: 'Contract not found' }, { status: 404 })
        }

        // Build context from contract metadata
        let documentContext = `Contract Type: ${contract.contract_type}\n`
        if (contract.provider_name) documentContext += `Provider: ${contract.provider_name}\n`
        if (contract.label) documentContext += `Label: ${contract.label}\n`
        if (contract.start_date) documentContext += `Start Date: ${contract.start_date}\n`
        if (contract.end_date) documentContext += `End Date: ${contract.end_date}\n`
        if (contract.notice_period_days) documentContext += `Notice Period: ${contract.notice_period_days} days\n`
        if (contract.renewal_date) documentContext += `Renewal Date: ${contract.renewal_date}\n`
        if (contract.min_term_end) documentContext += `Minimum Term Ends: ${contract.min_term_end}\n`

        // If there's extracted data, include it
        if (contract.extracted_data && Object.keys(contract.extracted_data).length > 0) {
            documentContext += `\nExtracted Information:\n${JSON.stringify(contract.extracted_data, null, 2)}\n`
        }

        // Check for API key
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
        }

        const openai = new OpenAI({ apiKey })

        let systemPrompt = ''
        let userPrompt = ''

        switch (action) {
            case 'summarize':
                systemPrompt = `You are a helpful assistant that summarizes service contracts clearly and concisely. 
Focus on key information: what the service is, who provides it, the term, renewal conditions, and any notice requirements.
Keep your summary to 3-5 bullet points. Be factual and neutral.`
                userPrompt = `Summarize this service contract:\n\n${documentContext}`
                break

            case 'translate':
                const lang = targetLanguage || 'English'
                systemPrompt = `You are a professional translator. Translate the contract details accurately while maintaining legal meaning.`
                userPrompt = `Translate the following contract information to ${lang}:\n\n${documentContext}`
                break

            case 'question':
                if (!question) {
                    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
                }
                systemPrompt = `You are a helpful assistant answering questions about service contracts.
Only answer based on the information provided. If you don't have enough information, say so clearly.
Be concise and factual. Do not make assumptions or provide legal advice.`
                userPrompt = `Based on this contract information:\n\n${documentContext}\n\nQuestion: ${question}`
                break

            case 'draft_notice':
                systemPrompt = `You are a helpful assistant that drafts professional cancellation or notice emails.
Write a polite, professional email that can be sent to terminate or give notice on a service contract.
Include placeholder [YOUR NAME] and [YOUR ADDRESS] where personal details should go.
Keep it brief and to the point.`
                userPrompt = `Draft a cancellation notice email for this service contract:\n\n${documentContext}\n\nThe email should notify the provider of the intent to cancel/not renew the service.`
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            max_tokens: 1000,
            temperature: 0.7
        })

        const response = completion.choices[0]?.message?.content

        if (!response) {
            return NextResponse.json({ error: 'Empty AI response' }, { status: 500 })
        }

        return NextResponse.json({
            response,
            action,
            contractId
        })

    } catch (error: any) {
        console.error('Related contract AI error:', error)
        return NextResponse.json({ error: error.message || 'AI request failed' }, { status: 500 })
    }
}
