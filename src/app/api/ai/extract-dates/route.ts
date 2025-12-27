import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

/**
 * POST /api/ai/extract-dates
 * Extract renewal dates, notice periods, and minimum terms from related contract text
 * 
 * This is used to suggest reminders for service contracts - user must opt-in to create deadline.
 */
export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { contractId } = body

        if (!contractId) {
            return NextResponse.json({ error: 'Missing contractId' }, { status: 400 })
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

        // If dates already manually entered, return those
        if (contract.renewal_date || contract.end_date || contract.notice_period_days) {
            return NextResponse.json({
                extracted: true,
                renewalDate: contract.renewal_date || contract.end_date,
                noticePeriodDays: contract.notice_period_days,
                minTermEnd: contract.min_term_end,
                source: 'manual'
            })
        }

        // Build context from contract metadata for AI extraction
        let documentContext = `Contract Type: ${contract.contract_type}\n`
        if (contract.provider_name) documentContext += `Provider: ${contract.provider_name}\n`
        if (contract.label) documentContext += `Label: ${contract.label}\n`
        if (contract.start_date) documentContext += `Start Date: ${contract.start_date}\n`
        if (contract.end_date) documentContext += `End Date: ${contract.end_date}\n`
        if (contract.file_name) documentContext += `File Name: ${contract.file_name}\n`

        // Check for extracted data from previous AI analysis
        if (contract.extracted_data && Object.keys(contract.extracted_data).length > 0) {
            documentContext += `\nExtracted Information:\n${JSON.stringify(contract.extracted_data, null, 2)}\n`
        }

        // If no useful context, return empty
        if (!contract.start_date && !contract.file_name && !contract.extracted_data) {
            return NextResponse.json({
                extracted: false,
                message: 'Not enough information to extract dates. Please enter dates manually.'
            })
        }

        // Use AI to suggest dates if we have start date but no end date
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
        }

        const openai = new OpenAI({ apiKey })

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are analyzing a service contract to extract key dates and notice periods.
Based on the contract information provided, output a JSON object with these fields:
- renewalDate: The date when the contract renews (YYYY-MM-DD format, or null if unknown)
- noticePeriodDays: Number of days notice required to cancel (integer, or null if unknown)
- minTermEnd: When the minimum commitment period ends (YYYY-MM-DD format, or null if unknown)
- confidence: "high", "medium", or "low" based on how certain you are

Common patterns:
- 1-year internet contracts typically renew annually from start date
- 12-month minimum commitment is common
- 1-3 month notice periods are typical

ONLY output valid JSON, nothing else.`
                },
                {
                    role: 'user',
                    content: `Extract dates from this contract:\n\n${documentContext}`
                }
            ],
            max_tokens: 200,
            temperature: 0.3
        })

        const responseText = completion.choices[0]?.message?.content

        if (!responseText) {
            return NextResponse.json({
                extracted: false,
                message: 'Could not extract dates'
            })
        }

        try {
            // Parse JSON response
            const parsed = JSON.parse(responseText.trim())

            return NextResponse.json({
                extracted: true,
                renewalDate: parsed.renewalDate || null,
                noticePeriodDays: parsed.noticePeriodDays || null,
                minTermEnd: parsed.minTermEnd || null,
                confidence: parsed.confidence || 'low',
                source: 'ai'
            })
        } catch {
            return NextResponse.json({
                extracted: false,
                message: 'Could not parse extracted dates'
            })
        }

    } catch (error: any) {
        console.error('Extract dates error:', error)
        return NextResponse.json({ error: error.message || 'Extraction failed' }, { status: 500 })
    }
}
