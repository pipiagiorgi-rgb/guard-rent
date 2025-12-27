import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Lazy-load OpenAI to avoid build errors when key is not set
function getOpenAI() {
    if (!process.env.OPENAI_API_KEY) return null
    const OpenAI = require('openai').default
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

interface DocumentAnalysis {
    category: string
    confidence: number
    provider?: string
    startDate?: string
    endDate?: string
    noticePeriodDays?: number
    monthlyAmount?: number
    currency?: string
    summary?: string
}

/**
 * POST /api/ai/document-analysis
 * Analyze an uploaded document to extract metadata
 */
export async function POST(request: NextRequest) {
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

        // First: Quick category detection from filename (no AI cost)
        const quickCategory = detectCategoryFromFilename(fileName)

        // If we can determine category from filename with high confidence, return early
        if (quickCategory.confidence > 0.8) {
            return NextResponse.json({
                analysis: {
                    category: quickCategory.category,
                    confidence: quickCategory.confidence,
                    provider: quickCategory.provider,
                    source: 'filename'
                }
            })
        }

        // For PDFs, attempt AI extraction if OpenAI key is available
        if (process.env.OPENAI_API_KEY && fileType === 'application/pdf' && storagePath) {
            try {
                const analysis = await analyzeDocumentWithAI(fileName, storagePath, supabase)
                return NextResponse.json({ analysis })
            } catch (aiError) {
                console.error('AI analysis failed, falling back to filename:', aiError)
            }
        }

        // Fallback: return filename-based detection
        return NextResponse.json({
            analysis: {
                category: quickCategory.category,
                confidence: quickCategory.confidence,
                provider: quickCategory.provider,
                source: 'filename'
            }
        })

    } catch (error) {
        console.error('Document analysis error:', error)
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
    }
}

/**
 * Quick category detection from filename patterns
 */
function detectCategoryFromFilename(fileName: string): { category: string; confidence: number; provider?: string } {
    const lowerName = fileName.toLowerCase()

    const patterns: Record<string, { keywords: string[]; providers: string[] }> = {
        internet: {
            keywords: ['internet', 'wifi', 'broadband', 'fiber', 'fibre', 'dsl', 'livebox', 'bbox', 'telecom', 'mobile', 'forfait'],
            providers: [
                // Major EU/International telecoms
                'orange', 'vodafone', 'free', 'bouygues', 'sfr', 'bt', 'virgin', 'sky',
                'comcast', 'at&t', 'verizon', 't-mobile', 'deutsche telekom',
                // Belgium/Luxembourg
                'proximus', 'tango', 'post telecom', 'base', 'telenet', 'voo',
                // Germany
                'o2', '1&1', 'congstar',
                // Netherlands
                'kpn', 'ziggo', 'tele2',
                // Other EU
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
            // Removed 'contract' - too generic, matches everything
            keywords: ['employment', 'job offer', 'salary', 'arbeitsvertrag', 'contrat de travail', 'cdi', 'cdd', 'work permit'],
            providers: []
        },
        storage: {
            keywords: ['storage', 'self-storage', 'box', 'lagerung', 'garde-meuble'],
            providers: ['big yellow', 'safestore', 'public storage', 'shurgard']
        }
    }

    // Check for provider matches first (higher confidence)
    for (const [category, data] of Object.entries(patterns)) {
        for (const provider of data.providers) {
            if (lowerName.includes(provider.toLowerCase())) {
                return { category, confidence: 0.9, provider: capitalizeWords(provider) }
            }
        }
    }

    // Check for keyword matches
    for (const [category, data] of Object.entries(patterns)) {
        for (const keyword of data.keywords) {
            if (lowerName.includes(keyword)) {
                return { category, confidence: 0.85 }
            }
        }
    }

    // No match - return 'other' with low confidence
    return { category: 'other', confidence: 0.3 }
}

/**
 * AI-powered document analysis for PDFs
 */
async function analyzeDocumentWithAI(
    fileName: string,
    storagePath: string,
    supabase: any
): Promise<DocumentAnalysis> {
    // Get a signed URL for the document
    const { data: signedData, error: signedError } = await supabase.storage
        .from('guard-rent')
        .createSignedUrl(storagePath, 60)

    if (signedError || !signedData?.signedUrl) {
        throw new Error('Could not access document')
    }

    const prompt = `Analyze this document filename and classify it:
Filename: "${fileName}"

Determine:
1. Category (one of: internet, electricity, gas, water, insurance, cleaning, parking, employment, storage, other)
2. Provider/company name if identifiable
3. Any dates mentioned (start date, end date)
4. Notice period if mentioned (in days)
5. Monthly amount if this is a recurring service

Respond in JSON format:
{
  "category": "string",
  "confidence": 0.0-1.0,
  "provider": "string or null",
  "startDate": "YYYY-MM-DD or null",
  "endDate": "YYYY-MM-DD or null",
  "noticePeriodDays": "number or null",
  "monthlyAmount": "number or null",
  "currency": "string or null",
  "summary": "brief one-line description"
}`

    const openai = getOpenAI()
    if (!openai) {
        throw new Error('OpenAI not configured')
    }

    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 500
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
        throw new Error('No AI response')
    }

    const analysis = JSON.parse(content) as DocumentAnalysis
    return {
        ...analysis,
        source: 'ai'
    } as DocumentAnalysis
}

function capitalizeWords(str: string): string {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ')
}
