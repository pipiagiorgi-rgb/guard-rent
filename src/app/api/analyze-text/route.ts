import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const SYSTEM_PROMPT = `You are an information extraction assistant for rental contracts.
Return ONLY valid JSON. No markdown, no explanations.`

const USER_PROMPT = `Extract these fields from the contract text below. Return JSON with this structure:
{
  "lease_start_date": { "value": "...", "confidence": "high/medium/low" },
  "lease_end_date": { "value": "...", "confidence": "high/medium/low" },
  "notice_period": { "value": "...", "confidence": "high/medium/low" },
  "rent_amount": { "value": "...", "confidence": "high/medium/low" },
  "jurisdiction_or_country": { "value": "...", "confidence": "high/medium/low" },
  "document_language": { "value": "...", "confidence": "high/medium/low" }
}

If a field is not found, set value to "not found".

Contract text:
`

export async function POST(request: Request) {
    try {
        const { text } = await request.json()

        if (!text || text.length < 100) {
            return NextResponse.json({
                error: 'Please provide contract text (min 100 chars)'
            }, { status: 400 })
        }

        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'OpenAI not configured' }, { status: 500 })
        }

        console.log('Direct text analysis - input length:', text.length)

        const openai = new OpenAI({ apiKey })

        // Use mini for speed, limit text to 10k chars
        const textToAnalyze = text.substring(0, 10000)

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: USER_PROMPT + textToAnalyze }
            ],
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        console.log('Analysis response:', content?.substring(0, 500))

        if (!content) {
            return NextResponse.json({ error: 'Empty response from OpenAI' }, { status: 500 })
        }

        const analysis = JSON.parse(content)

        return NextResponse.json({
            success: true,
            analysis,
            inputLength: text.length,
            analyzedLength: textToAnalyze.length,
            usage: response.usage
        })

    } catch (error: any) {
        console.error('Analysis error:', error.message)
        return NextResponse.json({
            error: error.message
        }, { status: 500 })
    }
}
