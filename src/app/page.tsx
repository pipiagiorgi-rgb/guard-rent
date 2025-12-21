import Link from 'next/link'
import { FileText, Clock, Lock, Upload, Camera, Bell, FileDown, Users, Shield, Eye } from 'lucide-react'

export default function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-white">
            {/* Hero */}
            <section className="pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
                <div className="max-w-[1120px] mx-auto text-center">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 mb-4 md:mb-6 leading-[1.15]">
                        Protect your rental deposit.
                        <br />
                        <span className="text-slate-600">Never miss an important deadline.</span>
                    </h1>
                    <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto mb-8 md:mb-10 leading-relaxed px-4">
                        A privacy-first vault for tenants to store rental documents, move-in and move-out photos, and key notice dates — securely in one place.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-4 px-4">
                        <Link
                            href="/login"
                            className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                        >
                            Get started
                        </Link>
                        <Link
                            href="/pricing"
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all text-base md:text-lg"
                        >
                            See pricing
                        </Link>
                    </div>
                    <p className="text-sm text-slate-500">
                        Free to explore. Pay only when you need to save and export.
                    </p>

                    {/* Trust Strip */}
                    <div className="flex flex-col sm:flex-row justify-center items-start sm:items-center gap-4 sm:gap-10 mt-10 md:mt-14 pt-8 border-t border-slate-100 max-w-md sm:max-w-none mx-auto">
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users size={20} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Built for tenants</span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Eye size={20} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">No tracking or ads</span>
                        </div>
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                            <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Shield size={20} className="text-slate-600" />
                            </div>
                            <span className="text-sm font-medium text-slate-600">Your data stays private</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 md:py-24 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[1120px] mx-auto">
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8">
                        {/* Contract clarity */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-5">
                                <FileText size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Contract clarity</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Upload your lease to review key dates, notice periods, and important terms.
                                Ask questions and translate to your language — preview for free, save with a pack.
                            </p>
                        </div>

                        {/* Photo evidence */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-5">
                                <Camera size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Photo evidence</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Document apartment condition at move-in and again before handover.
                                Photos are stored with system upload timestamps for your records.
                            </p>
                        </div>

                        {/* Deadline reminders */}
                        <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600 mb-5">
                                <Bell size={24} />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Deadline reminders</h3>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Choose what to be reminded about — contract termination, renewals, and rent payments — and when you want reminders.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-16 md:py-24 px-4 md:px-6">
                <div className="max-w-[1120px] mx-auto">
                    <div className="text-center mb-12 md:mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                        {/* Step 1 */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <Upload size={24} />
                                </div>
                                <div className="text-sm font-medium text-slate-500">Step 1</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Review your lease</h3>
                            <p className="text-slate-600">
                                Upload your rental contract to see key dates and terms in a clear summary.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                    <Camera size={24} />
                                </div>
                                <div className="text-sm font-medium text-slate-500">Step 2</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Record condition</h3>
                            <p className="text-slate-600">
                                Take room-by-room photos at move-in and again before you return the keys.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Bell size={24} />
                                </div>
                                <div className="text-sm font-medium text-slate-500">Step 3</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Set reminders</h3>
                            <p className="text-slate-600">
                                Get notified before notice deadlines or rent due dates — only for what you choose.
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                    <FileDown size={24} />
                                </div>
                                <div className="text-sm font-medium text-slate-500">Step 4</div>
                            </div>
                            <h3 className="text-xl font-bold mb-2">Export when needed</h3>
                            <p className="text-slate-600">
                                Generate a clean, shareable PDF with your photos, timestamps, and timeline.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Who it's for */}
            <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50">
                <div className="max-w-[640px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Who it's for</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">
                        For tenants who want clarity, organisation, and peace of mind throughout their rental.
                        Especially useful when renting abroad or in a different language.
                    </p>
                </div>
            </section>

            {/* Pricing Teaser */}
            <section className="py-16 md:py-20 px-4 md:px-6">
                <div className="max-w-[640px] mx-auto text-center">
                    <h2 className="text-2xl md:text-3xl font-bold mb-4">Simple pricing</h2>
                    <p className="text-slate-600 mb-8 text-lg">
                        Explore for free in preview mode.
                        Pay only when you need to save and export your data.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/login"
                            className="px-8 py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-all"
                        >
                            Get started
                        </Link>
                        <Link
                            href="/pricing"
                            className="px-8 py-4 border-2 border-slate-200 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all"
                        >
                            See pricing
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 border-t border-slate-100 mt-auto">
                <div className="max-w-[1120px] mx-auto px-4 md:px-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-slate-500 text-sm text-center md:text-left">
                            © 2025 RentVault · RentVault securely stores and organises your rental documents. Not legal advice.
                        </div>
                        <div className="flex gap-6 text-sm">
                            <Link href="/privacy" className="text-slate-500 hover:text-slate-900 transition-colors">Privacy</Link>
                            <Link href="/terms" className="text-slate-500 hover:text-slate-900 transition-colors">Terms</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
