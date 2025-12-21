import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'
import { getPhotosGroupedByRoom, drawComparisonGrid, drawPhotoGrid } from '@/lib/pdf-images'

const MARGIN = 50
const FOOTER_TEXT = 'RentVault securely stores and organises your rental documents. Not legal advice.'

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
        const { caseId } = body

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

        // === PAGE 1: COVER ===
        const coverPage = pdfDoc.addPage()
        const { width, height } = coverPage.getSize()

        // Header
        coverPage.drawText('RentVault', {
            x: MARGIN,
            y: height - 60,
            size: 28,
            font: helveticaBold,
            color: rgb(0.12, 0.14, 0.17),
        })

        coverPage.drawText('Deposit Recovery Pack', {
            x: MARGIN,
            y: height - 100,
            size: 22,
            font: helveticaBold,
            color: rgb(0.12, 0.14, 0.17),
        })

        // Divider
        coverPage.drawLine({
            start: { x: MARGIN, y: height - 120 },
            end: { x: width - MARGIN, y: height - 120 },
            thickness: 2,
            color: rgb(0.12, 0.14, 0.17),
        })

        // Property details
        let yPos = height - 160

        coverPage.drawText('Property Details', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        const details = [
            ['Rental', rentalCase.label],
            ['Address', rentalCase.address || 'Not specified'],
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
        yPos -= 30
        coverPage.drawText('Evidence Summary', {
            x: MARGIN,
            y: yPos,
            size: 14,
            font: helveticaBold,
        })
        yPos -= 25

        const evidence = [
            ['Check-in photos', `${totalCheckin} photos`],
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
                        displayValue = readingObj.value
                            ? String(readingObj.value) + (readingObj.unit ? ` ${readingObj.unit}` : '')
                            : JSON.stringify(reading)
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
            let pageY = photoPage.getHeight() - 60

            // Room header
            photoPage.drawText('RentVault', {
                x: MARGIN,
                y: photoPage.getHeight() - 40,
                size: 14,
                font: helveticaBold,
                color: rgb(0.5, 0.5, 0.5),
            })

            if (hasBothPhases) {
                // Side-by-side comparison
                photoPage.drawText('Before / After Comparison', {
                    x: MARGIN,
                    y: pageY,
                    size: 16,
                    font: helveticaBold,
                    color: rgb(0.12, 0.14, 0.17),
                })
                pageY -= 30

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
