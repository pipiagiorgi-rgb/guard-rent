import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'

interface Asset {
    asset_id: string
    storage_path: string
    room_id: string | null
    type: string
    created_at: string
}

interface RoomPhotos {
    roomId: string
    roomName: string
    checkinPhotos: Asset[]
    handoverPhotos: Asset[]
}

// Constants for layout
const THUMBNAIL_WIDTH = 120
const THUMBNAIL_HEIGHT = 90
const PHOTOS_PER_ROW = 4
const MAX_PHOTOS_PER_PHASE = 4
const MARGIN = 50
const LABEL_HEIGHT = 14
const TIMESTAMP_HEIGHT = 10
const ROW_SPACING = 20

/**
 * Fetch image bytes from Supabase Storage
 */
export async function fetchImageBytes(storagePath: string): Promise<Uint8Array | null> {
    try {
        const supabase = await createClient()
        const { data: signedData } = await supabase.storage
            .from('guard-rent')
            .createSignedUrl(storagePath, 300) // 5 min expiry

        if (!signedData?.signedUrl) return null

        const response = await fetch(signedData.signedUrl)
        if (!response.ok) return null

        const arrayBuffer = await response.arrayBuffer()
        return new Uint8Array(arrayBuffer)
    } catch (err) {
        console.error('Failed to fetch image:', storagePath, err)
        return null
    }
}

/**
 * Embed an image into a PDF page at specified position
 * Returns true if successful
 */
export async function embedImageInPdf(
    pdfDoc: PDFDocument,
    page: PDFPage,
    imageBytes: Uint8Array,
    x: number,
    y: number,
    maxWidth: number,
    maxHeight: number
): Promise<boolean> {
    try {
        // Try to embed as JPEG first, then PNG
        let image
        try {
            image = await pdfDoc.embedJpg(imageBytes)
        } catch {
            try {
                image = await pdfDoc.embedPng(imageBytes)
            } catch {
                console.error('Failed to embed image - unsupported format')
                return false
            }
        }

        // Calculate scaled dimensions maintaining aspect ratio
        const { width: imgWidth, height: imgHeight } = image
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight)
        const scaledWidth = imgWidth * scale
        const scaledHeight = imgHeight * scale

        // Center the image in the allocated space
        const xOffset = (maxWidth - scaledWidth) / 2
        const yOffset = (maxHeight - scaledHeight) / 2

        page.drawImage(image, {
            x: x + xOffset,
            y: y + yOffset,
            width: scaledWidth,
            height: scaledHeight,
        })

        return true
    } catch (err) {
        console.error('Error embedding image:', err)
        return false
    }
}

/**
 * Get photos grouped by room for a case
 */
export async function getPhotosGroupedByRoom(caseId: string): Promise<RoomPhotos[]> {
    const supabase = await createClient()

    // Fetch rooms
    const { data: rooms } = await supabase
        .from('rooms')
        .select('room_id, name')
        .eq('case_id', caseId)
        .order('created_at')

    // Fetch all photos
    const { data: assets } = await supabase
        .from('assets')
        .select('asset_id, storage_path, room_id, type, created_at')
        .eq('case_id', caseId)
        .in('type', ['checkin_photo', 'photo', 'handover_photo'])
        .order('created_at')

    if (!rooms || !assets) return []

    // Group photos by room
    const result: RoomPhotos[] = rooms.map(room => {
        const checkinPhotos = assets.filter(a =>
            a.room_id === room.room_id &&
            (a.type === 'checkin_photo' || a.type === 'photo')
        )
        const handoverPhotos = assets.filter(a =>
            a.room_id === room.room_id &&
            a.type === 'handover_photo'
        )

        return {
            roomId: room.room_id,
            roomName: room.name,
            checkinPhotos,
            handoverPhotos
        }
    })

    // Filter to rooms with photos
    return result.filter(r => r.checkinPhotos.length > 0 || r.handoverPhotos.length > 0)
}

/**
 * Draw a photo grid on a PDF page
 * Returns the Y position after the grid
 */
export async function drawPhotoGrid(
    pdfDoc: PDFDocument,
    page: PDFPage,
    photos: Asset[],
    startY: number,
    pageWidth: number,
    phaseLabel: string,
    font: any
): Promise<number> {
    const photosToEmbed = photos.slice(0, MAX_PHOTOS_PER_PHASE)
    const morePhotos = photos.length - MAX_PHOTOS_PER_PHASE

    let yPos = startY

    // Phase label
    page.drawText(phaseLabel, {
        x: MARGIN,
        y: yPos,
        size: 11,
        font,
        color: rgb(0.3, 0.3, 0.3),
    })
    yPos -= 15

    // Draw photos in a grid
    let xPos = MARGIN
    let rowPhotos = 0

    for (const photo of photosToEmbed) {
        const imageBytes = await fetchImageBytes(photo.storage_path)

        if (imageBytes) {
            // Draw image placeholder border
            page.drawRectangle({
                x: xPos,
                y: yPos - THUMBNAIL_HEIGHT,
                width: THUMBNAIL_WIDTH,
                height: THUMBNAIL_HEIGHT,
                borderColor: rgb(0.85, 0.85, 0.85),
                borderWidth: 1,
            })

            // Embed the image
            await embedImageInPdf(
                pdfDoc,
                page,
                imageBytes,
                xPos,
                yPos - THUMBNAIL_HEIGHT,
                THUMBNAIL_WIDTH,
                THUMBNAIL_HEIGHT
            )

            // Draw timestamp below
            const timestamp = new Date(photo.created_at).toLocaleString('en-GB', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
            })
            page.drawText(timestamp, {
                x: xPos,
                y: yPos - THUMBNAIL_HEIGHT - TIMESTAMP_HEIGHT - 2,
                size: 7,
                font,
                color: rgb(0.5, 0.5, 0.5),
            })
        }

        xPos += THUMBNAIL_WIDTH + 10
        rowPhotos++

        // Move to next row if needed
        if (rowPhotos >= PHOTOS_PER_ROW) {
            xPos = MARGIN
            yPos -= THUMBNAIL_HEIGHT + TIMESTAMP_HEIGHT + ROW_SPACING
            rowPhotos = 0
        }
    }

    // Indicate more photos available
    if (morePhotos > 0) {
        yPos -= THUMBNAIL_HEIGHT + TIMESTAMP_HEIGHT + 5
        page.drawText(`+ ${morePhotos} more photos available in the app`, {
            x: MARGIN,
            y: yPos,
            size: 9,
            font,
            color: rgb(0.4, 0.5, 0.6),
        })
        yPos -= 15
    } else if (rowPhotos > 0) {
        yPos -= THUMBNAIL_HEIGHT + TIMESTAMP_HEIGHT + 10
    }

    return yPos
}

