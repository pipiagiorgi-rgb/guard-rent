'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, Loader2, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react'

interface Message {
    role: 'user' | 'assistant'
    content: string
}

interface AssistantPanelProps {
    caseId: string
    bookingContext?: {
        platform?: string
        checkIn?: string
        checkOut?: string
        arrivalPhotos?: number
        departurePhotos?: number
    }
}

const SUGGESTED_PROMPTS = [
    "What should I photograph at checkout?",
    "Help me draft a dispute response",
    "The host is claiming damage I didn't cause",
    "What evidence do I need for a dispute?"
]

export default function AssistantPanel({ caseId, bookingContext }: AssistantPanelProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const sendMessage = async (content: string) => {
        if (!content.trim() || loading) return

        const userMessage: Message = { role: 'user', content: content.trim() }
        const updatedMessages = [...messages, userMessage]
        setMessages(updatedMessages)
        setInput('')
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/ai/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    caseId,
                    messages: updatedMessages,
                    bookingContext
                })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response')
            }

            setMessages([...updatedMessages, { role: 'assistant', content: data.reply }])
        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        sendMessage(input)
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-6 bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all z-40 flex items-center gap-2"
            >
                <Sparkles size={18} />
                <span className="font-medium text-sm">Assistant</span>
            </button>
        )
    }

    return (
        <div className="fixed bottom-20 right-6 w-[380px] max-h-[480px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col z-40 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-slate-900">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-700 rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-white">Assistant</h3>
                        <p className="text-xs text-slate-400">Evidence & Disputes</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-white p-1"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                {messages.length === 0 ? (
                    <div className="text-center py-4">
                        <p className="text-sm text-slate-500 mb-4">
                            Ask me anything about documenting your stay or handling disputes.
                        </p>
                        <div className="space-y-2">
                            {SUGGESTED_PROMPTS.map((prompt, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(prompt)}
                                    className="w-full text-left text-sm px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-700 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, i) => (
                            <div
                                key={i}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[85%] px-4 py-2 rounded-2xl text-sm ${msg.role === 'user'
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-800'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-100 px-4 py-2 rounded-2xl">
                                    <Loader2 className="animate-spin text-slate-400" size={18} />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
                {error && (
                    <div className="text-xs text-red-500 text-center py-2">
                        {error}
                    </div>
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t bg-white">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-200 focus:border-slate-400 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 text-center">
                    AI responses are for guidance only. Not legal advice.
                </p>
            </form>
        </div>
    )
}
