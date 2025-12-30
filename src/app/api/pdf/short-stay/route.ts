import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb, PDFPage, degrees } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'
import { drawPhotoGrid } from '@/lib/pdf-images'
import { trackMetric } from '@/lib/metrics'

// Extend function timeout for PDF generation
export const maxDuration = 60

const MARGIN = 50
const FOOTER_TEXT = '© RentVault 2025 · Securely stores and organises your rental documents. Not legal advice.'

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

export async function POST(request: Request) {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const isAdmin = isAdminEmail(user.email)

    try {
        const body = await request.json()
        const { caseId, forPreview = false } = body as { caseId: string; forPreview?: boolean }

        if (!caseId) {
            return NextResponse.json({ error: 'Missing Case ID' }, { status: 400 })
        }

        // Verify ownership and stay_type
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('*')
            .eq('case_id', caseId)
            .eq('user_id', user.id)
            .single()

        if (!rentalCase) {
            return NextResponse.json({ error: 'Rental not found' }, { status: 404 })
        }

        // GUARD: Only allow short_stay cases
        if (rentalCase.stay_type !== 'short_stay') {
            return NextResponse.json({ error: 'This PDF is only for short-stay cases' }, { status: 400 })
        }

        // Check entitlement (short_stay pack or admin)
        const { data: purchases } = await supabase
            .from('purchases')
            .select('pack_type')
            .eq('case_id', caseId)

        const hasShortStayPack = purchases?.some(p => p.pack_type === 'short_stay') || isAdmin

        if (!hasShortStayPack && !forPreview) {
            return NextResponse.json({ error: 'Short-stay pack required' }, { status: 403 })
        }

        // Fetch photos
        const { data: arrivalPhotos } = await supabase
            .from('assets')
            .select('asset_id, storage_path, created_at')
            .eq('case_id', caseId)
            .eq('type', 'checkin_photo')
            .order('created_at')

        const { data: departurePhotos } = await supabase
            .from('assets')
            .select('asset_id, storage_path, created_at')
            .eq('case_id', caseId)
            .eq('type', 'handover_photo')
            .order('created_at')

        // Fetch walkthrough videos
        const { data: arrivalVideo } = await supabase
            .from('assets')
            .select('asset_id, storage_path, created_at, duration_seconds')
            .eq('case_id', caseId)
            .eq('type', 'walkthrough_video')
            .eq('phase', 'check-in')
            .single()

        const { data: departureVideo } = await supabase
            .from('assets')
            .select('asset_id, storage_path, created_at, duration_seconds')
            .eq('case_id', caseId)
            .eq('type', 'walkthrough_video')
            .eq('phase', 'handover')
            .single()

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

        // Title
        coverPage.drawText('Short-Stay Evidence Report', {
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

        // Divider
        coverPage.drawLine({
            start: { x: MARGIN, y: height - 85 },
            end: { x: width - MARGIN, y: height - 85 },
            thickness: 0.5,
            color: rgb(0.3, 0.3, 0.3),
        })

        // Property details
        let yPos = height - 110

        coverPage.drawText('Booking Details', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        const details = [
            ['Property', rentalCase.label],
            ['Platform', rentalCase.platform_name || 'Not specified'],
            ['Reservation ID', rentalCase.reservation_id || 'Not specified'],
            ['Check-in', rentalCase.check_in_date || 'N/A'],
            ['Check-out', rentalCase.check_out_date || 'N/A'],
        ]

        if (rentalCase.checkin_completed_at) {
            details.push(['Arrival Sealed', new Date(rentalCase.checkin_completed_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
            })])
        }

        if (rentalCase.handover_completed_at) {
            details.push(['Departure Sealed', new Date(rentalCase.handover_completed_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'long', year: 'numeric'
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
                x: 160,
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

        const summary = [
            ['Arrival photos', `${arrivalPhotos?.length || 0} photos`],
            ['Arrival video', arrivalVideo ? 'Recorded (timestamped)' : 'Not recorded'],
            ['Departure photos', `${departurePhotos?.length || 0} photos`],
            ['Departure video', departureVideo ? 'Recorded (timestamped)' : 'Not recorded'],
        ]

        for (const [label, value] of summary) {
            coverPage.drawText(`${label}:`, {
                x: MARGIN,
                y: yPos,
                size: 11,
                font: helveticaBold,
            })
            coverPage.drawText(value, {
                x: 160,
                y: yPos,
                size: 11,
                font: helvetica,
            })
            yPos -= 18
        }

        // Video reference note (if any videos exist)
        if (arrivalVideo || departureVideo) {
            yPos -= 10
            coverPage.drawText('Walkthrough Videos', {
                x: MARGIN,
                y: yPos,
                size: 12,
                font: helveticaBold,
                color: rgb(0.3, 0.3, 0.3),
            })
            yPos -= 16

            if (arrivalVideo) {
                coverPage.drawText('• Arrival walkthrough video recorded', {
                    x: MARGIN,
                    y: yPos,
                    size: 10,
                    font: helvetica,
                    color: rgb(0.3, 0.3, 0.3),
                })
                yPos -= 14
            }
            if (departureVideo) {
                coverPage.drawText('• Departure walkthrough video recorded', {
                    x: MARGIN,
                    y: yPos,
                    size: 10,
                    font: helvetica,
                    color: rgb(0.3, 0.3, 0.3),
                })
                yPos -= 14
            }

            coverPage.drawText('Videos are available as downloadable files and are not embedded in this PDF.', {
                x: MARGIN,
                y: yPos,
                size: 9,
                font: helvetica,
                color: rgb(0.5, 0.5, 0.5),
            })
            yPos -= 14
        }

        // Explanation
        yPos -= 20
        coverPage.drawText('Evidence handling', {
            x: MARGIN,
            y: yPos,
            size: 12,
            font: helveticaBold,
            color: rgb(0.3, 0.3, 0.3),
        })
        yPos -= 16

        const explanationLines = [
            'This report documents the condition of the property at arrival and departure.',
            'Photos are timestamped using system time (UTC) and stored securely.',
            'This report is a snapshot of stored records at the time of generation.',
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

        // Footer
        coverPage.drawText(FOOTER_TEXT, {
            x: MARGIN,
            y: 40,
            size: 10,
            font: timesRoman,
            color: rgb(0.5, 0.5, 0.5),
        })

        // === ARRIVAL PHOTOS PAGE ===
        if (arrivalPhotos && arrivalPhotos.length > 0) {
            const arrivalPage = pdfDoc.addPage()
            pages.push(arrivalPage)
            let pageY = arrivalPage.getHeight() - 60

            arrivalPage.drawText('RentVault', {
                x: MARGIN,
                y: arrivalPage.getHeight() - 40,
                size: 14,
                font: helveticaBold,
                color: rgb(0.5, 0.5, 0.5),
            })

            arrivalPage.drawText('Arrival Evidence', {
                x: MARGIN,
                y: pageY,
                size: 16,
                font: helveticaBold,
                color: rgb(0.12, 0.14, 0.17),
            })
            pageY -= 30

            // Draw photo grid with embedded images
            pageY = await drawPhotoGrid(
                pdfDoc,
                arrivalPage,
                arrivalPhotos.map(p => ({
                    asset_id: p.asset_id,
                    storage_path: p.storage_path,
                    room_id: null,
                    type: 'checkin_photo',
                    created_at: p.created_at
                })),
                pageY,
                arrivalPage.getWidth(),
                `${arrivalPhotos.length} photos uploaded at check-in`,
                helvetica
            )

            arrivalPage.drawText(FOOTER_TEXT, {
                x: MARGIN,
                y: 40,
                size: 10,
                font: timesRoman,
                color: rgb(0.5, 0.5, 0.5),
            })
        }

        // === DEPARTURE PHOTOS PAGE ===
        if (departurePhotos && departurePhotos.length > 0) {
            const departurePage = pdfDoc.addPage()
            pages.push(departurePage)
            let pageY = departurePage.getHeight() - 60

            departurePage.drawText('RentVault', {
                x: MARGIN,
                y: departurePage.getHeight() - 40,
                size: 14,
                font: helveticaBold,
                color: rgb(0.5, 0.5, 0.5),
            })

            departurePage.drawText('Departure Evidence', {
                x: MARGIN,
                y: pageY,
                size: 16,
                font: helveticaBold,
                color: rgb(0.12, 0.14, 0.17),
            })
            pageY -= 30

            // Draw photo grid with embedded images
            pageY = await drawPhotoGrid(
                pdfDoc,
                departurePage,
                departurePhotos.map(p => ({
                    asset_id: p.asset_id,
                    storage_path: p.storage_path,
                    room_id: null,
                    type: 'handover_photo',
                    created_at: p.created_at
                })),
                pageY,
                departurePage.getWidth(),
                `${departurePhotos.length} photos uploaded at check-out`,
                helvetica
            )

            departurePage.drawText(FOOTER_TEXT, {
                x: MARGIN,
                y: 40,
                size: 10,
                font: timesRoman,
                color: rgb(0.5, 0.5, 0.5),
            })
        }

        // Add page numbers
        const totalPages = pages.length
        pages.forEach((page, idx) => {
            drawPageNumber(page, idx + 1, totalPages, helvetica)
        })

        // Add watermarks if preview
        if (forPreview) {
            for (const page of pdfDoc.getPages()) {
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
            type: 'short_stay_report',
            payload: {
                generated_at: new Date(),
                arrival_photo_count: arrivalPhotos?.length || 0,
                departure_photo_count: departurePhotos?.length || 0,
            },
            storage_path: storagePath
        })

        // Get signed URL
        const downloadFileName = forPreview
            ? undefined
            : `RentVault_Short-Stay_Report_${caseId.slice(0, 8)}.pdf`

        const { data: signData } = await supabase
            .storage
            .from('guard-rent')
            .createSignedUrl(storagePath, 3600, downloadFileName ? { download: downloadFileName } : {})

        // Track download metric (only for final downloads, not previews)
        if (!forPreview) {
            await trackMetric({
                event: 'pdf_downloaded',
                case_id: caseId,
                user_id: user.id,
                stay_type: 'short_stay',
                pdf_type: 'short_stay',
                is_admin: isAdmin,
                is_preview: false,
            })
        }

        return NextResponse.json({ url: signData?.signedUrl })

    } catch (err: any) {
        console.error('Short-stay PDF Gen Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
