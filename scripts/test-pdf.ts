// Test script for PDF extraction
// Run with: npx tsx scripts/test-pdf.ts path/to/your/contract.pdf

import { extractText } from 'unpdf'
import { readFileSync } from 'fs'

async function testPdfExtraction(pdfPath: string) {
    console.log('Testing PDF extraction for:', pdfPath)
    console.log('---')

    try {
        const buffer = readFileSync(pdfPath)
        const uint8Array = new Uint8Array(buffer)

        console.log('File size:', buffer.length, 'bytes')

        const { text, totalPages } = await extractText(uint8Array)

        console.log('Total pages:', totalPages)
        console.log('---')

        const fullText = Array.isArray(text) ? text.join('\n\n') : String(text || '')

        console.log('Extracted text length:', fullText.length, 'characters')
        console.log('---')
        console.log('=== FIRST 1000 CHARACTERS ===')
        console.log(fullText.substring(0, 1000))
        console.log('=== END ===')

        if (fullText.length < 1500) {
            console.log('\n❌ WARNING: Text too short for analysis (<1500 chars)')
            console.log('This PDF may be scanned or have extraction issues.')
        } else {
            console.log('\n✅ Text length is sufficient for analysis')
        }

    } catch (error: any) {
        console.error('❌ Extraction failed:', error.message)
    }
}

// Get PDF path from command line
const pdfPath = process.argv[2]
if (!pdfPath) {
    console.log('Usage: npx tsx scripts/test-pdf.ts path/to/contract.pdf')
    process.exit(1)
}

testPdfExtraction(pdfPath)
