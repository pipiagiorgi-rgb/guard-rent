'use client'

import { useState } from 'react'
import {
    Sparkles,
    ChevronDown,
    ChevronUp,
    FileText,
    Languages,
    MessageSquare,
    Mail,
    Loader2,
    Copy,
    Check
} from 'lucide-react'

interface DocumentAIPanelProps {
    contractId: string
    contractType: string
    providerName?: string
    label?: string
}

type AIAction = 'summarize' | 'translate' | 'question' | 'draft_notice'

const LANGUAGES = [
    { value: 'English', label: 'English' },
    { value: 'French', label: 'Français' },
    { value: 'German', label: 'Deutsch' },
    { value: 'Luxembourgish', label: 'Lëtzebuergesch' },
    { value: 'Dutch', label: 'Nederlands' },
    { value: 'Portuguese', label: 'Português' },
    { value: 'Spanish', label: 'Español' },
    { value: 'Italian', label: 'Italiano' },
]

export function DocumentAIPanel({ contractId, contractType, providerName, label }: DocumentAIPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [question, setQuestion] = useState('')
    const [targetLanguage, setTargetLanguage] = useState('English')
    const [copied, setCopied] = useState(false)

    const displayName = label || providerName || contractType

    const handleAction = async (action: AIAction) => {
        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const res = await fetch('/api/ai/related-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId,
                    action,
                    question: action === 'question' ? question : undefined,
                    targetLanguage: action === 'translate' ? targetLanguage : undefined
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'AI request failed')
            }

            setResponse(data.response)
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleCopy = () => {
        if (response) {
            navigator.clipboard.writeText(response)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <div className="border-t border-slate-100">
            {/* Toggle button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-500" />
                    Ask about this document
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Expanded panel */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-3">
                    {/* Quick actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleAction('summarize')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                            <FileText size={14} />
                            Summarise
                        </button>
                        <button
                            onClick={() => handleAction('draft_notice')}
                            disabled={loading}
                            className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                            <Mail size={14} />
                            Draft notice
                        </button>
                    </div>

                    {/* Translate with language picker */}
                    <div className="flex gap-2">
                        <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        >
                            {LANGUAGES.map(lang => (
                                <option key={lang.value} value={lang.value}>{lang.label}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => handleAction('translate')}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors disabled:opacity-50"
                        >
                            <Languages size={14} />
                            Translate
                        </button>
                    </div>

                    {/* Question input */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Ask a question about this contract..."
                            className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && question.trim()) {
                                    handleAction('question')
                                }
                            }}
                        />
                        <button
                            onClick={() => handleAction('question')}
                            disabled={loading || !question.trim()}
                            className="flex items-center gap-2 px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                        >
                            <MessageSquare size={14} />
                            Ask
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                            <Loader2 size={16} className="animate-spin" />
                            Thinking...
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Response */}
                    {response && (
                        <div className="bg-slate-50 rounded-lg p-4">
                            <div className="flex items-start justify-between gap-2 mb-2">
                                <span className="text-xs text-slate-400">AI Response</span>
                                <button
                                    onClick={handleCopy}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </button>
                            </div>
                            <div className="text-sm text-slate-700 whitespace-pre-wrap">
                                {response}
                            </div>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <p className="text-xs text-slate-400">
                        AI responses are for informational purposes only. Always verify important details.
                    </p>
                </div>
            )}
        </div>
    )
}
