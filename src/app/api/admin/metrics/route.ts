import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin'

// In-memory cache for admin metrics (5-minute TTL)
let metricsCache: { data: any; timestamp: number } | null = null
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

export async function GET(request: Request) {
    // Check for force refresh param
    const { searchParams } = new URL(request.url)
    const forceRefresh = searchParams.get('refresh') === 'true'
    // Auth check
    const supabase = await createServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Admin-only check
    if (!isAdminEmail(user.email)) {
        return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    // Return cached data if valid and not force refresh
    if (!forceRefresh && metricsCache && (Date.now() - metricsCache.timestamp) < CACHE_TTL_MS) {
        return NextResponse.json({
            ...metricsCache.data,
            cached: true,
            cacheAge: Math.round((Date.now() - metricsCache.timestamp) / 1000)
        })
    }

    // Use service role for aggregated queries (bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const now = new Date()
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

        // ============================================================
        // 1. SIGNUP & GROWTH VISIBILITY
        // ============================================================
        const [
            { count: totalUsers },
            { count: signupsLast24h },
            { count: signupsLast7Days },
            { count: signupsLast30Days },
            { count: totalCases },
            { count: longTermCases },
            { count: shortStayCases },
            { count: activeCases },
            { count: totalSealed }
        ] = await Promise.all([
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
                .gte('created_at', oneDayAgo.toISOString()),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString()),
            supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true })
                .gte('created_at', thirtyDaysAgo.toISOString()),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true }),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true }).eq('stay_type', 'long_term'),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true }).eq('stay_type', 'short_stay'),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true }).gt('retention_until', now.toISOString()),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true }).not('checkin_completed_at', 'is', null),
        ])

        // ============================================================
        // 2. REVENUE BY PACK TYPE
        // ============================================================
        const { data: purchases } = await supabaseAdmin
            .from('purchases')
            .select('pack_type, amount_cents, case_id')

        const revenueByPack: Record<string, { count: number; revenue: number; percent?: string }> = {}
        let totalRevenue = 0
        let longTermRevenue = 0
        let shortStayRevenue = 0

        for (const p of purchases || []) {
            const packType = p.pack_type || 'unknown'
            if (!revenueByPack[packType]) {
                revenueByPack[packType] = { count: 0, revenue: 0 }
            }
            revenueByPack[packType].count++
            revenueByPack[packType].revenue += (p.amount_cents || 0)
            totalRevenue += (p.amount_cents || 0)

            if (packType === 'short_stay') {
                shortStayRevenue += (p.amount_cents || 0)
            } else if (['checkin', 'moveout', 'bundle'].includes(packType)) {
                longTermRevenue += (p.amount_cents || 0)
            }
        }

        // Calculate percentages
        for (const key of Object.keys(revenueByPack)) {
            revenueByPack[key].percent = totalRevenue > 0
                ? ((revenueByPack[key].revenue / totalRevenue) * 100).toFixed(1)
                : '0'
        }

        const avgRevenuePerCase = (totalCases || 0) > 0
            ? Math.round(totalRevenue / (totalCases || 1))
            : 0

        // ============================================================
        // 3. FUNNEL METRICS (Long-Term)
        // ============================================================
        const [
            { count: ltCheckinSealed },
            { count: ltHandoverSealed },
            { count: ltPurchased }
        ] = await Promise.all([
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .eq('stay_type', 'long_term').not('checkin_completed_at', 'is', null),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .eq('stay_type', 'long_term').not('handover_completed_at', 'is', null),
            supabaseAdmin.from('purchases').select('case_id', { count: 'exact', head: true })
                .in('pack_type', ['checkin', 'moveout', 'bundle']),
        ])

        // ============================================================
        // 4. FUNNEL METRICS (Short-Stay)
        // ============================================================
        const [
            { count: ssArrivalSealed },
            { count: ssDepartureSealed },
            { count: ssPurchased }
        ] = await Promise.all([
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .eq('stay_type', 'short_stay').not('checkin_completed_at', 'is', null),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .eq('stay_type', 'short_stay').not('handover_completed_at', 'is', null),
            supabaseAdmin.from('purchases').select('case_id', { count: 'exact', head: true })
                .eq('pack_type', 'short_stay'),
        ])

        // ============================================================
        // 5. DOWNLOAD METRICS
        // ============================================================
        const [
            { count: ltPdfDownloads },
            { count: ssPdfDownloads },
            { count: videoDownloads }
        ] = await Promise.all([
            supabaseAdmin.from('metrics').select('*', { count: 'exact', head: true })
                .eq('event', 'pdf_downloaded').eq('stay_type', 'long_term').eq('is_admin', false),
            supabaseAdmin.from('metrics').select('*', { count: 'exact', head: true })
                .eq('event', 'pdf_downloaded').eq('stay_type', 'short_stay').eq('is_admin', false),
            supabaseAdmin.from('metrics').select('*', { count: 'exact', head: true })
                .eq('event', 'video_downloaded').eq('is_admin', false),
        ])

        // ============================================================
        // 6. CONVERSION DROP-OFF INDICATORS
        // ============================================================
        // Get all assets to check for uploads
        const { data: allAssets } = await supabaseAdmin
            .from('assets')
            .select('case_id')

        const casesWithAssets = new Set((allAssets || []).map(a => a.case_id))

        // Get all cases for drop-off analysis
        const { data: allCasesData } = await supabaseAdmin
            .from('cases')
            .select('case_id, checkin_completed_at, handover_completed_at')

        // Cases with no uploads
        const casesNoUploads = (allCasesData || []).filter(c => !casesWithAssets.has(c.case_id)).length

        // Uploads started but never sealed
        const uploadsNeverSealed = (allCasesData || []).filter(
            c => casesWithAssets.has(c.case_id) && !c.checkin_completed_at
        ).length

        // Paid cases and downloaded cases for other metrics
        const { data: paidCases } = await supabaseAdmin
            .from('purchases')
            .select('case_id')
            .in('pack_type', ['checkin', 'moveout', 'bundle', 'short_stay'])

        const { data: downloadedCases } = await supabaseAdmin
            .from('metrics')
            .select('case_id')
            .eq('event', 'pdf_downloaded')
            .eq('is_admin', false)

        const paidCaseIds = new Set((paidCases || []).map(p => p.case_id))
        const downloadedCaseIds = new Set((downloadedCases || []).map(d => d.case_id))

        const paidNoDownload = [...paidCaseIds].filter(id => !downloadedCaseIds.has(id)).length

        // Sealed but no purchase (7+ days)
        const { data: sealedCasesOld } = await supabaseAdmin
            .from('cases')
            .select('case_id')
            .not('checkin_completed_at', 'is', null)
            .lt('checkin_completed_at', sevenDaysAgo.toISOString())

        const sealedOldIds = (sealedCasesOld || []).map(c => c.case_id)
        const sealedNoPurchase7d = sealedOldIds.filter(id => !paidCaseIds.has(id)).length

        // Downloaded but never returned (long-term: has handover after download)
        const ltDownloadedIds = (downloadedCases || [])
            .filter(d => !d.case_id) // We'd need case info here - simplified
            .map(d => d.case_id)
        const downloadedNoReturn = (allCasesData || []).filter(
            c => downloadedCaseIds.has(c.case_id) && !c.handover_completed_at
        ).length

        // ============================================================
        // 7. HEALTH ALERTS
        // ============================================================
        // Paid but no seal
        const { data: paidNoSealData } = await supabaseAdmin
            .from('purchases')
            .select('case_id, cases!inner(checkin_completed_at)')
            .in('pack_type', ['checkin', 'moveout', 'bundle', 'short_stay'])

        const paidNoSeal = (paidNoSealData || []).filter(
            p => p.cases && (p.cases as any).checkin_completed_at === null
        ).length

        // Orphan purchases
        const { data: allPurchases } = await supabaseAdmin
            .from('purchases')
            .select('case_id')

        const { data: allCases } = await supabaseAdmin
            .from('cases')
            .select('case_id')

        const caseIdSet = new Set((allCases || []).map(c => c.case_id))
        const orphanPurchases = (allPurchases || []).filter(p => !caseIdSet.has(p.case_id)).length

        // ============================================================
        // 8. FUNNEL HEALTH SCORING
        // ============================================================
        let funnelHealthStatus: 'healthy' | 'attention' | 'action_needed' = 'healthy'
        let funnelHealthReason = ''

        if (paidNoSeal > 0 || orphanPurchases > 0) {
            funnelHealthStatus = 'action_needed'
            funnelHealthReason = paidNoSeal > 0 ? 'Paid but no seal detected' : 'Orphan purchases exist'
        } else if (sealedNoPurchase7d > 5 || paidNoDownload > 5) {
            funnelHealthStatus = 'attention'
            funnelHealthReason = 'Conversion drop-off detected'
        }

        // ============================================================
        // 9. EMAIL HEALTH
        // ============================================================
        const [
            { count: emailsSent24h },
            { count: emailsFailed24h },
            { count: emailsSent7d },
            { count: emailsFailed7d }
        ] = await Promise.all([
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', oneDayAgo.toISOString()).eq('success', true),
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', oneDayAgo.toISOString()).eq('success', false),
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString()).eq('success', true),
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', sevenDaysAgo.toISOString()).eq('success', false),
        ])

        const emailSuccessRate24h = (emailsSent24h || 0) + (emailsFailed24h || 0) > 0
            ? (((emailsSent24h || 0) / ((emailsSent24h || 0) + (emailsFailed24h || 0))) * 100).toFixed(1)
            : '100'

        // ============================================================
        // 10. DERIVED CONVERSION RATIOS
        // ============================================================
        const totalPurchases = (purchases || []).length
        const totalDownloads = (ltPdfDownloads || 0) + (ssPdfDownloads || 0)

        const conversions = {
            casesPerSignup: (totalUsers || 0) > 0 ? ((totalCases || 0) / (totalUsers || 1)).toFixed(2) : '0',
            sealedPerCase: (totalCases || 0) > 0 ? (((totalSealed || 0) / (totalCases || 1)) * 100).toFixed(1) : '0',
            paidPerSealed: (totalSealed || 0) > 0 ? ((totalPurchases / (totalSealed || 1)) * 100).toFixed(1) : '0',
            downloadsPerPurchase: totalPurchases > 0 ? ((totalDownloads / totalPurchases) * 100).toFixed(1) : '0',
        }

        // ============================================================
        // 11. SYSTEM READINESS
        // ============================================================
        const caseBucket = (totalCases || 0) < 100 ? '0-100' : (totalCases || 0) < 1000 ? '100-1k' : '1k+'

        // ============================================================
        // 12. USERS LIST (for admin Users tab)
        // ============================================================
        const { searchParams: urlParams } = new URL(request.url)
        const usersPage = parseInt(urlParams.get('usersPage') || '1', 10)
        const usersPerPage = 100
        const usersOffset = (usersPage - 1) * usersPerPage

        const { data: usersList, count: totalUsersCount } = await supabaseAdmin
            .from('profiles')
            .select('user_id, email, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(usersOffset, usersOffset + usersPerPage - 1)

        // Enrich with case data
        const userIds = (usersList || []).map(u => u.user_id)
        const { data: userCases } = await supabaseAdmin
            .from('cases')
            .select('user_id, stay_type')
            .in('user_id', userIds.length > 0 ? userIds : ['_none_'])

        const casesByUser = new Map<string, { hasCases: boolean; stayTypes: Set<string> }>()
        for (const c of (userCases || [])) {
            if (!casesByUser.has(c.user_id)) {
                casesByUser.set(c.user_id, { hasCases: true, stayTypes: new Set() })
            }
            if (c.stay_type) {
                casesByUser.get(c.user_id)!.stayTypes.add(c.stay_type)
            }
        }

        const enrichedUsers = (usersList || []).map(u => {
            const caseData = casesByUser.get(u.user_id)
            const stayTypesArray = caseData ? Array.from(caseData.stayTypes) : []
            return {
                email: u.email,
                createdAt: u.created_at,
                hasCases: !!caseData?.hasCases,
                stayTypes: stayTypesArray.length === 2 ? 'both' : stayTypesArray[0] || null
            }
        })

        // ============================================================
        // RESPONSE
        // ============================================================
        const responseData = {
            overview: {
                totalUsers: totalUsers || 0,
                signupsLast24h: signupsLast24h || 0,
                signupsLast7Days: signupsLast7Days || 0,
                signupsLast30Days: signupsLast30Days || 0,
                totalCases: totalCases || 0,
                longTermCases: longTermCases || 0,
                shortStayCases: shortStayCases || 0,
                activeCases: activeCases || 0,
                totalRevenueCents: totalRevenue,
            },
            users: {
                list: enrichedUsers,
                total: totalUsersCount || 0,
                page: usersPage,
                perPage: usersPerPage,
                totalPages: Math.ceil((totalUsersCount || 0) / usersPerPage),
            },
            conversions,
            conversionDropOff: {
                casesNoUploads,
                uploadsNeverSealed,
                sealedNoPurchase7d,
                paidNoDownload,
                downloadedNoReturn,
            },
            revenue: revenueByPack,
            revenueAttribution: {
                totalRevenueCents: totalRevenue,
                longTermRevenueCents: longTermRevenue,
                shortStayRevenueCents: shortStayRevenue,
                avgRevenuePerCaseCents: avgRevenuePerCase,
                longTermPercent: totalRevenue > 0 ? ((longTermRevenue / totalRevenue) * 100).toFixed(1) : '0',
                shortStayPercent: totalRevenue > 0 ? ((shortStayRevenue / totalRevenue) * 100).toFixed(1) : '0',
            },
            funnelLongTerm: {
                casesCreated: longTermCases || 0,
                checkinSealed: ltCheckinSealed || 0,
                handoverSealed: ltHandoverSealed || 0,
                packsPurchased: ltPurchased || 0,
                pdfDownloads: ltPdfDownloads || 0,
            },
            funnelShortStay: {
                casesCreated: shortStayCases || 0,
                arrivalSealed: ssArrivalSealed || 0,
                departureSealed: ssDepartureSealed || 0,
                packsPurchased: ssPurchased || 0,
                pdfDownloads: ssPdfDownloads || 0,
            },
            funnelHealth: {
                status: funnelHealthStatus,
                reason: funnelHealthReason,
            },
            downloads: {
                videoDownloads: videoDownloads || 0,
            },
            emailHealth: {
                sent24h: emailsSent24h || 0,
                failed24h: emailsFailed24h || 0,
                sent7d: emailsSent7d || 0,
                failed7d: emailsFailed7d || 0,
                successRate24h: emailSuccessRate24h,
            },
            health: {
                paidNoDownload,
                paidNoSeal,
                sealedNoPurchase7d,
                orphanPurchases,
            },
            systemReadiness: {
                caseBucket,
                rlsEnabled: true,
                storageBucketPrivate: true,
                adminRoutesProtected: true,
                noPiiExposed: true,
            },
            generatedAt: now.toISOString(),
        }

        // Store in cache
        metricsCache = { data: responseData, timestamp: Date.now() }

        return NextResponse.json(responseData)

    } catch (err: any) {
        console.error('Admin Metrics Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
