import OpenAI from 'openai';

// Server-side only client. Check for key to avoid runtime errors on build if missing.
export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});
