import { withSentryConfig } from '@sentry/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
    // output: 'export', // Disabled for V2 (Server Actions/Supabase)
    images: {
        // unoptimized: true, // Not strictly needed anymore unless on platforms without image optimization
    },
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    webpack: (config) => {
        config.resolve.alias.canvas = false;
        // config.resolve.alias.fs = false; // Usually not needed for server-side but helpful if mixed
        return config;
    }
};

// Sentry configuration options
const sentryWebpackPluginOptions = {
    // Suppresses source map upload logs during build
    silent: true,

    // Upload source maps to Sentry
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,

    // Route browser requests to Sentry through a Next.js rewrite
    // to circumvent ad-blockers
    tunnelRoute: "/monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Disables logger to reduce bundle size
    disableLogger: true,
};

// Wrap with Sentry (only if DSN is configured)
export default process.env.NEXT_PUBLIC_SENTRY_DSN
    ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
    : nextConfig;

// Trigger rebuild for Vercel CVE bypass
// Trigger deploy Sat Dec 27 00:00:07 CET 2025
