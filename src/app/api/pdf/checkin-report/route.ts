import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PDFPage, degrees } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'
import { getPhotosGroupedByRoom, drawPhotoGrid, drawHashAppendix } from '@/lib/pdf-images'

const MARGIN = 50
const FOOTER_TEXT = '© RentVault 2025 · Securely stores and organises your rental documents. Not legal advice.'

interface CustomSections {
    personalNotes?: string
    propertyReview?: string
    propertyRating?: number
    customTitle?: string
    customContent?: string
    // Include toggles (default: true if not specified)
    includePersonalNotes?: boolean
    includePropertyReview?: boolean
    includeCustomSection?: boolean
}

/**
 * Draw page number footer
 */
function drawPageNumber(page: PDFPage, pageNum: number, totalPages: number, font: any) {
    const { width } = page.getSize()
    page.drawText(`Page ${pageNum} of ${totalPages}`, {
        x: width - MARGIN - 60,
        y: 40,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
    })
}

/**
 * Draw preview watermark on a page
 */
function drawWatermark(page: PDFPage, font: any) {
    const { width, height } = page.getSize()
    const watermarkText = 'PREVIEW'

    // Draw multiple diagonal watermarks across the page
    const positions = [
        { x: width / 2 - 80, y: height / 2 },
        { x: width / 4 - 40, y: height / 3 * 2 },
        { x: width / 4 * 3 - 40, y: height / 3 },
    ]

    for (const pos of positions) {
        page.drawText(watermarkText, {
            x: pos.x,
            y: pos.y,
            size: 60,
            font,
            color: rgb(0.85, 0.85, 0.85),
            rotate: degrees(45),
            opacity: 0.5,
        })
    }
}

/**
 * Draw custom sections on a page, returns new Y position
 */
function drawCustomSections(
    page: PDFPage,
    customSections: CustomSections,
    yPos: number,
    fontBold: any,
    fontRegular: any
): number {
    // Property Review with star rating (check include toggle)
    const includeReview = customSections.includePropertyReview !== false
    if (includeReview && (customSections.propertyRating || customSections.propertyReview)) {
        yPos -= 30
        page.drawText('Property Review (User-Provided)', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: fontBold,
            color: rgb(0.12, 0.14, 0.17),
        })
        yPos -= 16
        page.drawText('Subjective feedback provided by tenant', {
            x: MARGIN,
            y: yPos,
            size: 8,
            font: fontRegular,
            color: rgb(0.5, 0.5, 0.5),
        })
        yPos -= 16

        if (customSections.propertyRating) {
            const stars = '★'.repeat(customSections.propertyRating) + '☆'.repeat(5 - customSections.propertyRating)
            page.drawText(`Rating: ${stars}`, {
                x: MARGIN,
                y: yPos,
                size: 12,
                font: fontRegular,
                color: rgb(0.85, 0.6, 0.1), // Gold color
            })
            yPos -= 18
        }

        if (customSections.propertyReview) {
            const reviewLines = wrapText(customSections.propertyReview, 80)
            for (const line of reviewLines.slice(0, 6)) {
                page.drawText(line, {
                    x: MARGIN,
                    y: yPos,
                    size: 10,
                    font: fontRegular,
                })
                yPos -= 14
            }
        }
    }

    // Personal Notes (check include toggle)
    const includeNotes = customSections.includePersonalNotes !== false
    if (includeNotes && customSections.personalNotes) {
        yPos -= 20
        page.drawText('Personal Notes (User-Provided)', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: fontBold,
            color: rgb(0.12, 0.14, 0.17),
        })
        yPos -= 16
        page.drawText('Notes provided by tenant for their records', {
            x: MARGIN,
            y: yPos,
            size: 8,
            font: fontRegular,
            color: rgb(0.5, 0.5, 0.5),
        })
        yPos -= 16

        const noteLines = wrapText(customSections.personalNotes, 80)
        for (const line of noteLines.slice(0, 8)) {
            page.drawText(line, {
                x: MARGIN,
                y: yPos,
                size: 10,
                font: fontRegular,
            })
            yPos -= 14
        }
    }

    // Custom Section (check include toggle)
    const includeCustom = customSections.includeCustomSection !== false
    if (includeCustom && customSections.customTitle && customSections.customContent) {
        yPos -= 20
        page.drawText(customSections.customTitle, {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: fontBold,
            color: rgb(0.12, 0.14, 0.17),
        })
        yPos -= 20

        const contentLines = wrapText(customSections.customContent, 80)
        for (const line of contentLines.slice(0, 8)) {
            page.drawText(line, {
                x: MARGIN,
                y: yPos,
                size: 10,
                font: fontRegular,
            })
            yPos -= 14
        }
    }

    return yPos
}

