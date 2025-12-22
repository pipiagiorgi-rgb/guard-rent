import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { v4 as uuidv4 } from 'uuid'
import { isAdminEmail } from '@/lib/admin'

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

        // 1. Fetch Case Data
        const { data: rentalCase } = await supabase
            .from('cases')
            .select('*')
            .eq('case_id', caseId)
            .single()

        if (!rentalCase) return NextResponse.json({ error: 'Case not found' }, { status: 404 })

        // Check entitlement - admin users bypass all checks
        if (!isAdmin && !['checkin', 'bundle'].includes(rentalCase.purchase_type) && rentalCase.purchase_type !== 'bundle') {
            // Strict check for non-admin users
            // Currently allowing all for prototype, uncomment to enforce:
            // return NextResponse.json({ error: 'Feature locked' }, { status: 403 })
        }

        // 2. Create PDF
        const pdfDoc = await PDFDocument.create()
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)
        const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
        const page = pdfDoc.addPage()
        const { width, height } = page.getSize()

        // Header - RentVault branding
        page.drawText('RentVault', {
            x: 50,
            y: height - 50,
            size: 24,
            font: helveticaBold,
            color: rgb(0.12, 0.14, 0.17),
        })

        page.drawText('Check-in Report', {
            x: 50,
            y: height - 90,
            size: 20,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        })

        // Divider line
        page.drawLine({
            start: { x: 50, y: height - 105 },
            end: { x: width - 50, y: height - 105 },
            thickness: 1,
            color: rgb(0.8, 0.8, 0.8),
        })

        page.drawText(`Rental: ${rentalCase.label}`, {
            x: 50,
            y: height - 140,
            size: 14,
            font: timesRomanFont,
        })

        page.drawText(`Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`, {
            x: 50,
            y: height - 160,
            size: 12,
            font: timesRomanFont,
            color: rgb(0.4, 0.4, 0.4),
        })

        page.drawText(`Address: ${rentalCase.address || 'Address not provided'}`, {
            x: 50,
            y: height - 185,
            size: 14,
            font: timesRomanFont,
        })

        // In a full implementation, we would loop through 'assets' (photos) and embed them here.
        page.drawText('(Photos would be embedded here in production)', {
            x: 50,
            y: height - 240,
            size: 12,
            font: timesRomanFont,
            color: rgb(0.5, 0.5, 0.5)
        })

        // Footer - Disclaimer
        page.drawText('RentVault securely stores and organises your rental documents. Not legal advice.', {
            x: 50,
            y: 40,
            size: 10,
            font: timesRomanFont,
            color: rgb(0.5, 0.5, 0.5),
        })

        const pdfBytes = await pdfDoc.save()
        const pdfBuffer = Buffer.from(pdfBytes)

        // 3. Upload to Storage
        const filename = `generated/${uuidv4()}.pdf`
        const storagePath = `cases/${caseId}/${filename}`

        const { error: uploadError } = await supabase
            .storage
            .from('guard-rent')
            .upload(storagePath, pdfBuffer, {
                contentType: 'application/pdf'
            })

        if (uploadError) throw uploadError

        // 4. Record Output
        await supabase.from('outputs').insert({
            case_id: caseId,
            user_id: user.id,
            type: 'checkin_report',
            payload: { generated_at: new Date() },
            storage_path: storagePath
        })

        // 5. Return Download URL
        const { data: signData } = await supabase.storage.from('guard-rent').createSignedUrl(storagePath, 60)

        return NextResponse.json({ url: signData?.signedUrl })

    } catch (err: any) {
        console.error('PDF Gen Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
