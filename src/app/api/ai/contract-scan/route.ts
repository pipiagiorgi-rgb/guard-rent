import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { extractText } from 'unpdf'

// ============================================================
// SYSTEM PROMPT - CONSERVATIVE, STRUCTURED
// ============================================================
const SYSTEM_PROMPT = `You are a contract information extraction assistant.

RULES:
1. Extract ONLY what is explicitly stated in the document
2. Never infer or guess missing information
3. ALWAYS translate extracted values to English (e.g., "3 mois" → "3 months", "lettre recommandée" → "registered letter")
4. Return "not found" if information is unclear or missing
5. Confidence: high (explicit), medium (implied), low (ambiguous)

Return ONLY valid JSON. No markdown, no explanations.`

// ============================================================
// USER PROMPT - STRUCTURED FOR EU RESIDENTIAL LEASES
// ============================================================
const USER_PROMPT = `Extract contract details from this European residential lease.

Return this exact JSON structure:

{
  "document_language": { "value": "...", "confidence": "high/medium/low" },

  "property_address": { "value": "...", "confidence": "high/medium/low", "source": "..." },
  
  "lease_start_date": { "value": "YYYY-MM-DD", "confidence": "high/medium/low", "source": "..." },
  "lease_end_date": { "value": "YYYY-MM-DD", "confidence": "high/medium/low", "source": "..." },
  
  "termination": {
    "earliest_possible_date": { "value": "YYYY-MM-DD", "confidence": "high/medium/low", "source": "..." },
    "notice_period": { "value": "...", "confidence": "high/medium/low", "source": "..." },
    "notice_condition": { "value": "...", "confidence": "high/medium/low", "source": "..." },
    "notice_method": { "value": "...", "confidence": "high/medium/low", "source": "..." }
  },
  
  "payment_terms": {
    "rent_amount": { "value": "...", "confidence": "high/medium/low", "source": "..." },
    "payment_frequency": { "value": "...", "confidence": "high/medium/low", "source": "..." },
    "payment_due_date": { "value": "...", "confidence": "high/medium/low", "source": "..." }
  },
  
  "jurisdiction": { "value": "...", "confidence": "high/medium/low", "source": "..." }
}

=== PROPERTY ADDRESS EXTRACTION (ABSOLUTE FIRST PRIORITY) ===
The property address is THE MOST IMPORTANT field. NEVER return "not found" unless truly impossible.

STEP 1 - SEARCH FOR ADDRESS HEADERS (common in all EU languages):
- French: "Lieu loué", "Objet du bail", "Désignation du bien", "situé à", "sis à", "L'appartement/La maison"
- German: "Mietobjekt", "Wohnung", "gelegen in", "Anschrift des Mietobjekts"
- Dutch: "Gehuurde", "Woning gelegen", "Adres van het gehuurde"  
- Spanish: "Vivienda", "Inmueble arrendado", "sito en"
- Italian: "Immobile locato", "sito in", "ubicato"

STEP 2 - SEARCH FOR STREET NAME PATTERNS:
- "rue", "avenue", "boulevard", "place", "allée", "chemin" (French)
- "Straße", "Strasse", "Weg", "Platz", "Gasse" (German)
- "straat", "weg", "laan", "plein" (Dutch)
- "calle", "avenida", "plaza" (Spanish)
- "via", "viale", "piazza" (Italian)

STEP 3 - SEARCH FOR POSTAL CODE PATTERNS:
- 4-5 digits: 1000, 75001, 1050, 69001, 20000
- Pattern: number + city name

STEP 4 - EXCLUDE THESE (they are party addresses, NOT property):
- Addresses appearing in "LE BAILLEUR" / "LANDLORD" sections
- Addresses appearing in "LE LOCATAIRE" / "TENANT" sections
- Anything marked as "domicile" or "representing"

The property address is ALWAYS in the "DÉSIGNATION" or "OBJET DU BAIL" section!
Extract the FULL address: Street Number + Street Name + Postal Code + City

=== TERMINATION RULES ===
- "date anniversaire", "à l'échéance" → notice_condition = "anniversary only"
- "à tout moment" → notice_condition = "anytime"
- "durée minimale", "ne peut être résilié avant" → earliest_possible_date
- NEVER show notice_period without notice_condition

=== JURISDICTION ===
- If no explicit clause, extract country from the property address

=== FRENCH TRANSLATIONS ===
- "prend cours le", "commence le", "à compter du" → Start date
- "pour une durée de", "jusqu'au" → Duration
- "3 mois avant" / "préavis de X mois" → "X months notice"
- "lettre recommandée" → "registered letter"

For "source", include exact text from document (max 100 chars).
If truly not found after thorough search, set value to "not found".

Contract text:
`

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function userSafeError(message: string, status = 400) {
    return NextResponse.json({ error: message }, { status })
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
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
// MAIN API HANDLER
// ============================================================
export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return userSafeError('Please sign in to analyze contracts.', 401)
        }

        const body = await request.json()
        const { caseId, fileBase64, fileName } = body

        if (!caseId) {
            return userSafeError('Missing case ID.')
        }

        console.log('Contract scan - caseId:', caseId, 'fileName:', fileName)

        if (!fileBase64) {
            return userSafeError('Please upload a file first.')
        }

        // Verify case ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('case_id')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return userSafeError('Rental not found.', 404)
        }

        // ============================================================
        // STEP 1: EXTRACT TEXT FROM PDF
        // ============================================================
        console.log('Extracting text from PDF...')

        let extractedText = ''
        let contractBuffer: Buffer
        try {
            contractBuffer = Buffer.from(fileBase64, 'base64')
            extractedText = await extractTextFromPDF(contractBuffer)
            console.log('Extracted text length:', extractedText.length)
        } catch (pdfError: any) {
            console.error('PDF extraction error:', pdfError.message)
            return userSafeError('Could not read this PDF. Please try a different file.')
        }

        // ============================================================
        // STEP 2: LENGTH CHECK
        // ============================================================
        if (extractedText.trim().length < 200) {
            console.log('Insufficient text:', extractedText.length)
            return userSafeError(
                "This document appears to be scanned or image-based. Please provide a text-based PDF."
            )
        }

        // ============================================================
        // STEP 3: CALL OPENAI
        // ============================================================
        const apiKey = process.env.OPENAI_API_KEY
        if (!apiKey) {
            console.error('Missing OPENAI_API_KEY')
            return userSafeError('Contract analysis is temporarily unavailable.', 503)
        }

        const openai = new OpenAI({ apiKey })
        const textForAnalysis = extractedText.substring(0, 12000) // ~3000 tokens

        console.log('Calling OpenAI with', textForAnalysis.length, 'chars')

        let response
        try {
            response = await openai.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    { role: 'user', content: USER_PROMPT + textForAnalysis }
                ],
                response_format: { type: 'json_object' }
            })
            console.log('OpenAI response received')
        } catch (aiError: any) {
            console.error('OpenAI API error:', aiError.message)
            return userSafeError('Contract analysis is temporarily unavailable.', 503)
        }

        // ============================================================
        // STEP 4: PARSE RESPONSE
        // ============================================================
        const responseContent = response.choices[0]?.message?.content

        if (!responseContent) {
            console.error('Empty OpenAI response')
            return userSafeError('Contract analysis failed. Please try again.')
        }

        let analysis
        try {
            analysis = JSON.parse(responseContent.trim())
            console.log('Analysis parsed successfully')
        } catch (parseError) {
            console.error('JSON parse error:', responseContent.substring(0, 200))
            return userSafeError('Contract analysis failed. Please try again.')
        }

        // ============================================================
        // STEP 5: FLATTEN FOR BACKWARD COMPATIBILITY
        // ============================================================
        // The frontend expects flat structure, so we normalize
        const flatAnalysis = {
            document_language: analysis.document_language,
            property_address: analysis.property_address,
            lease_start_date: analysis.lease_start_date,
            lease_end_date: analysis.lease_end_date,
            earliest_termination_date: analysis.termination?.earliest_possible_date,
            notice_period: analysis.termination?.notice_period,
            notice_condition: analysis.termination?.notice_condition,
            notice_method: analysis.termination?.notice_method,
            rent_amount: analysis.payment_terms?.rent_amount,
            payment_frequency: analysis.payment_terms?.payment_frequency,
            payment_due_date: analysis.payment_terms?.payment_due_date,
            jurisdiction_or_country: analysis.jurisdiction
        }

        // ============================================================
        // STEP 6: SAVE TO DATABASE (with verification)
        // ============================================================
        const contractAnalysisData = {
            analysis: flatAnalysis,
            rawAnalysis: analysis,
            extractedText: extractedText.substring(0, 50000),
            fileName,
            analyzedAt: new Date().toISOString()
        }

        // Map extracted fields to DB columns if they were found and have high/medium confidence
        // We only overwrite if the value is not "not found"
        const updatePayload: any = {
            contract_analysis: contractAnalysisData,
            last_activity_at: new Date().toISOString()
        }

        // Helper to check validity
        const isValid = (field: any) => field?.value && field?.value.toLowerCase() !== 'not found' && field?.value !== '...'

        if (isValid(analysis.property_address)) {
            updatePayload.address = analysis.property_address.value
        }
        if (isValid(analysis.jurisdiction)) {
            updatePayload.country = analysis.jurisdiction.value
        }
        if (isValid(analysis.lease_start_date)) {
            // Check formatted date
            const date = analysis.lease_start_date.value
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                updatePayload.lease_start = date
            }
        }
        if (isValid(analysis.lease_end_date)) {
            const date = analysis.lease_end_date.value
            if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
                updatePayload.lease_end = date
            }
        }

        const { data: savedCase, error: saveError } = await supabase
            .from('cases')
            .update(updatePayload)
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .select('case_id')
            .single()

        if (saveError) {
            console.error('Failed to save contract analysis:', saveError.message)
            // Continue anyway - analysis still worked
        } else if (!savedCase) {
            console.error('No case updated - case_id or RLS issue')
        } else {
            console.log('Analysis saved to case:', savedCase.case_id)
        }

        // ============================================================
        // STEP 7: STORE CONTRACT PDF FOR DOWNLOAD
        // ============================================================
        try {
            const storagePath = `${user.id}/${caseId}/contract.pdf`

            // Upload contract PDF to storage
            const { error: uploadError } = await supabase.storage
                .from('guard-rent')
                .upload(storagePath, contractBuffer, {
                    contentType: 'application/pdf',
                    upsert: true // Replace if exists (re-scan)
                })

            if (uploadError) {
                console.error('Contract storage error:', uploadError.message)
            } else {
                // Create or update asset record for contract
                const { error: assetError } = await supabase
                    .from('assets')
                    .upsert({
                        case_id: caseId,
                        user_id: user.id,
                        type: 'contract_pdf',
                        original_name: fileName || 'contract.pdf',
                        storage_path: storagePath,
                        file_size: contractBuffer.length,
                        mime_type: 'application/pdf',
                        created_at: new Date().toISOString()
                    }, {
                        onConflict: 'case_id,type',
                        ignoreDuplicates: false
                    })

                if (assetError) {
                    console.error('Contract asset record error:', assetError.message)
                } else {
                    console.log('Contract PDF saved for download:', storagePath)
                }
            }
        } catch (storageErr: any) {
            console.error('Contract storage failed:', storageErr.message)
            // Continue - analysis still worked
        }

        // ============================================================
        // SUCCESS RESPONSE
        // ============================================================
        return NextResponse.json({
            analysis: flatAnalysis,
            extractedText: extractedText.substring(0, 50000)
        })

    } catch (error: any) {
        console.error('Contract scan error:', error)
        return userSafeError('Something went wrong. Please try again.')
    }
}