/**
 * Simple text wrapping utility
 */
function wrapText(text: string, maxChars: number): string[] {
    const lines: string[] = []
    const paragraphs = text.split('\n')

    for (const paragraph of paragraphs) {
        const words = paragraph.split(' ')
        let currentLine = ''

        for (const word of words) {
            if ((currentLine + ' ' + word).length > maxChars) {
                if (currentLine) lines.push(currentLine)
                currentLine = word
            } else {
                currentLine = currentLine ? currentLine + ' ' + word : word
            }
        }
        if (currentLine) lines.push(currentLine)
    }

    return lines
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = isAdminEmail(user.email)

    try {
        const body = await request.json()
        const { caseId, customSections = {}, forPreview = false } = body as { caseId: string; customSections?: CustomSections; forPreview?: boolean }

        if (!caseId) {
            return NextResponse.json({ error: 'Missing Case ID' }, { status: 400 })
        }

        // Verify ownership
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('*')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
        }

        // Check entitlement
        if (!isAdmin && !['checkin', 'bundle'].includes(rentalCase.purchase_type)) {
            // Allow for prototype
        }

        // Get photos grouped by room
        const roomPhotos = await getPhotosGroupedByRoom(caseId)
        const totalPhotos = roomPhotos.reduce((sum, r) => sum + r.checkinPhotos.length, 0)

        // HASH VALIDATION: Collect all assets and validate hashes before PDF generation
        const allAssets = roomPhotos.flatMap(r => r.checkinPhotos)
        const { validateAssetHashes } = await import('@/lib/pdf-images')
        const hashValidation = validateAssetHashes(allAssets)

        if (!hashValidation.valid) {
            console.error(`PDF generation blocked: ${hashValidation.missingHashAssetIds.length} assets missing hashes`, hashValidation.missingHashAssetIds)
            return NextResponse.json({
                error: 'This report cannot be generated because one or more evidence files have not completed integrity verification.',
                code: 'HASH_VERIFICATION_INCOMPLETE',
                missingCount: hashValidation.missingHashAssetIds.length
            }, { status: 422 })
        }

        // Create PDF
        const pdfDoc = await PDFDocument.create()
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

        const pages: PDFPage[] = []

        // === PAGE 1: COVER ===
        const coverPage = pdfDoc.addPage()
        pages.push(coverPage)
        const { width, height } = coverPage.getSize()

        // Formal document title (court-grade, not marketing)
        coverPage.drawText('Property Condition Record — Check-in', {
            x: MARGIN,
            y: height - 50,
            size: 18,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1),
        })

        // Subtitle with generation date
        const generatedDateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        coverPage.drawText(`Generated: ${generatedDateStr}`, {
            x: MARGIN,
            y: height - 70,
            size: 10,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4),
        })

        // Thin divider
        coverPage.drawLine({
            start: { x: MARGIN, y: height - 85 },
            end: { x: width - MARGIN, y: height - 85 },
            thickness: 0.5,
            color: rgb(0.3, 0.3, 0.3),
        })

        // Property details - compact layout
        let yPos = height - 110

        coverPage.drawText('Property Details', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        const generatedDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })

        // Address resolution hierarchy
        let resolvedAddress: string
        if (rentalCase.contract_analysis?.address) {
            resolvedAddress = rentalCase.contract_analysis.address
        } else if (rentalCase.address) {
            resolvedAddress = rentalCase.address
        } else {
            resolvedAddress = `Not stated in lease (rental reference: ${rentalCase.label})`
        }

        const details = [
            ['Rental', rentalCase.label],
            ['Address', resolvedAddress],
            ['Lease Start', rentalCase.lease_start || 'N/A'],
            ['Lease End', rentalCase.lease_end || 'N/A'],
            ['Generated', generatedDate],
        ]

        if (rentalCase.checkin_completed_at) {
            details.splice(4, 0, ['Check-in Sealed', new Date(rentalCase.checkin_completed_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })])
        }

        for (const [label, value] of details) {
            coverPage.drawText(`${label}:`, {
                x: MARGIN,
                y: yPos,
                size: 11,
                font: helveticaBold,
            })
            coverPage.drawText(value, {
                x: 150,
                y: yPos,
                size: 11,
                font: helvetica,
            })
            yPos -= 18
        }

        // Evidence handling - factual explanation (conditional on actual sealed state)
        yPos -= 20
        coverPage.drawText('Evidence handling', {
            x: MARGIN,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: rgb(0.3, 0.3, 0.3),
        })
        yPos -= 16

        // Build explanation dynamically based on actual sealed state
        const explanationLines: string[] = [
            'Photos and documents in this record were uploaded to RentVault and timestamped using system time (UTC).',
        ]

        // Only mention locked photo set if actually locked
        if (rentalCase.checkin_completed_at) {
            explanationLines.push('Check-in photo set was locked after completion and cannot be modified.')
        }

        explanationLines.push('This report is a snapshot of the stored records at the time of generation.')

        for (const line of explanationLines) {
            coverPage.drawText(line, {
                x: MARGIN,
                y: yPos,
                size: 9,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4),
            })
            yPos -= 13
        }

        // Evidence summary
        yPos -= 20
        coverPage.drawText('Evidence Summary', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        coverPage.drawText('Check-in photos:', {
            x: MARGIN,
            y: yPos,
            size: 11,
            font: helveticaBold,
        })
        coverPage.drawText(`${totalPhotos} photos`, {
            x: 180,
            y: yPos,
            size: 11,
            font: helvetica,
        })
        yPos -= 18

        coverPage.drawText('Rooms documented:', {
            x: MARGIN,
            y: yPos,
            size: 11,
            font: helveticaBold,
        })
        coverPage.drawText(`${roomPhotos.length} rooms`, {
            x: 180,
            y: yPos,
            size: 11,
            font: helvetica,
        })
        yPos -= 18

        // Initial Meter Readings (move-in)
        if (rentalCase.checkin_meter_readings && Object.keys(rentalCase.checkin_meter_readings).length > 0) {
            yPos -= 20
            coverPage.drawText('Initial Meter Readings (move-in)', {
                x: MARGIN,
                y: yPos,
                size: 14,
                font: helveticaBold,
            })
            yPos -= 25

            for (const [meter, reading] of Object.entries(rentalCase.checkin_meter_readings)) {
                if (reading) {
                    let displayValue: string
                    if (typeof reading === 'object' && reading !== null) {
                        const readingObj = reading as Record<string, unknown>
                        // Skip if no actual value recorded
                        if (!readingObj.value || String(readingObj.value).trim() === '') {
                            continue
                        }
                        displayValue = String(readingObj.value) + (readingObj.unit ? ` ${readingObj.unit}` : '')
                    } else if (String(reading).trim() === '') {
                        continue
                    } else {
                        displayValue = String(reading)
                    }

                    coverPage.drawText(`${meter.charAt(0).toUpperCase() + meter.slice(1)}:`, {
                        x: MARGIN,
                        y: yPos,
                        size: 11,
                        font: helveticaBold,
                    })
                    coverPage.drawText(displayValue, {
                        x: 150,
                        y: yPos,
                        size: 11,
                        font: helvetica,
                    })
                    yPos -= 18
                }
            }
        }

        // Custom sections on cover page
        if (Object.keys(customSections).length > 0) {
            yPos = drawCustomSections(coverPage, customSections, yPos, helveticaBold, helvetica)
        }

        // Footer
        coverPage.drawText(FOOTER_TEXT, {
            x: MARGIN,
            y: 40,
            size: 10,
            font: timesRoman,
            color: rgb(0.5, 0.5, 0.5),
        })

        // === PHOTO PAGES ===
        for (const room of roomPhotos) {
            if (room.checkinPhotos.length === 0) continue

            const photoPage = pdfDoc.addPage()
            pages.push(photoPage)
            let pageY = photoPage.getHeight() - 60

            // Room header
            photoPage.drawText('RentVault', {
                x: MARGIN,
                y: photoPage.getHeight() - 40,
                size: 14,
                font: helveticaBold,
                color: rgb(0.5, 0.5, 0.5),
            })

            photoPage.drawText(`Check-in Evidence - ${room.roomName}`, {
                x: MARGIN,
                y: pageY,
                size: 16,
                font: helveticaBold,
                color: rgb(0.12, 0.14, 0.17),
            })
            pageY -= 30

            pageY = await drawPhotoGrid(
                pdfDoc,
                photoPage,
                room.checkinPhotos,
                pageY,
                photoPage.getWidth(),
                `${room.checkinPhotos.length} photos captured`,
                helvetica
            )

            // Footer
            photoPage.drawText(FOOTER_TEXT, {
                x: MARGIN,
                y: 40,
                size: 10,
                font: timesRoman,
                color: rgb(0.5, 0.5, 0.5),
            })
        }

        // === APPENDIX: FILE INTEGRITY ===
        // Reuse allAssets from earlier validation
        await drawHashAppendix(pdfDoc, allAssets, helveticaBold, helvetica)

        // Add page numbers to all pages
        const totalPages = pages.length
        pages.forEach((page, idx) => {
            drawPageNumber(page, idx + 1, totalPages, helvetica)
        })

        // Add watermarks if this is a preview
        if (forPreview) {
            const allPages = pdfDoc.getPages()
            for (const page of allPages) {
                drawWatermark(page, helveticaBold)
            }
        }

        // Save PDF
        const pdfBytes = await pdfDoc.save()
        const pdfBuffer = Buffer.from(pdfBytes)

        // Upload to storage
        const filename = `generated/${uuidv4()}.pdf`
        const storagePath = `cases/${caseId}/${filename}`

        const { error: uploadError } = await supabase
            .storage
            .from('guard-rent')
            .upload(storagePath, pdfBuffer, {
                contentType: 'application/pdf'
            })

        if (uploadError) throw uploadError

        // Record output
        await supabase.from('outputs').insert({
            case_id: caseId,
            user_id: user.id,
            type: 'checkin_report',
            payload: {
                generated_at: new Date(),
                photo_count: totalPhotos,
                rooms_count: roomPhotos.length,
                has_custom_sections: Object.keys(customSections).length > 0
            },
            storage_path: storagePath
        })

        // Get signed URL - with download option for non-previews
        const downloadFileName = forPreview
            ? undefined
            : `RentVault_Check-in_Report_${caseId.slice(0, 8)}.pdf`

        const { data: signData } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUrl(storagePath, 3600, downloadFileName ? { download: downloadFileName } : {})

        return NextResponse.json({ url: signData?.signedUrl })

    } catch (err: any) {
        console.error('PDF Gen Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
