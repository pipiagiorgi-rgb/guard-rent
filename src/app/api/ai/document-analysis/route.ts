import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { extractText } from 'unpdf'

// ============================================================
// SYSTEM PROMPT FOR UTILITY/SERVICE DOCUMENTS
// ============================================================
const SYSTEM_PROMPT = `You are a document classification and extraction assistant specializing in utility contracts, service agreements, and related documents.

RULES:
1. Extract ONLY what is explicitly stated in the document
2. Never infer or guess missing information
3. ALWAYS translate extracted values to English
4. Return null if information is not found
5. Be precise with dates (use YYYY-MM-DD format)

Return ONLY valid JSON. No markdown, no explanations.`

const USER_PROMPT = `Analyze this document and extract key information.

Return this exact JSON structure:
{
  "category": "internet|electricity|gas|water|insurance|cleaning|parking|employment|storage|other",
  "category_confidence": 0.0-1.0,
  "provider": "company name or null",
  "provider_confidence": 0.0-1.0,
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null", 
  "notice_period_days": number or null,
  "monthly_amount": number or null,
  "currency": "EUR|USD|GBP|CHF or null",
  "contract_number": "string or null",
  "summary": "One-line description of what this document is"
}

CATEGORY DETECTION RULES:
- internet/telecom: mentions broadband, WiFi, data, mobile, SIM, router, fibre, DSL
- electricity: mentions kWh, power, electric, voltage, meter reading
- gas: mentions natural gas, heating, therms, boiler
- water: mentions water supply, sewage, cubic meters
- insurance: mentions policy, coverage, premium, claims, excess
- employment: mentions salary, employer, working hours, job title, probation
- storage: mentions storage unit, locker, warehouse
- cleaning: mentions cleaning service, housekeeping
- parking: mentions parking space, garage, car park
- other: if none of the above match clearly

PROVIDER DETECTION:
Look for company names, logos mentioned, letterhead, "from:", sender information.
Common telecom providers: Orange, Proximus, Tango, POST, Vodafone, T-Mobile, Free
Common energy providers: EDF, Engie, Enovos, EON, British Gas, Octopus

DATE DETECTION:
- "valid from", "effective date", "start date", "commencement" → start_date
- "expires", "valid until", "end date", "termination date" → end_date
- Dates can appear as "01/01/2025", "January 1, 2025", "1er janvier 2025"

Document text:
`

// ============================================================
// LAZY OPENAI INITIALIZATION
// ============================================================
let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI | null {
    if (!process.env.OPENAI_API_KEY) return null
    if (!openaiClient) {
        openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }
    return openaiClient
}

// ============================================================
// PDF TEXT EXTRACTION
// ============================================================
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

// ============================================================
// PROVIDER PATTERNS (for filename-based detection)
// ============================================================
const PROVIDER_PATTERNS: Record<string, { keywords: string[]; providers: string[] }> = {
    internet: {
        keywords: ['internet', 'wifi', 'broadband', 'fiber', 'fibre', 'dsl', 'livebox', 'bbox', 'telecom', 'mobile', 'forfait'],
        providers: [
            'orange', 'vodafone', 'free', 'bouygues', 'sfr', 'bt', 'virgin', 'sky',
            'comcast', 'at&t', 'verizon', 't-mobile', 'deutsche telekom',
            'proximus', 'tango', 'post telecom', 'base', 'telenet', 'voo',
            'o2', '1&1', 'congstar', 'kpn', 'ziggo', 'tele2',
            'swisscom', 'salt', 'sunrise', 'iliad', 'wind', 'tim', 'fastweb'
        ]
    },
    electricity: {
        keywords: ['electricity', 'electric', 'power', 'energy', 'strom', 'électricité', 'kwh'],
        providers: ['edf', 'engie', 'eon', 'e.on', 'vattenfall', 'octopus', 'bulb', 'british gas', 'eni', 'enel', 'enovos', 'creos', 'electrabel']
    },
    gas: {
        keywords: ['gas', 'gaz', 'heating', 'chauffage', 'natural gas'],
        providers: ['edf', 'engie', 'eon', 'british gas', 'sse', 'eni', 'enovos']
    },
    water: {
        keywords: ['water', 'eau', 'wasser', 'sewage', 'utility'],
        providers: ['thames', 'severn', 'united utilities', 'anglian', 'sydec', 'sidec']
    },
    insurance: {
        keywords: ['insurance', 'assurance', 'versicherung', 'policy', 'coverage', 'renters', 'habitation'],
        providers: ['allianz', 'axa', 'zurich', 'lemonade', 'state farm', 'foyer', 'lalux', 'bâloise', 'maif', 'maaf', 'matmut', 'gmf']
    },
    cleaning: {
        keywords: ['cleaning', 'cleaner', 'nettoyage', 'housekeeping', 'maid'],
        providers: []
    },
    parking: {
        keywords: ['parking', 'garage', 'car park', 'stationnement'],
        providers: []
    },
    employment: {
        keywords: ['employment', 'job offer', 'salary', 'arbeitsvertrag', 'contrat de travail', 'cdi', 'cdd', 'work permit'],
        providers: []
    },
    storage: {
        keywords: ['storage', 'self-storage', 'box', 'lagerung', 'garde-meuble'],
        providers: ['big yellow', 'safestore', 'public storage', 'shurgard']
    }
}

