import { NextResponse } from 'next/server'
import OpenAI from 'openai'

export async function GET() {
    try {
        const apiKey = process.env.OPENAI_API_KEY

        if (!apiKey) {
            return NextResponse.json({
                error: 'OPENAI_API_KEY not found in environment variables',
                envKeys: Object.keys(process.env).filter(k => k.includes('OPENAI') || k.includes('API'))
            }, { status: 500 })
        }

        console.log('Testing OpenAI with key starting with:', apiKey.substring(0, 10) + '...')

        const openai = new OpenAI({ apiKey })

        const response = await openai.chat.completions.create({
            model: 'gpt-4o',
            max_tokens: 50,
            messages: [
                {
                    role: 'system',
                    content: 'Return ONLY valid JSON. Do not include any text outside JSON.'
                },
                {
                    role: 'user',
                    content: 'Say OK in JSON format like {"status": "ok"}'
                }
            ],
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        console.log('OpenAI response:', content)

        return NextResponse.json({
            success: true,
            openai_response: content,
            parsed: JSON.parse(content || '{}'),
            model_used: response.model,
            usage: response.usage
        })

    } catch (error: any) {
        console.error('OpenAI test error:', error)
        return NextResponse.json({
            error: error.message,
            type: error.constructor.name,
            status: error.status || 'unknown'
        }, { status: 500 })
    }
}
