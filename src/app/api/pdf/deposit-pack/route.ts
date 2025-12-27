import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PDFPage, degrees } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'
import { getPhotosGroupedByRoom, drawComparisonGrid, drawPhotoGrid, drawHashAppendix } from '@/lib/pdf-images'

// Extend function timeout for PDF generation (requires Pro plan for >10s)
export const maxDuration = 60

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

        // Check if pack is purchased - admin users bypass this check, previews allowed
        let hasPurchased = false
        if (!isAdmin) {
            const { data: purchase } = await supabase
                .from('purchases')
                .select('pack_type')
                .eq('case_id', caseId)
                .eq('pack_type', 'deposit_pack')
                .single()

            hasPurchased = !!purchase

            // Block download for unpaid users (but allow preview)
            if (!purchase && !forPreview) {
                return NextResponse.json({ error: 'Pack not purchased' }, { status: 403 })
            }
        } else {
            hasPurchased = true
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

        // Fetch issues for this case
        const { data: issues } = await supabase
            .from('issues')
            .select('issue_id, room_name, incident_date, description, created_at')
            .eq('case_id', caseId)
            .order('incident_date', { ascending: false })

        // Note: Hash validation removed - timestamps are sufficient for evidence integrity

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
        coverPage.drawText('Move-Out Property Record', {
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
            ['Move-in photos', `${totalCheckin} photos`],
            ['Move-in sealed', rentalCase.checkin_completed_at
                ? new Date(rentalCase.checkin_completed_at).toLocaleDateString('en-GB')
                : 'Not sealed'],
            ['Move-out photos', `${totalHandover} photos`],
            ['Rooms documented', `${roomPhotos.length} rooms`],
            ['Issues reported', issues && issues.length > 0 ? `${issues.length} incident${issues.length !== 1 ? 's' : ''}` : 'None'],
            ['Move-out completed', rentalCase.handover_completed_at
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

        // Evidence handling - factual explanation (conditional on actual sealed states)
        yPos -= 25
        coverPage.drawText('Evidence handling', {
            x: MARGIN,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: rgb(0.3, 0.3, 0.3),
        })
        yPos -= 16

        // Build explanation dynamically based on actual sealed states
        const explanationLines: string[] = [
            'This record contains photos and documents uploaded to RentVault and timestamped using system time (UTC).',
        ]

        // Only mention locked photo sets if they are actually locked
        const checkinSealed = !!rentalCase.checkin_completed_at
        const handoverSealed = !!rentalCase.handover_completed_at

        if (checkinSealed && handoverSealed) {
            explanationLines.push('Move-in and move-out photo sets were sealed and cannot be modified.')
        } else if (checkinSealed) {
            explanationLines.push('Move-in photo set was sealed and cannot be modified.')
        } else if (handoverSealed) {
            explanationLines.push('Move-out photo set was sealed and cannot be modified.')
        }

        explanationLines.push('This report is a snapshot of stored records at the time of generation.')

        // Asymmetric coverage disclaimer - neutral, factual
        explanationLines.push('')
        explanationLines.push('Documentation may differ between move-in and move-out. The absence of photos for a')
        explanationLines.push('phase or room reflects what was recorded and does not imply condition or change.')

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
            coverPage.drawText('Final Meter Readings (move-out)', {
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
            coverPage.drawText('Move-out Notes', {
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

        // Issues section - show all documented issues with timestamps
        if (issues && issues.length > 0) {
            yPos -= 25
            coverPage.drawText('Issues Documented During Tenancy', {
                x: MARGIN,
                y: yPos,
                size: 14,
                font: helveticaBold,
            })
            yPos -= 20

            for (const issue of issues.slice(0, 5)) { // Limit to 5 issues on cover
                const issueDate = new Date(issue.incident_date).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })
                const loggedDate = new Date(issue.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                })

                coverPage.drawText(`• ${issue.room_name} — ${issueDate}`, {
                    x: MARGIN,
                    y: yPos,
                    size: 11,
                    font: helveticaBold,
                })
                yPos -= 14

                // Truncate description to fit
                const descPreview = issue.description.length > 70
                    ? issue.description.substring(0, 70) + '...'
                    : issue.description
                coverPage.drawText(descPreview, {
                    x: MARGIN + 10,
                    y: yPos,
                    size: 10,
                    font: helvetica,
                })
                yPos -= 12

                coverPage.drawText(`Logged: ${loggedDate}`, {
                    x: MARGIN + 10,
                    y: yPos,
                    size: 8,
                    font: helvetica,
                    color: rgb(0.5, 0.5, 0.5),
                })
                yPos -= 18
            }

            if (issues.length > 5) {
                coverPage.drawText(`+ ${issues.length - 5} more issues (see Issues Log for full details)`, {
                    x: MARGIN,
                    y: yPos,
                    size: 9,
                    font: helvetica,
                    color: rgb(0.4, 0.4, 0.4),
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
                photoPage.drawText('Property Condition — Move-In vs Move-Out', {
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
                // Single phase - show what we have with neutral note
                photoPage.drawText(`Photo Evidence - ${room.roomName}`, {
                    x: MARGIN,
                    y: pageY,
                    size: 16,
                    font: helveticaBold,
                    color: rgb(0.12, 0.14, 0.17),
                })
                pageY -= 30

                if (room.checkinPhotos.length > 0) {
                    // Show check-in photos
                    pageY = await drawPhotoGrid(
                        pdfDoc,
                        photoPage,
                        room.checkinPhotos,
                        pageY,
                        photoPage.getWidth(),
                        'Move-In Photos',
                        helvetica
                    )

                    // Neutral note: no handover photos for this room
                    if (room.handoverPhotos.length === 0) {
                        pageY -= 15
                        photoPage.drawText('Move-out photos were not documented for this room.', {
                            x: MARGIN,
                            y: pageY,
                            size: 9,
                            font: helvetica,
                            color: rgb(0.5, 0.5, 0.5),
                        })
                        pageY -= 15
                    }
                }

                if (room.handoverPhotos.length > 0) {
                    if (pageY < 200) {
                        // Add new page if not enough space
                        photoPage = pdfDoc.addPage()
                        pageY = photoPage.getHeight() - 80
                    }

                    // Neutral note: no check-in photos for this room
                    if (room.checkinPhotos.length === 0) {
                        photoPage.drawText('Move-in photos were not documented for this room.', {
                            x: MARGIN,
                            y: pageY,
                            size: 9,
                            font: helvetica,
                            color: rgb(0.5, 0.5, 0.5),
                        })
                        pageY -= 20
                    }

                    pageY = await drawPhotoGrid(
                        pdfDoc,
                        photoPage,
                        room.handoverPhotos,
                        pageY,
                        photoPage.getWidth(),
                        'Move-Out Photos',
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


        // Note: Hash appendix removed - timestamps provide sufficient evidence integrity

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
            type: 'deposit_pack',
            payload: {
                generated_at: new Date(),
                checkin_count: totalCheckin,
                handover_count: totalHandover,
                rooms_count: roomPhotos.length
            },
            storage_path: storagePath
        })

        // Get signed URL - with download option for non-previews
        const downloadFileName = forPreview
            ? undefined
            : `RentVault_Deposit_Recovery_Pack_${caseId.slice(0, 8)}.pdf`

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
