/**
 * PDF IMAGE GENERATION UTILITIES
 * ============================================================
 * 
 * EVIDENCE INTEGRITY NOTES:
 * - This module handles SEALED EVIDENCE ONLY (check-in and move-out photos)
 * - Related contracts are excluded by design (reference-only documents)
 * - All evidence assets must pass hash validation before PDF generation
 * - Photo asymmetry (missing check-in or move-out photos) is documented,
 *   not interpreted — absence of damage does not imply fault
 * 
 * LEGAL NEUTRALITY:
 * - PDFs present factual records without attribution
 * - Timestamps are UTC-based and immutable
 * - Missing data is labeled, not hidden
 * 
 * ============================================================
 */

import { PDFDocument, PDFPage, rgb } from 'pdf-lib'
import { createClient } from '@/lib/supabase/server'

interface Asset {
    asset_id: string
    storage_path: string
    room_id: string | null
    type: string
    created_at: string
    file_hash?: string
    file_hash_server?: string
}

interface RoomPhotos {
    roomId: string
    roomName: string
    checkinPhotos: Asset[]
    handoverPhotos: Asset[]
}

/**
 * Result of hash validation check
 */
export interface HashValidationResult {
    valid: boolean
    missingHashAssetIds: string[]
    totalAssets: number
}

/**
 * Validate that all assets have verified hashes before PDF generation.
 * This is a HARD REQUIREMENT for sealed evidence integrity.
 * 
 * @returns HashValidationResult with valid=false if any asset lacks a hash
 */
export function validateAssetHashes(assets: Asset[]): HashValidationResult {
    const missingHashAssetIds: string[] = []

    for (const asset of assets) {
        const hash = asset.file_hash_server || asset.file_hash
        if (!hash || hash.trim() === '') {
            missingHashAssetIds.push(asset.asset_id)
        }
    }

    return {
        valid: missingHashAssetIds.length === 0,
        missingHashAssetIds,
        totalAssets: assets.length
    }
}

// Constants for COURT-GRADE layout (dense, utilitarian)
const THUMBNAIL_WIDTH = 160   // Larger for better evidence visibility
const THUMBNAIL_HEIGHT = 120  // 4:3 ratio
const PHOTOS_PER_ROW = 3      // Denser grid
const MAX_PHOTOS_PER_PHASE = 9 // Show more evidence
const MARGIN = 40             // Reduced margins
const LABEL_HEIGHT = 12
const TIMESTAMP_HEIGHT = 9
const ROW_SPACING = 8         // Minimal spacing between rows


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
        .select('asset_id, storage_path, room_id, type, created_at, file_hash, file_hash_server')
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
            const timestamp = `Uploaded: ${new Date(photo.created_at).toLocaleString('en-GB', {
                timeZone: 'UTC',
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })} (UTC)`
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
    yPos -= 15

    const halfWidth = (pageWidth - MARGIN * 2 - 15) / 2
    const photosPerSide = 4 // Show more photos in comparison mode

    // Check-in column
    const checkinToShow = checkinPhotos.slice(0, photosPerSide)
    const handoverToShow = handoverPhotos.slice(0, photosPerSide)

    // Draw column headers (court-grade clarity)
    page.drawText('Move-In', {
        x: MARGIN,
        y: yPos,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
    })
    page.drawText('Move-Out', {
        x: MARGIN + halfWidth + 15,
        y: yPos,
        size: 9,
        font: fontBold,
        color: rgb(0.3, 0.3, 0.3),
    })
    yPos -= 12

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

                    const ts = `Uploaded: ${new Date(photo.created_at).toLocaleDateString('en-GB', { timeZone: 'UTC' })} (UTC)`
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

                    const ts = `Uploaded: ${new Date(photo.created_at).toLocaleDateString('en-GB', { timeZone: 'UTC' })} (UTC)`
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
        if (moreCheckin > 0) moreText.push(`+${moreCheckin} Move-In`)
        if (moreHandover > 0) moreText.push(`+${moreHandover} Move-Out`)
        page.drawText(`${moreText.join(', ')} photos — see full evidence on following pages`, {
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

/**
 * Draw File Integrity Appendix
 */
export async function drawHashAppendix(
    pdfDoc: PDFDocument,
    assets: Asset[],
    fontBold: any,
    fontRegular: any
) {
    if (assets.length === 0) return

    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    let yPos = height - 60

    // Header
    page.drawText('Appendix — File Integrity', {
        x: MARGIN,
        y: yPos,
        size: 16,
        font: fontBold,
        color: rgb(0.12, 0.14, 0.17),
    })
    yPos -= 30

    page.drawText('The following digital fingerprints (hashes) can be used to verify that the evidence records have not been altered.', {
        x: MARGIN,
        y: yPos,
        size: 10,
        font: fontRegular,
        color: rgb(0.3, 0.3, 0.3),
    })
    yPos -= 30

    // Table Header
    page.drawText('Date (UTC)', { x: MARGIN, y: yPos, size: 9, font: fontBold })
    page.drawText('Type', { x: MARGIN + 100, y: yPos, size: 9, font: fontBold })
    page.drawText('SHA-256 Hash', { x: MARGIN + 180, y: yPos, size: 9, font: fontBold })
    yPos -= 15

    for (const asset of assets) {
        if (yPos < 50) {
            const newPage = pdfDoc.addPage()
            yPos = height - 60
            page.drawText('Appendix — File Integrity (Cont.)', { x: MARGIN, y: yPos, size: 12, font: fontBold })
            yPos -= 30
        }

        const date = new Date(asset.created_at).toLocaleString('en-GB', {
            timeZone: 'UTC',
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        })

        const typeLabel = asset.type.replace('_photo', '').replace('_', ' ')

        // STRICT: Only include assets with verified hashes
        const hash = asset.file_hash_server || asset.file_hash
        if (!hash || hash.trim() === '') {
            // Skip assets without verified hashes (should not happen if validation passed)
            continue
        }

        page.drawText(date, { x: MARGIN, y: yPos, size: 8, font: fontRegular })
        page.drawText(typeLabel, { x: MARGIN + 100, y: yPos, size: 8, font: fontRegular })
        page.drawText(hash.substring(0, 64), { x: MARGIN + 180, y: yPos, size: 7, font: fontRegular })

        yPos -= 14
    }
}
