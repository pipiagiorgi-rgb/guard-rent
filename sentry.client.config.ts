import * as Sentry from "@sentry/nextjs";

Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

    // Performance monitoring sample rate (0.0 to 1.0)
    tracesSampleRate: 0.1,

    // Only enable in production
    enabled: process.env.NODE_ENV === "production",

    // Set environment
    environment: process.env.NODE_ENV,

    // Replay configuration for session recordings
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,

    // Ignore certain errors
    ignoreErrors: [
        // Network errors from user's browser
        "Network request failed",
        "Failed to fetch",
        "Load failed",
        // User cancelled actions
        "AbortError",
    ],
});
