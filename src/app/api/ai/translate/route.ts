import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// ============================================================
// SYSTEM PROMPT FOR TRANSLATION
// ============================================================
const TRANSLATION_SYSTEM_PROMPT = `You are a professional document translator.

Translate the document accurately and completely.
Preserve the original structure, numbering, and formatting.
Do not summarize.
Do not interpret legal meaning.
Do not add explanations.
Translate verbatim.

Return ONLY the translated text, nothing else.`

// ============================================================
// USER-SAFE ERROR RESPONSE
// ============================================================
function userSafeError(message: string, status: number = 400) {
    return NextResponse.json({
        error: message,
        userFriendly: true
    }, { status });
}

// ============================================================
// SUPPORTED LANGUAGES
// ============================================================
const SUPPORTED_LANGUAGES = [
    'English', 'French', 'German', 'Spanish', 'Italian', 'Portuguese',
    'Dutch', 'Russian', 'Arabic', 'Ukrainian', 'Chinese', 'Turkish',
    'Polish', 'Romanian', 'Greek', 'Hungarian', 'Czech', 'Swedish',
    'Danish', 'Finnish', 'Norwegian', 'Bulgarian', 'Croatian', 'Slovak',
    'Georgian', 'Albanian', 'Thai', 'Vietnamese', 'Korean', 'Japanese'
]

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(request: Request) {
    try {
        // Auth check
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return userSafeError('Please sign in to continue.', 401)
        }

        // Parse request
        const body = await request.json()
        const { contractText, targetLanguage, sourceLanguage } = body

        console.log('Translation request - target:', targetLanguage, 'source:', sourceLanguage)

        if (!contractText || contractText.length < 100) {
            return userSafeError('No contract text to translate.')
        }

        if (!targetLanguage) {
            return userSafeError('Please select a target language.')
        }

        // Check for API key
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.error('Missing OPENAI_API_KEY')
            return userSafeError('Translation is temporarily unavailable.', 503)
        }

        // Call OpenAI for translation
        const openai = new OpenAI({ apiKey })

        console.log('Calling OpenAI for translation, text length:', contractText.length)

        let response
        try {
            // Translate up to 20k chars (about 5000 tokens input)
            const textToTranslate = contractText.substring(0, 20000)
            console.log('Translating', textToTranslate.length, 'chars to', targetLanguage)

            response = await openai.chat.completions.create({
                model: 'gpt-4o-mini', // Fast model
                messages: [
                    { role: 'system', content: TRANSLATION_SYSTEM_PROMPT },
                    { role: 'user', content: `Translate this from ${sourceLanguage || 'French'} to ${targetLanguage}:\n\n${textToTranslate}` }
                ]
            })
            console.log('Translation received')
        } catch (aiError: any) {
            console.error('OpenAI translation error:', aiError.message)
            return userSafeError('Translation is temporarily unavailable.', 503)
        }

        // Extract translated text
        const translatedText = response.choices[0]?.message?.content

        if (!translatedText || translatedText.length < 100) {
            console.error('OpenAI returned empty or short translation')
            return userSafeError('We couldn\'t generate a translation. Please try again.')
        }

        console.log('Translation successful, length:', translatedText.length)

        return NextResponse.json({
            translatedText,
            sourceLanguage: sourceLanguage || 'detected',
            targetLanguage,
            characterCount: translatedText.length
        })

    } catch (error: any) {
        console.error('Translation error:', error)
        return userSafeError('Something went wrong. Please try again.')
    }
}
