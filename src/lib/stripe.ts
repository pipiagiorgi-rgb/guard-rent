import Stripe from 'stripe';

// Fallback to dummy key during build if env var is missing
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build', {
    apiVersion: '2025-12-15.clover',
    typescript: true,
});
