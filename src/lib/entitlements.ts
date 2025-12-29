/**
 * Case Entitlements Resolver
 * 
 * Single source of truth for all access checks.
 * All UI components and API routes should call this instead of scattered checks.
 */

import { createClient } from '@/lib/supabase/server'

export interface CaseEntitlements {
    // Stay type
    stayType: 'long_term' | 'short_stay'

    // What user can do - Long-term phases
    canUploadCheckin: boolean
    canUploadHandover: boolean
    canSealCheckin: boolean
    canSealHandover: boolean

    // What user can do - Short-stay phases (reuses checkin/handover timestamps)
    canUploadArrival: boolean
    canUploadDeparture: boolean
    canSealArrival: boolean
    canSealDeparture: boolean

    // PDF generation
    canGenerateCheckinPdf: boolean
    canGenerateDepositPdf: boolean
    canGenerateShortStayPdf: boolean

    // Features
    canUseDocuments: boolean
    canUseContractAnalysis: boolean  // long_term only
    canUseDeadlines: boolean         // long_term only

    // Completion status
    isCheckinComplete: boolean       // also used for Arrival
    isHandoverComplete: boolean      // also used for Departure

    // Storage
    retentionUntil: Date | null
    storageYearsPurchased: number
    isExpired: boolean
    isPendingDeletion: boolean

    // Purchases
    hasPurchasedCheckin: boolean
    hasPurchasedMoveout: boolean
    hasPurchasedBundle: boolean
    hasPurchasedShortStay: boolean
    hasPurchasedDocuments: boolean

    // Derived: what packs can user buy (for upsell)
    availablePacks: string[]
}

interface CaseData {
    case_id: string
    user_id: string
    stay_type: 'long_term' | 'short_stay' | null
    checkin_completed_at: string | null
    handover_completed_at: string | null
    retention_until: string | null
    storage_years_purchased: number | null
    deletion_status: string | null
    check_out_date: string | null
}

interface Purchase {
    pack_type: string
}

export async function getCaseEntitlements(
    caseId: string,
    userId: string
): Promise<CaseEntitlements | null> {
    const supabase = await createClient()

    // 1. Fetch case data
    const { data: caseData, error: caseError } = await supabase
        .from('cases')
        .select(`
            case_id,
            user_id,
            stay_type,
            checkin_completed_at,
            handover_completed_at,
            retention_until,
            storage_years_purchased,
            deletion_status,
            check_out_date
        `)
        .eq('case_id', caseId)
        .eq('user_id', userId)
        .single()

    if (caseError || !caseData) {
        return null
    }

    // 2. Fetch all purchases for this case
    const { data: purchases } = await supabase
        .from('purchases')
        .select('pack_type')
        .eq('case_id', caseId)

    const purchasedPacks = new Set((purchases || []).map(p => p.pack_type))

    // 3. Determine stay type (default to long_term for existing cases)
    const stayType: 'long_term' | 'short_stay' = caseData.stay_type === 'short_stay' ? 'short_stay' : 'long_term'

    // 4. Check purchased packs
    const hasPurchasedCheckin = purchasedPacks.has('checkin') || purchasedPacks.has('bundle')
    const hasPurchasedMoveout = purchasedPacks.has('moveout') || purchasedPacks.has('bundle')
    const hasPurchasedBundle = purchasedPacks.has('bundle')
    const hasPurchasedShortStay = purchasedPacks.has('short_stay')
    const hasPurchasedDocuments = purchasedPacks.has('related_contracts')

    // 5. Completion status (reused for both stay types)
    const isCheckinComplete = !!caseData.checkin_completed_at
    const isHandoverComplete = !!caseData.handover_completed_at

    // 6. Retention status
    const retentionUntil = caseData.retention_until ? new Date(caseData.retention_until) : null
    const now = new Date()
    const isExpired = retentionUntil ? now > retentionUntil : false
    const isPendingDeletion = caseData.deletion_status === 'pending_deletion'

    // 7. Build entitlements based on stay type
    const isLongTerm = stayType === 'long_term'
    const isShortStay = stayType === 'short_stay'

    // 8. Available packs for upsell
    const availablePacks: string[] = []
    if (isLongTerm) {
        if (!hasPurchasedBundle) {
            if (!hasPurchasedCheckin) availablePacks.push('checkin')
            if (!hasPurchasedMoveout) availablePacks.push('moveout')
            if (!hasPurchasedCheckin && !hasPurchasedMoveout) availablePacks.push('bundle')
        }
        if (!hasPurchasedDocuments) availablePacks.push('related_contracts')
    } else if (isShortStay) {
        if (!hasPurchasedShortStay) availablePacks.push('short_stay')
    }

    return {
        stayType,

        // Long-term phases
        canUploadCheckin: isLongTerm,
        canUploadHandover: isLongTerm,
        canSealCheckin: isLongTerm && hasPurchasedCheckin,
        canSealHandover: isLongTerm && hasPurchasedMoveout,

        // Short-stay phases (maps to same timestamps)
        canUploadArrival: isShortStay,
        canUploadDeparture: isShortStay,
        canSealArrival: isShortStay && hasPurchasedShortStay,
        canSealDeparture: isShortStay && hasPurchasedShortStay,

        // PDF generation
        canGenerateCheckinPdf: isLongTerm && hasPurchasedCheckin && isCheckinComplete,
        canGenerateDepositPdf: isLongTerm && hasPurchasedMoveout && isHandoverComplete,
        canGenerateShortStayPdf: isShortStay && hasPurchasedShortStay,

        // Features
        canUseDocuments: true,  // Both can upload, but AI is disabled for short-stay
        canUseContractAnalysis: isLongTerm,
        canUseDeadlines: isLongTerm,

        // Completion
        isCheckinComplete,
        isHandoverComplete,

        // Storage
        retentionUntil,
        storageYearsPurchased: caseData.storage_years_purchased || 1,
        isExpired,
        isPendingDeletion,

        // Purchases
        hasPurchasedCheckin,
        hasPurchasedMoveout,
        hasPurchasedBundle,
        hasPurchasedShortStay,
        hasPurchasedDocuments,

        // Upsell
        availablePacks
    }
}

/**
 * Helper to check if a case is short-stay (for guards)
 */
export async function isShortStayCase(caseId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cases')
        .select('stay_type')
        .eq('case_id', caseId)
        .single()

    return data?.stay_type === 'short_stay'
}

/**
 * Helper to check if a case is long-term (for guards)
 */
export async function isLongTermCase(caseId: string): Promise<boolean> {
    const supabase = await createClient()
    const { data } = await supabase
        .from('cases')
        .select('stay_type')
        .eq('case_id', caseId)
        .single()

    return data?.stay_type !== 'short_stay'  // Default to long-term
}