function capitalizeWords(str: string): string {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
}

function detectFromText(text: string): { category: string; provider?: string } {
    const lowerText = text.toLowerCase()

    // Check for provider matches first (higher confidence)
    for (const [category, data] of Object.entries(PROVIDER_PATTERNS)) {
        for (const provider of data.providers) {
            if (lowerText.includes(provider.toLowerCase())) {
                return { category, provider: capitalizeWords(provider) }
            }
        }
    }

    // Check for keyword matches
    for (const [category, data] of Object.entries(PROVIDER_PATTERNS)) {
        for (const keyword of data.keywords) {
            if (lowerText.includes(keyword)) {
                return { category }
            }
        }
    }

    return { category: 'other' }
}

// ============================================================
// MAIN API HANDLER
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { fileName, fileType, storagePath } = body

        if (!fileName) {
            return NextResponse.json({ error: 'Missing fileName' }, { status: 400 })
        }

        console.log('Document analysis - fileName:', fileName, 'storagePath:', storagePath)

        // ============================================================
        // STEP 1: Try to fetch and analyze PDF content
        // ============================================================
        if (storagePath && fileType === 'application/pdf') {
            try {
                // Get signed URL
                const { data: signedData, error: signedError } = await supabase.storage
                    .from('guard-rent')
                    .createSignedUrl(storagePath, 120)

                if (signedError || !signedData?.signedUrl) {
                    console.error('Could not get signed URL:', signedError)
                    // Fall back to filename detection
                } else {
                    // Fetch PDF content
                    const pdfResponse = await fetch(signedData.signedUrl)
                    if (!pdfResponse.ok) {
                        console.error('Could not fetch PDF:', pdfResponse.status)
                    } else {
                        const pdfBuffer = await pdfResponse.arrayBuffer()
                        console.log('PDF fetched, size:', pdfBuffer.byteLength)

                        // Extract text
                        const extractedText = await extractTextFromPDF(pdfBuffer)
                        console.log('Extracted text length:', extractedText.length)

                        if (extractedText.length > 100) {
                            // We have text - analyze with AI
                            const openai = getOpenAI()

                            if (openai) {
                                const textForAnalysis = extractedText.substring(0, 8000)

                                try {
                                    const response = await openai.chat.completions.create({
                                        model: 'gpt-4o-mini',
                                        messages: [
                                            { role: 'system', content: SYSTEM_PROMPT },
                                            { role: 'user', content: USER_PROMPT + textForAnalysis }
                                        ],
                                        response_format: { type: 'json_object' },
                                        max_tokens: 800
                                    })

                                    const content = response.choices[0]?.message?.content
                                    if (content) {
                                        const analysis = JSON.parse(content)
                                        console.log('AI analysis result:', analysis)

                                        return NextResponse.json({
                                            analysis: {
                                                category: analysis.category || 'other',
                                                confidence: analysis.category_confidence || 0.8,
                                                provider: analysis.provider || null,
                                                startDate: analysis.start_date || null,
                                                endDate: analysis.end_date || null,
                                                noticePeriodDays: analysis.notice_period_days || null,
                                                monthlyAmount: analysis.monthly_amount || null,
                                                currency: analysis.currency || null,
                                                contractNumber: analysis.contract_number || null,
                                                summary: analysis.summary || null,
                                                source: 'ai_extraction'
                                            }
                                        })
                                    }
                                } catch (aiError: any) {
                                    console.error('AI analysis failed:', aiError.message)
                                    // Fall back to text-based detection
                                }
                            }

                            // AI not available - use text-based detection
                            const textDetection = detectFromText(extractedText)
                            return NextResponse.json({
                                analysis: {
                                    category: textDetection.category,
                                    confidence: 0.7,
                                    provider: textDetection.provider || null,
                                    source: 'text_detection'
                                }
                            })
                        }
                    }
                }
            } catch (pdfError: any) {
                console.error('PDF processing error:', pdfError.message)
                // Fall back to filename detection
            }
        }

        // ============================================================
        // STEP 2: Fallback to filename-based detection
        // ============================================================
        const lowerName = fileName.toLowerCase()

        // Check for provider matches first
        for (const [category, data] of Object.entries(PROVIDER_PATTERNS)) {
            for (const provider of data.providers) {
                if (lowerName.includes(provider.toLowerCase())) {
                    return NextResponse.json({
                        analysis: {
                            category,
                            confidence: 0.9,
                            provider: capitalizeWords(provider),
                            source: 'filename_provider'
                        }
                    })
                }
            }
        }

        // Check for keyword matches
        for (const [category, data] of Object.entries(PROVIDER_PATTERNS)) {
            for (const keyword of data.keywords) {
                if (lowerName.includes(keyword)) {
                    return NextResponse.json({
                        analysis: {
                            category,
                            confidence: 0.85,
                            source: 'filename_keyword'
                        }
                    })
                }
            }
        }

        // No match - return other
        return NextResponse.json({
            analysis: {
                category: 'other',
                confidence: 0.3,
                source: 'fallback'
            }
        })

    } catch (error) {
        console.error('Document analysis error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}
