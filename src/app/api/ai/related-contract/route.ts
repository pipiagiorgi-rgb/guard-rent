import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { extractText } from 'unpdf'
import { DOCUMENT_VAULT_PROMPT } from '@/lib/ai-prompts'

/**
 * POST /api/ai/related-contract
 * AI assistant for related contracts (summarize, translate, Q&A, draft notice)
 * 
 * This is document-scoped AI - only context from the specific related contract is used.
 * Related contracts are reference-only documents (NOT sealed evidence).
 */

// Helper to extract text from PDF
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
    try {
        const uint8Array = new Uint8Array(buffer)
        const { text } = await extractText(uint8Array)
        const fullText = Array.isArray(text) ? text.join('\n\n') : String(text || '')
        return fullText.trim()
    } catch (error: any) {
        console.error('PDF extraction error:', error.message)
        return ''
    }
}

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

        // For Q&A questions, fetch actual PDF content to provide better answers
        let pdfContent = ''
        if (action === 'question' && contract.storage_path) {
            try {
                const { data: signedData } = await supabase.storage
                    .from('guard-rent')
                    .createSignedUrl(contract.storage_path, 120)

                if (signedData?.signedUrl) {
                    const pdfResponse = await fetch(signedData.signedUrl)
                    if (pdfResponse.ok) {
                        const pdfBuffer = await pdfResponse.arrayBuffer()
                        pdfContent = await extractTextFromPDF(pdfBuffer)
                        console.log('PDF content extracted for Q&A, length:', pdfContent.length)
                    }
                }
            } catch (pdfError: any) {
                console.error('Could not fetch PDF for Q&A:', pdfError.message)
            }
        }

        // Check for API key
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
        }

        const openai = new OpenAI({ apiKey })

        let userPrompt = ''

        switch (action) {
            case 'summarize':
                userPrompt = `Summarize this service contract in a few short paragraphs:\n\n${documentContext}`
                break

            case 'translate':
                const lang = targetLanguage || 'English'
                userPrompt = `Translate the following contract information to ${lang}:\n\n${documentContext}`
                break

            case 'question':
                if (!question) {
                    return NextResponse.json({ error: 'Missing question' }, { status: 400 })
                }
                // Include PDF content if available for better answers
                const fullContext = pdfContent
                    ? `${documentContext}\n\n--- Document Content ---\n${pdfContent.substring(0, 6000)}`
                    : documentContext
                userPrompt = `Based on this contract information:\n\n${fullContext}\n\nQuestion: ${question}`
                break

            case 'draft_notice':
                userPrompt = `Draft a polite, professional cancellation notice for this service contract. Include placeholder [YOUR NAME] and [YOUR ADDRESS] where personal details should go:\n\n${documentContext}`
                break

            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
        }

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: DOCUMENT_VAULT_PROMPT },
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
