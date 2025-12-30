import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isAdminEmail } from '@/lib/admin'

// In-memory cache for support data (5-minute TTL)
let supportCache: { data: any; timestamp: number } | null = null
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
    if (!forceRefresh && supportCache && (Date.now() - supportCache.timestamp) < CACHE_TTL_MS) {
        return NextResponse.json({
            ...supportCache.data,
            cached: true,
            cacheAge: Math.round((Date.now() - supportCache.timestamp) / 1000)
        })
    }

    // Use service role for queries (bypasses RLS)
    const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    try {
        const now = new Date()
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const oneDayAgo = new Date()
        oneDayAgo.setDate(oneDayAgo.getDate() - 1)

        // ============================================================
        // 1. SYSTEM HEALTH
        // ============================================================
        const [
            { count: activeCases },
            { count: pendingSeals },
            { count: emailErrors24h },
            { count: sealedToday },
            { count: emailsSentToday },
            { count: videosUploadedToday }
        ] = await Promise.all([
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .gt('retention_until', now.toISOString()),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .is('checkin_completed_at', null),
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', oneDayAgo.toISOString()).eq('success', false),
            supabaseAdmin.from('cases').select('*', { count: 'exact', head: true })
                .gte('checkin_completed_at', todayStart.toISOString()),
            supabaseAdmin.from('email_logs').select('*', { count: 'exact', head: true })
                .gte('created_at', todayStart.toISOString()).eq('success', true),
            supabaseAdmin.from('assets').select('*', { count: 'exact', head: true })
                .eq('type', 'walkthrough_video').gte('created_at', todayStart.toISOString()),
        ])

        // PDFs generated today
        const { count: pdfsGeneratedToday } = await supabaseAdmin
            .from('outputs')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', todayStart.toISOString())

        // Pending PDFs (sealed but no output)
        const { data: sealedCases } = await supabaseAdmin
            .from('cases')
            .select('case_id')
            .not('checkin_completed_at', 'is', null)

        const { data: outputs } = await supabaseAdmin
            .from('outputs')
            .select('case_id')

        const outputCaseIds = new Set((outputs || []).map(o => o.case_id))
        const pendingPdfs = (sealedCases || []).filter(c => !outputCaseIds.has(c.case_id)).length

        // ============================================================
        // 2. SUPPORT QUEUE (Derived Issues)
        // ============================================================
        interface SupportIssue {
            caseId: string
            stayType: string
            issueType: string
            ageHours: number
            severity: 'low' | 'medium' | 'high'
        }

        const supportQueue: SupportIssue[] = []

        // Paid but no download
        const { data: purchases } = await supabaseAdmin
            .from('purchases')
            .select('case_id, created_at, pack_type')
            .in('pack_type', ['checkin', 'moveout', 'bundle', 'short_stay'])

        const { data: downloads } = await supabaseAdmin
            .from('metrics')
            .select('case_id')
            .eq('event', 'pdf_downloaded')

        const downloadedIds = new Set((downloads || []).map(d => d.case_id))
        const purchasedIds = new Set((purchases || []).map(p => p.case_id))

        for (const p of purchases || []) {
            if (!downloadedIds.has(p.case_id)) {
                const ageHours = Math.floor((now.getTime() - new Date(p.created_at).getTime()) / (1000 * 60 * 60))
                supportQueue.push({
                    caseId: p.case_id,
                    stayType: p.pack_type === 'short_stay' ? 'short_stay' : 'long_term',
                    issueType: 'Paid, not downloaded',
                    ageHours,
                    severity: ageHours > 168 ? 'medium' : 'low'
                })
            }
        }

        // Sealed but no purchase (7+ days)
        const { data: sealedNoPurchase } = await supabaseAdmin
            .from('cases')
            .select('case_id, stay_type, checkin_completed_at')
            .not('checkin_completed_at', 'is', null)
            .lt('checkin_completed_at', sevenDaysAgo.toISOString())

        for (const c of sealedNoPurchase || []) {
            if (!purchasedIds.has(c.case_id)) {
                const ageHours = Math.floor((now.getTime() - new Date(c.checkin_completed_at).getTime()) / (1000 * 60 * 60))
                supportQueue.push({
                    caseId: c.case_id,
                    stayType: c.stay_type || 'long_term',
                    issueType: 'Sealed, unpaid',
                    ageHours,
                    severity: 'low'
                })
            }
        }

        // Expiring soon (≤7 days)
        const sevenDaysFromNow = new Date()
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

        const { data: expiringSoon } = await supabaseAdmin
            .from('cases')
            .select('case_id, stay_type, retention_until')
            .gt('retention_until', now.toISOString())
            .lt('retention_until', sevenDaysFromNow.toISOString())

        for (const c of expiringSoon || []) {
            const hoursUntil = Math.floor((new Date(c.retention_until).getTime() - now.getTime()) / (1000 * 60 * 60))
            supportQueue.push({
                caseId: c.case_id,
                stayType: c.stay_type || 'long_term',
                issueType: 'Expiring soon',
                ageHours: hoursUntil,
                severity: hoursUntil < 72 ? 'medium' : 'low'
            })
        }

        // Incomplete short-stay (arrival sealed, no departure after 7 days)
        const { data: incompleteShortStay } = await supabaseAdmin
            .from('cases')
            .select('case_id, checkin_completed_at')
            .eq('stay_type', 'short_stay')
            .not('checkin_completed_at', 'is', null)
            .is('handover_completed_at', null)
            .lt('checkin_completed_at', sevenDaysAgo.toISOString())

        for (const c of incompleteShortStay || []) {
            const ageHours = Math.floor((now.getTime() - new Date(c.checkin_completed_at).getTime()) / (1000 * 60 * 60))
            supportQueue.push({
                caseId: c.case_id,
                stayType: 'short_stay',
                issueType: 'Incomplete short-stay',
                ageHours,
                severity: 'medium'
            })
        }

        // Sealed but no email sent (check if sealed case has no email log)
        const { data: emailLogs } = await supabaseAdmin
            .from('email_logs')
            .select('case_id')
            .eq('email_type', 'pack_purchase')

        const casesWithEmail = new Set((emailLogs || []).map(e => e.case_id).filter(Boolean))

        for (const c of sealedCases || []) {
            if (purchasedIds.has(c.case_id) && !casesWithEmail.has(c.case_id)) {
                supportQueue.push({
                    caseId: c.case_id,
                    stayType: 'unknown',
                    issueType: 'Sealed, no email sent',
                    ageHours: 0,
                    severity: 'medium'
                })
            }
        }

        // Orphan assets (asset exists but case deleted)
        const { data: allAssets } = await supabaseAdmin
            .from('assets')
            .select('asset_id, case_id')
            .limit(1000)

        const { data: allCases } = await supabaseAdmin
            .from('cases')
            .select('case_id')

        const caseIdSet = new Set((allCases || []).map(c => c.case_id))
        const orphanAssets = (allAssets || []).filter(a => a.case_id && !caseIdSet.has(a.case_id))

        for (const a of orphanAssets.slice(0, 10)) { // Limit to 10
            supportQueue.push({
                caseId: a.case_id || a.asset_id,
                stayType: 'unknown',
                issueType: 'Orphan asset (no case)',
                ageHours: 0,
                severity: 'low'
            })
        }

        // Sort by severity then age
        const severityOrder = { high: 0, medium: 1, low: 2 }
        supportQueue.sort((a, b) => {
            if (severityOrder[a.severity] !== severityOrder[b.severity]) {
                return severityOrder[a.severity] - severityOrder[b.severity]
            }
            return b.ageHours - a.ageHours
        })

        // ============================================================
        // 3. EMAIL HEALTH
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

        const successRate24h = (emailsSent24h || 0) + (emailsFailed24h || 0) > 0
            ? (((emailsSent24h || 0) / ((emailsSent24h || 0) + (emailsFailed24h || 0))) * 100).toFixed(1)
            : '100'

        const successRate7d = (emailsSent7d || 0) + (emailsFailed7d || 0) > 0
            ? (((emailsSent7d || 0) / ((emailsSent7d || 0) + (emailsFailed7d || 0))) * 100).toFixed(1)
            : '100'

        // Last email failure
        const { data: lastFailure } = await supabaseAdmin
            .from('email_logs')
            .select('created_at')
            .eq('success', false)
            .order('created_at', { ascending: false })
            .limit(1)

        const lastFailureTimestamp = lastFailure?.[0]?.created_at || null

        // ============================================================
        // RESPONSE
        // ============================================================
        const responseData = {
            systemHealth: {
                activeCases: activeCases || 0,
                pendingSeals: pendingSeals || 0,
                pendingPdfs,
                emailErrors24h: emailErrors24h || 0,
                status: (emailErrors24h || 0) > 5 ? 'warning' : 'healthy'
            },
            operationalToday: {
                sealedToday: sealedToday || 0,
                pdfsGeneratedToday: pdfsGeneratedToday || 0,
                videosUploadedToday: videosUploadedToday || 0,
                emailsSentToday: emailsSentToday || 0,
                failedActions24h: emailErrors24h || 0,
            },
            supportQueue: supportQueue.slice(0, 50),
            emailHealth: {
                sent24h: emailsSent24h || 0,
                failed24h: emailsFailed24h || 0,
                sent7d: emailsSent7d || 0,
                failed7d: emailsFailed7d || 0,
                successRate24h,
                successRate7d,
                lastFailureTimestamp,
            },
            orphanAssetCount: orphanAssets.length,
            generatedAt: now.toISOString(),
        }

        // Store in cache
        supportCache = { data: responseData, timestamp: Date.now() }

        return NextResponse.json(responseData)

    } catch (err: any) {
        console.error('Support API Error:', err)
        return NextResponse.json({ error: err.message }, { status: 500 })
    }
}
