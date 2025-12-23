import type { Metadata } from 'next'
import Link from 'next/link'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
    title: 'Privacy Policy | RentVault',
    description: 'Learn how RentVault protects your data. Privacy-first, no tracking, secure storage. Full transparency on data collection, retention, and your rights.',
    alternates: {
        canonical: 'https://rentvault.ai/privacy'
    }
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white">
            <main className="max-w-[720px] mx-auto px-4 md:px-6 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold mb-8">Privacy Policy</h1>

                <div className="prose prose-slate max-w-none">
                    <p className="text-lg text-slate-600 mb-8">
                        Last updated: December 2025
                    </p>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Overview</h2>
                        <p className="text-slate-600 mb-4">
                            RentVault is a privacy-first vault for tenants to organise and store rental documents, photos, and key dates in one secure place.
                        </p>
                        <p className="text-slate-600">
                            We are committed to data minimisation and transparency. You remain in control of your data at all times and can delete individual rentals or your entire account directly from the application.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Information We Collect</h2>
                        <p className="text-slate-600 mb-4">
                            We collect only the information necessary to provide the RentVault service:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Email address (for account authentication and notifications)</li>
                            <li>Rental information you provide (such as dates, addresses, and labels)</li>
                            <li>Documents and photos you upload</li>
                            <li>Payment information (processed securely by Stripe — we do not store card details)</li>
                        </ul>
                        <p className="text-slate-600 mt-4">
                            We do not collect unnecessary personal data and do not use your information for advertising or tracking.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">How We Use Your Information</h2>
                        <p className="text-slate-600 mb-4">
                            We use your information only to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Provide and operate the RentVault service</li>
                            <li>Store and organise your rental documents and photos</li>
                            <li>Send reminders you explicitly enable (such as notice or rent reminders)</li>
                            <li>Generate downloadable PDF reports at your request</li>
                            <li>Process payments</li>
                            <li>Maintain and improve service reliability and security</li>
                        </ul>
                        <p className="text-slate-600 mt-4">
                            We do not sell, rent, or share your personal data with third parties for marketing purposes.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Data Retention</h2>
                        <p className="text-slate-600 mb-4">
                            Your documents and rental information are stored securely for <strong>12 months from the date of purchase</strong>.
                        </p>
                        <p className="text-slate-600 mb-4">
                            This retention period is designed to cover most rental timelines and deposit-related matters while respecting data-minimisation principles.
                        </p>
                        <p className="text-slate-600 mb-4">
                            You may delete your data at any time.
                        </p>
                        <p className="text-slate-600 mb-4">
                            If your rental lasts longer, you may choose to extend secure storage for an additional <strong>12 months for a one-time fee of €9</strong>.
                        </p>
                        <p className="text-slate-600">
                            If no extension is selected, your data will be permanently deleted after the retention period. You will receive advance notice before deletion.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Data Security</h2>
                        <p className="text-slate-600 mb-4">
                            Your data is stored securely and is accessible only to you.
                        </p>
                        <p className="text-slate-600 mb-4">
                            We use industry-standard safeguards, including encryption in transit and at rest, to protect your information.
                        </p>
                        <p className="text-slate-600">
                            Access to your data is restricted and controlled through authentication.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Your Rights</h2>
                        <p className="text-slate-600 mb-4">
                            You have the right to:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-slate-600">
                            <li>Access your data</li>
                            <li>Download your files and generated reports</li>
                            <li>Delete individual rentals</li>
                            <li>Delete your entire account</li>
                            <li>Request a copy of your stored data</li>
                        </ul>
                        <p className="text-slate-600 mt-4">
                            These actions can be performed directly from the application.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Cookies</h2>
                        <p className="text-slate-600 mb-4">
                            RentVault uses only strictly necessary cookies required for authentication and security.
                        </p>
                        <p className="text-slate-600">
                            We do not use analytics, tracking, or advertising cookies.
                        </p>
                    </section>

                    <section className="mb-10">
                        <h2 className="text-xl font-bold mb-4">Contact</h2>
                        <p className="text-slate-600 mb-4">
                            If you have questions about this Privacy Policy or how your data is handled, you can contact us at:
                        </p>
                        <p className="text-slate-600">
                            <a href="mailto:privacy@rentvault.ai" className="text-slate-900 underline hover:no-underline">privacy@rentvault.ai</a>
                        </p>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}
