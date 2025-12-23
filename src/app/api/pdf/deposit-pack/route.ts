import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PDFPage } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'
import { getPhotosGroupedByRoom, drawComparisonGrid, drawPhotoGrid, drawHashAppendix } from '@/lib/pdf-images'

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
                color: rgb(0.85, 0.6, 0.1),
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

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin - bypass all payment checks
    const isAdmin = isAdminEmail(user.email)

    try {
        const body = await request.json()
        const { caseId, customSections = {} } = body as { caseId: string; customSections?: CustomSections }

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

        // Check if pack is purchased - admin users bypass this check
        if (!isAdmin) {
            const { data: purchase } = await supabase
                .from('purchases')
                .select('pack_type')
                .eq('case_id', caseId)
                .eq('pack_type', 'deposit_pack')
                .single()

            if (!purchase) {
                return NextResponse.json({ error: 'Pack not purchased' }, { status: 403 })
            }
        }

        // Get photos grouped by room
        const roomPhotos = await getPhotosGroupedByRoom(caseId)

        // Count total photos
        let totalCheckin = 0
        let totalHandover = 0
        roomPhotos.forEach(r => {
            totalCheckin += r.checkinPhotos.length
            totalHandover += r.handoverPhotos.length
        })

        // Create PDF
        const pdfDoc = await PDFDocument.create()
        const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica)

        // Track all pages for page numbering
        const pages: PDFPage[] = []

        // === PAGE 1: COVER ===
        const coverPage = pdfDoc.addPage()
        pages.push(coverPage)
        const { width, height } = coverPage.getSize()

        // Formal document title (court-grade, not marketing)
        coverPage.drawText('Rental Property Evidence Record', {
            x: MARGIN,
            y: height - 50,
            size: 18,
            font: helveticaBold,
            color: rgb(0.1, 0.1, 0.1),
        })

        // Subtitle with generation date
        const generatedDate = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'long', year: 'numeric'
        })
        coverPage.drawText(`Generated: ${generatedDate}`, {
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
            ['Lease Period', `${rentalCase.lease_start || 'N/A'} to ${rentalCase.lease_end || 'N/A'}`],
            ['Generated', new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })],
        ]

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

        // Evidence summary
        yPos -= 20
        coverPage.drawText('Evidence Summary', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        const evidence = [
            ['Check-in photos', `${totalCheckin} photos`],
            ['Check-in sealed', rentalCase.checkin_completed_at
                ? new Date(rentalCase.checkin_completed_at).toLocaleDateString('en-GB')
                : 'Not sealed'],
            ['Handover photos', `${totalHandover} photos`],
            ['Rooms documented', `${roomPhotos.length} rooms`],
            ['Handover completed', rentalCase.handover_completed_at
                ? new Date(rentalCase.handover_completed_at).toLocaleDateString('en-GB')
                : 'Not completed'],
            ['Keys returned', rentalCase.keys_returned_at
                ? new Date(rentalCase.keys_returned_at).toLocaleDateString('en-GB')
                : 'Not confirmed'],
        ]

        for (const [label, value] of evidence) {
            coverPage.drawText(`${label}:`, {
                x: MARGIN,
                y: yPos,
                size: 11,
                font: helveticaBold,
            })
            coverPage.drawText(value, {
                x: 180,
                y: yPos,
                size: 11,
                font: helvetica,
            })
            yPos -= 18
        }

        // Evidence handling - factual explanation
        yPos -= 25
        coverPage.drawText('Evidence handling', {
            x: MARGIN,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: rgb(0.3, 0.3, 0.3),
        })
        yPos -= 16

        const explanationLines = [
            'Photos and documents in this record were uploaded to RentVault and timestamped using system time (UTC).',
            'Check-in and handover photo sets were locked after completion and cannot be modified.',
            'This report is a snapshot of the stored records at the time of generation.',
        ]

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

        // Meter readings if present
        if (rentalCase.meter_readings && Object.keys(rentalCase.meter_readings).length > 0) {
            yPos -= 20
            coverPage.drawText('Final Meter Readings', {
                x: MARGIN,
                y: yPos,
                size: 14,
                font: helveticaBold,
            })
            yPos -= 25

            for (const [meter, reading] of Object.entries(rentalCase.meter_readings)) {
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

        // Notes if present
        if (rentalCase.handover_notes) {
            yPos -= 20
            coverPage.drawText('Handover Notes', {
                x: MARGIN,
                y: yPos,
                size: 14,
                font: helveticaBold,
            })
            yPos -= 20

            const noteLines = rentalCase.handover_notes.split('\n').slice(0, 4)
            for (const line of noteLines) {
                coverPage.drawText(line.substring(0, 80), {
                    x: MARGIN,
                    y: yPos,
                    size: 10,
                    font: helvetica,
                })
                yPos -= 14
            }
        }

        // Custom sections from user
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
        // Create pages for each room with photos
        for (const room of roomPhotos) {
            const hasBothPhases = room.checkinPhotos.length > 0 && room.handoverPhotos.length > 0

            // Add a new page for this room
            let photoPage = pdfDoc.addPage()
            pages.push(photoPage)
            let pageY = photoPage.getHeight() - 45

            // Simple page header with room name (no repeated branding)
            photoPage.drawText(`Evidence: ${room.roomName}`, {
                x: MARGIN,
                y: photoPage.getHeight() - 30,
                size: 12,
                font: helveticaBold,
                color: rgb(0.3, 0.3, 0.3),
            })

            if (hasBothPhases) {
                // Court-grade comparison header
                photoPage.drawText('Condition Comparison', {
                    x: MARGIN,
                    y: pageY,
                    size: 14,
                    font: helveticaBold,
                    color: rgb(0.1, 0.1, 0.1),
                })
                pageY -= 25

                pageY = await drawComparisonGrid(
                    pdfDoc,
                    photoPage,
                    room.roomName,
                    room.checkinPhotos,
                    room.handoverPhotos,
                    pageY,
                    photoPage.getWidth(),
                    helveticaBold,
                    helvetica
                )
            } else {
                // Single phase - show what we have
                photoPage.drawText(`Photo Evidence - ${room.roomName}`, {
                    x: MARGIN,
                    y: pageY,
                    size: 16,
                    font: helveticaBold,
                    color: rgb(0.12, 0.14, 0.17),
                })
                pageY -= 30

                if (room.checkinPhotos.length > 0) {
                    pageY = await drawPhotoGrid(
                        pdfDoc,
                        photoPage,
                        room.checkinPhotos,
                        pageY,
                        photoPage.getWidth(),
                        'Check-in Photos',
                        helvetica
                    )
                }

                if (room.handoverPhotos.length > 0) {
                    if (pageY < 200) {
                        // Add new page if not enough space
                        photoPage = pdfDoc.addPage()
                        pageY = photoPage.getHeight() - 80
                    }
                    pageY = await drawPhotoGrid(
                        pdfDoc,
                        photoPage,
                        room.handoverPhotos,
                        pageY,
                        photoPage.getWidth(),
                        'Handover Photos',
                        helvetica
                    )
                }
            }

            // Footer on photo page
            photoPage.drawText(FOOTER_TEXT, {
                x: MARGIN,
                y: 40,
                size: 10,
                font: timesRoman,
                color: rgb(0.5, 0.5, 0.5),
            })
        }

        // === APPENDIX: FILE INTEGRITY ===
        const allAssets = roomPhotos.flatMap(r => [...r.checkinPhotos, ...r.handoverPhotos])
        await drawHashAppendix(pdfDoc, allAssets, helveticaBold, helvetica)

        // Add page numbers to all pages
        const totalPages = pages.length
        pages.forEach((page, idx) => {
            drawPageNumber(page, idx + 1, totalPages, helvetica)
        })

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
            type: 'deposit_pack',
            payload: {
                generated_at: new Date(),
                checkin_count: totalCheckin,
                handover_count: totalHandover,
                rooms_count: roomPhotos.length
            },
            storage_path: storagePath
        })

        // Get signed URL
        const { data: signData } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUrl(storagePath, 3600) // 1 hour

        return NextResponse.json({ url: signData?.signedUrl })

    } catch (err: any) {
        console.error('PDF Gen Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