/**
 * Draw side-by-side comparison grid for a room
 * Returns the Y position after the grid
 */
export async function drawComparisonGrid(
    pdfDoc: PDFDocument,
    page: PDFPage,
    roomName: string,
    checkinPhotos: Asset[],
    handoverPhotos: Asset[],
    startY: number,
    pageWidth: number,
    fontBold: any,
    fontRegular: any
): Promise<number> {
    let yPos = startY

    // Room name header
    page.drawText(roomName, {
        x: MARGIN,
        y: yPos,
        size: 13,
        font: fontBold,
        color: rgb(0.12, 0.14, 0.17),
    })
    yPos -= 20

    const halfWidth = (pageWidth - MARGIN * 2 - 20) / 2
    const photosPerSide = 2 // 2 photos per phase in comparison mode

    // Check-in column
    const checkinToShow = checkinPhotos.slice(0, photosPerSide)
    const handoverToShow = handoverPhotos.slice(0, photosPerSide)

    // Draw column headers
    page.drawText('Check-in', {
        x: MARGIN,
        y: yPos,
        size: 10,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
    })
    page.drawText('Handover', {
        x: MARGIN + halfWidth + 20,
        y: yPos,
        size: 10,
        font: fontBold,
        color: rgb(0.4, 0.4, 0.4),
    })
    yPos -= 15

    // Draw photos side by side
    const maxPhotos = Math.max(checkinToShow.length, handoverToShow.length)
    const thumbWidth = halfWidth / 2 - 5
    const thumbHeight = thumbWidth * 0.75

    for (let row = 0; row < Math.ceil(maxPhotos / 2); row++) {
        for (let col = 0; col < 2; col++) {
            const idx = row * 2 + col

            // Check-in photo
            if (idx < checkinToShow.length) {
                const photo = checkinToShow[idx]
                const xPos = MARGIN + col * (thumbWidth + 5)
                const imageBytes = await fetchImageBytes(photo.storage_path)

                if (imageBytes) {
                    page.drawRectangle({
                        x: xPos,
                        y: yPos - thumbHeight,
                        width: thumbWidth,
                        height: thumbHeight,
                        borderColor: rgb(0.85, 0.85, 0.85),
                        borderWidth: 1,
                    })
                    await embedImageInPdf(pdfDoc, page, imageBytes, xPos, yPos - thumbHeight, thumbWidth, thumbHeight)

                    const ts = new Date(photo.created_at).toLocaleDateString('en-GB')
                    page.drawText(ts, { x: xPos, y: yPos - thumbHeight - 10, size: 6, font: fontRegular, color: rgb(0.5, 0.5, 0.5) })
                }
            }

            // Handover photo
            if (idx < handoverToShow.length) {
                const photo = handoverToShow[idx]
                const xPos = MARGIN + halfWidth + 20 + col * (thumbWidth + 5)
                const imageBytes = await fetchImageBytes(photo.storage_path)

                if (imageBytes) {
                    page.drawRectangle({
                        x: xPos,
                        y: yPos - thumbHeight,
                        width: thumbWidth,
                        height: thumbHeight,
                        borderColor: rgb(0.85, 0.85, 0.85),
                        borderWidth: 1,
                    })
                    await embedImageInPdf(pdfDoc, page, imageBytes, xPos, yPos - thumbHeight, thumbWidth, thumbHeight)

                    const ts = new Date(photo.created_at).toLocaleDateString('en-GB')
                    page.drawText(ts, { x: xPos, y: yPos - thumbHeight - 10, size: 6, font: fontRegular, color: rgb(0.5, 0.5, 0.5) })
                }
            }
        }
        yPos -= thumbHeight + 20
    }

    // Show "more photos" indicator
    const moreCheckin = checkinPhotos.length - photosPerSide
    const moreHandover = handoverPhotos.length - photosPerSide
    if (moreCheckin > 0 || moreHandover > 0) {
        const moreText = []
        if (moreCheckin > 0) moreText.push(`+${moreCheckin} check-in`)
        if (moreHandover > 0) moreText.push(`+${moreHandover} handover`)
        page.drawText(`${moreText.join(', ')} photos in app`, {
            x: MARGIN,
            y: yPos,
            size: 8,
            font: fontRegular,
            color: rgb(0.4, 0.5, 0.6),
        })
        yPos -= 15
    }

    return yPos - 10
}
