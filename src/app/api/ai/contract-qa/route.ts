import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { LEASE_QA_PROMPT } from '@/lib/ai-prompts'

// ============================================================
// BLOCKED QUESTION PATTERNS
// ============================================================
const BLOCKED_PATTERNS = [
    /should i/i,
    /what should/i,
    /do i have to/i,
    /am i required/i,
    /can i sue/i,
    /is this legal/i,
    /is this enforceable/i,
    /is this allowed/i,
    /can they do this/i,
    /what are my rights/i,
    /what can i do/i,
    /is this fair/i,
    /can i break/i,
    /will i win/i,
    /legal action/i,
    /take them to court/i,
    /sue my landlord/i,
    /is this binding/i,
    /legally obligated/i,
    /my options/i,
    /advise me/i,
    /your advice/i,
    /recommend/i,
]

function isBlockedQuestion(question: string): boolean {
    return BLOCKED_PATTERNS.some(pattern => pattern.test(question))
}

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Please sign in.' }, { status: 401 })
        }

        const body = await request.json()
        const { caseId, question } = body

        if (!caseId || !question) {
            return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
        }

        // Trim and validate question
        const trimmedQuestion = question.trim()
        if (trimmedQuestion.length < 3) {
            return NextResponse.json({ error: 'Question is too short.' }, { status: 400 })
        }
        if (trimmedQuestion.length > 500) {
            return NextResponse.json({ error: 'Question is too long (max 500 characters).' }, { status: 400 })
        }

        // Check for blocked questions (client-side backup)
        if (isBlockedQuestion(trimmedQuestion)) {
            return NextResponse.json({
                answer: "I can help explain what the contract says, but I can't provide legal advice. Try asking me to find specific information like dates, amounts, or clauses.",
                blocked: true
            })
        }

        // Fetch contract text and structured data
        const { data: rentalCase, error: fetchError } = await supabase
            .from('cases')
            .select('contract_analysis, address, country, lease_start, lease_end')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (fetchError || !rentalCase) {
            return NextResponse.json({ error: 'Contract not found.' }, { status: 404 })
        }

        const contractText = rentalCase.contract_analysis?.extractedText
        if (!contractText || contractText.length < 100) {
            return NextResponse.json({
                error: 'No contract text available. Please upload and analyze a contract first.'
            }, { status: 400 })
        }

        // Construct Known Facts Block
        const facts = []
        if (rentalCase.address) facts.push(`Property Address: ${rentalCase.address}`)
        if (rentalCase.country) facts.push(`Jurisdiction/Country: ${rentalCase.country}`)
        if (rentalCase.lease_start) facts.push(`Lease Start Date: ${rentalCase.lease_start}`)
        if (rentalCase.lease_end) facts.push(`Lease End Date: ${rentalCase.lease_end}`)

        // Add rent info from analysis if available (since it's not a top-level column)
        const rentAmount = rentalCase.contract_analysis?.analysis?.rent_amount?.value
        if (rentAmount && rentAmount !== 'not found') facts.push(`Rent Amount: ${rentAmount}`)

        const knownFacts = facts.length > 0
            ? `KNOWN FACTS (Database Records - PRIORITIZE THESE):\n${facts.join('\n')}\n\n`
            : ''

        // Call OpenAI
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: 'Service temporarily unavailable.' }, { status: 503 })
        }

        const openai = new OpenAI({ apiKey })

        // Limit contract text to avoid token limits
        const limitedText = contractText.substring(0, 15000)

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: LEASE_QA_PROMPT },
                {
                    role: 'user',
                    content: `CONTRACT TEXT:\n${limitedText}\n\n---\n\n${knownFacts}QUESTION: ${trimmedQuestion}`
                }
            ],
            max_tokens: 1000, // Increased to allow for drafting emails/notices
            temperature: 0.3
        })

        const answer = response.choices[0]?.message?.content?.trim()

        if (!answer) {
            return NextResponse.json({ error: 'Could not generate an answer.' }, { status: 500 })
        }

        return NextResponse.json({ answer })

    } catch (error: any) {
        console.error('Contract QA error:', error)
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 })
    }
}
