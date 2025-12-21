import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Simple test endpoint to verify OpenAI is working
export async function GET() {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
        return NextResponse.json({
            success: false,
            error: 'OPENAI_API_KEY not configured'
        })
    }

    console.log('Testing OpenAI connection...')

    try {
        const openai = new OpenAI({ apiKey })

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini', // Use mini for speed
            messages: [
                {
                    role: 'user',
                    content: 'Return exactly this JSON: {"status": "ok", "message": "OpenAI is working"}'
                }
            ],
            response_format: { type: 'json_object' }
        })

        const content = response.choices[0]?.message?.content
        console.log('OpenAI test response:', content)

        return NextResponse.json({
            success: true,
            response: content,
            model: response.model,
            usage: response.usage
        })
    } catch (error: any) {
        console.error('OpenAI test failed:', error.message)
        return NextResponse.json({
            success: false,
            error: error.message
        })
    }
}
