import { login } from './actions'
import Link from 'next/link'

export default function LoginPage({
    searchParams,
}: {
    searchParams: { message: string; error: string }
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-[400px]">
                    {/* Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-2xl font-bold mb-2">Sign in to RentVault</h1>
                            <p className="text-slate-600">
                                Enter your email and we'll send you a secure login link.
                            </p>
                        </div>

                        <form action={login} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="sr-only">Email address</label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                    className="w-full p-4 rounded-xl border-2 border-slate-200 bg-white focus:bg-white focus:border-slate-900 transition-colors outline-none text-base"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 transition-colors text-base"
                            >
                                Send login link
                            </button>

                            {searchParams?.message && (
                                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm text-center">
                                    {searchParams.message}
                                </div>
                            )}

                            {searchParams?.error && (
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm text-center">
                                    {searchParams.error}
                                </div>
                            )}
                        </form>

                        <p className="text-sm text-slate-500 text-center mt-6">
                            Passwordless login. No password to remember.
                        </p>
                    </div>

                    {/* Back link */}
                    <div className="text-center mt-8">
                        <Link href="/" className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                            ← Back to home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    )
}
