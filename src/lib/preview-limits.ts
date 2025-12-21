/**
 * Preview Limits Management
 * 
 * Tracks preview usage limits per rental (caseId) using localStorage.
 * - 3 free questions per rental
 * - 1 translation request per rental
 * 
 * Limits are cleared when a pack is purchased, or user can have unlimited access.
 */

const STORAGE_KEY_PREFIX = 'rentvault_preview_'

// Limits
export const PREVIEW_QUESTION_LIMIT = 3
export const PREVIEW_TRANSLATION_LIMIT = 1

interface PreviewUsage {
    questionsUsed: number
    translationsUsed: number
}

// Get usage for a specific rental
function getUsage(caseId: string): PreviewUsage {
    if (typeof window === 'undefined') {
        return { questionsUsed: 0, translationsUsed: 0 }
    }

    try {
        const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${caseId}`)
        if (stored) {
            return JSON.parse(stored)
        }
    } catch (e) {
        console.error('Failed to read preview usage:', e)
    }

    return { questionsUsed: 0, translationsUsed: 0 }
}

// Save usage for a specific rental
function setUsage(caseId: string, usage: PreviewUsage): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${caseId}`, JSON.stringify(usage))
    } catch (e) {
        console.error('Failed to save preview usage:', e)
    }
}

// === Question Limits ===

export function getQuestionsUsed(caseId: string): number {
    return getUsage(caseId).questionsUsed
}

export function getQuestionsRemaining(caseId: string): number {
    return Math.max(0, PREVIEW_QUESTION_LIMIT - getQuestionsUsed(caseId))
}

export function canAskPreviewQuestion(caseId: string): boolean {
    return getQuestionsRemaining(caseId) > 0
}

export function recordPreviewQuestion(caseId: string): void {
    const usage = getUsage(caseId)
    usage.questionsUsed += 1
    setUsage(caseId, usage)
}

// === Translation Limits ===

export function getTranslationsUsed(caseId: string): number {
    return getUsage(caseId).translationsUsed
}

export function getTranslationsRemaining(caseId: string): number {
    return Math.max(0, PREVIEW_TRANSLATION_LIMIT - getTranslationsUsed(caseId))
}

export function canTranslatePreview(caseId: string): boolean {
    return getTranslationsRemaining(caseId) > 0
}

export function recordPreviewTranslation(caseId: string): void {
    const usage = getUsage(caseId)
    usage.translationsUsed += 1
    setUsage(caseId, usage)
}

// === Utility ===

export function clearPreviewUsage(caseId: string): void {
    if (typeof window === 'undefined') return

    try {
        localStorage.removeItem(`${STORAGE_KEY_PREFIX}${caseId}`)
    } catch (e) {
        console.error('Failed to clear preview usage:', e)
    }
}

// Check if user has purchased a pack (passed from server)
export function isPurchased(purchaseType: string | null): boolean {
    return purchaseType === 'checkin' || purchaseType === 'bundle' || purchaseType === 'moveout'
}
