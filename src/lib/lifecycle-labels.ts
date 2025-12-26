// Canonical lifecycle labels for user-facing UX
// Use these constants everywhere to prevent terminology drift

export const LIFECYCLE = {
    // Phase names
    MOVE_IN: "Move-In",
    MOVE_OUT: "Move-Out",
    MID_TENANCY: "Mid-Tenancy",

    // Button labels (irreversible actions)
    LOCK_MOVE_IN: "Complete & Lock Move-In",
    LOCK_MOVE_OUT: "Complete & Lock Move-Out",
    SEAL_EXPORT: "Seal Evidence & Generate PDF",

    // Modal titles
    CONFIRM_LOCK_MOVE_IN: "Complete & lock Move-In?",
    CONFIRM_LOCK_MOVE_OUT: "Complete & lock Move-Out?",

    // Evidence descriptions
    MOVE_IN_EVIDENCE: "Move-In evidence",
    MOVE_OUT_EVIDENCE: "Move-Out evidence",

    // Photo labels
    MOVE_IN_PHOTOS: "Move-In photos",
    MOVE_OUT_PHOTOS: "Move-Out photos",
} as const

// For comparison/grid displays
export const PHASE_LABELS = {
    checkin: LIFECYCLE.MOVE_IN,
    handover: LIFECYCLE.MOVE_OUT,
    'check-in': LIFECYCLE.MOVE_IN,
    'move-in': LIFECYCLE.MOVE_IN,
    'move-out': LIFECYCLE.MOVE_OUT,
} as const
