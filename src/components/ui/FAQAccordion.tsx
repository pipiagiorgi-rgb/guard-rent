'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface FAQItem {
    question: string
    answer: string
}

interface FAQAccordionProps {
    items: FAQItem[]
}

export function FAQAccordion({ items }: FAQAccordionProps) {
    const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set())

    const toggleItem = (index: number) => {
        setOpenIndexes((prev) => {
            const next = new Set(prev)
            if (next.has(index)) {
                next.delete(index)
            } else {
                next.add(index)
            }
            return next
        })
    }

    return (
        <div className="space-y-2">
            {items.map((item, index) => {
                const isOpen = openIndexes.has(index)
                return (
                    <div key={index} className="border-b border-slate-100 last:border-b-0">
                        <button
                            type="button"
                            onClick={() => toggleItem(index)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault()
                                    toggleItem(index)
                                }
                            }}
                            aria-expanded={isOpen}
                            aria-controls={`faq-answer-${index}`}
                            className="w-full flex items-center justify-between py-4 text-left text-slate-900 hover:text-slate-700 transition-colors group"
                        >
                            <span className="font-medium text-sm md:text-base pr-4">
                                {item.question}
                            </span>
                            <ChevronDown
                                size={20}
                                className={`text-slate-400 group-hover:text-slate-600 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                    }`}
                            />
                        </button>
                        <div
                            id={`faq-answer-${index}`}
                            role="region"
                            aria-labelledby={`faq-question-${index}`}
                            className={`overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                                }`}
                        >
                            <p className="text-sm text-slate-600 leading-relaxed pr-8">
                                {item.answer}
                            </p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
