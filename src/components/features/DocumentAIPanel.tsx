'use client'

import { useState } from 'react'
import {
    MessageCircle,
    ChevronDown,
    ChevronUp,
    Languages,
    Loader2,
    Copy,
    Check,
    Send,
    Globe,
    FileText
} from 'lucide-react'

interface DocumentAIPanelProps {
    contractId: string
    contractType: string
    providerName?: string
    label?: string
}

type AIAction = 'summarize' | 'translate' | 'question'

const QUICK_LANGUAGES = [
    { value: 'English', label: 'English' },
    { value: 'French', label: 'French' },
    { value: 'German', label: 'German' },
    { value: 'Spanish', label: 'Spanish' },
    { value: 'Italian', label: 'Italian' },
    { value: 'Portuguese', label: 'Portuguese' },
]

// Suggestion chips based on document type
const getSuggestions = (contractType: string): string[] => {
    const baseSuggestions = [
        'What is the monthly cost?',
        'When can I cancel this?',
        'What is the notice period?',
    ]

    const typeSpecific: Record<string, string[]> = {
        internet: ['What is the data limit?', 'Is there a minimum term?'],
        electricity: ['What is the unit rate?', 'Are there standing charges?'],
        gas: ['What is the unit rate?', 'Is this a fixed or variable tariff?'],
        insurance: ['What is covered?', 'What is the excess amount?'],
        employment: ['What is the probation period?', 'What are the working hours?'],
    }

    return [...baseSuggestions, ...(typeSpecific[contractType] || [])]
}

export function DocumentAIPanel({ contractId, contractType, providerName, label }: DocumentAIPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [question, setQuestion] = useState('')
    const [selectedLanguage, setSelectedLanguage] = useState('English')
    const [customLanguage, setCustomLanguage] = useState('')
    const [copied, setCopied] = useState(false)

    const displayName = label || providerName || contractType
    const suggestions = getSuggestions(contractType)

    const handleAction = async (action: AIAction, customQuestion?: string) => {
        setLoading(true)
        setError(null)
        setResponse(null)

        try {
            const targetLang = customLanguage.trim() || selectedLanguage

            const res = await fetch('/api/ai/related-contract', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contractId,
                    action,
                    question: action === 'question' ? (customQuestion || question) : undefined,
                    targetLanguage: action === 'translate' ? targetLang : undefined
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'AI request failed')
            }

            setResponse(data.response)
            if (customQuestion) setQuestion('')
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

    const handleSuggestionClick = (suggestion: string) => {
        setQuestion(suggestion)
        handleAction('question', suggestion)
    }

    return (
        <div className="border-t border-slate-100">
            {/* Toggle button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm text-slate-600 hover:bg-slate-50 transition-colors"
            >
                <span className="flex items-center gap-2">
                    <MessageCircle size={14} className="text-slate-400" />
                    Ask about this document
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {/* Expanded panel */}
            {isExpanded && (
                <div className="px-4 pb-4 space-y-4">
                    {/* Ask section */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <MessageCircle size={14} />
                            Ask about this document
                        </h4>

                        {/* Quick actions row */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {/* Summarise button */}
                            <button
                                onClick={() => handleAction('summarize')}
                                disabled={loading}
                                className="px-3 py-1.5 text-xs bg-slate-800 text-white rounded-full font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
                            >
                                <FileText size={12} />
                                Summarise
                            </button>
                            {/* Suggestion chips */}
                            {suggestions.slice(0, 3).map((suggestion, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    disabled={loading}
                                    className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>

                        {/* Question input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="e.g. What happens if I cancel early?"
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && question.trim()) {
                                        handleAction('question')
                                    }
                                }}
                            />
                            <button
                                onClick={() => handleAction('question')}
                                disabled={loading || !question.trim()}
                                className="flex items-center justify-center w-10 h-10 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Translate section */}
                    <div className="bg-slate-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                            <Languages size={14} />
                            Translate document
                        </h4>

                        {/* Language pills */}
                        <div className="flex flex-wrap gap-2 mb-3">
                            {QUICK_LANGUAGES.map((lang) => (
                                <button
                                    key={lang.value}
                                    onClick={() => {
                                        setSelectedLanguage(lang.value)
                                        setCustomLanguage('')
                                    }}
                                    className={`px-3 py-1.5 text-xs rounded-full transition-colors ${selectedLanguage === lang.value && !customLanguage
                                        ? 'bg-slate-800 text-white'
                                        : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom language + translate button */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={customLanguage}
                                onChange={(e) => setCustomLanguage(e.target.value)}
                                placeholder="Or type any language..."
                                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
                            />
                            <button
                                onClick={() => handleAction('translate')}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                <Globe size={14} />
                                Translate
                            </button>
                        </div>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
                            <Loader2 size={16} className="animate-spin" />
                            Analysing document...
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
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="text-sm text-slate-700 whitespace-pre-wrap mb-3">
                                {response}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-xs text-slate-400 flex items-center gap-1">
                                    ℹ️ Not legal advice.
                                </span>
                                <button
                                    onClick={handleCopy}
                                    className="text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1 text-xs"
                                    title="Copy to clipboard"
                                >
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                    {copied ? 'Copied' : 'Copy'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
