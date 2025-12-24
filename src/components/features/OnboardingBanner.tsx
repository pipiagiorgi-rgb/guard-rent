'use client'

import { useState, useEffect } from 'react'
import { Camera, FileCheck, Download, ChevronRight, X, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface OnboardingBannerProps {
    caseId: string
    currentStep: 'check-in' | 'handover' | 'exports' | 'overview'
    hasCheckinPhotos?: boolean
    hasHandoverPhotos?: boolean
    isCheckinLocked?: boolean
    isHandoverCompleted?: boolean
}

export function OnboardingBanner({
    caseId,
    currentStep,
    hasCheckinPhotos = false,
    hasHandoverPhotos = false,
    isCheckinLocked = false,
    isHandoverCompleted = false
}: OnboardingBannerProps) {
    const [dismissed, setDismissed] = useState(false)

    // Check localStorage for permanent dismissal
    useEffect(() => {
        const key = `onboarding-dismissed-${caseId}`
        if (localStorage.getItem(key) === 'true') {
            setDismissed(true)
        }
    }, [caseId])

    const handleDismiss = () => {
        const key = `onboarding-dismissed-${caseId}`
        localStorage.setItem(key, 'true')
        setDismissed(true)
    }

    if (dismissed) return null

    // Determine current progress
    const steps = [
        {
            key: 'check-in',
            icon: Camera,
            label: 'Document move-in',
            description: 'Take photos of each room',
            completed: hasCheckinPhotos,
            current: currentStep === 'check-in',
            href: `/vault/case/${caseId}/check-in`
        },
        {
            key: 'handover',
            icon: FileCheck,
            label: 'Record move-out',
            description: 'Final photos & meter readings',
            completed: isHandoverCompleted,
            current: currentStep === 'handover',
            href: `/vault/case/${caseId}/handover`
        },
        {
            key: 'exports',
            icon: Download,
            label: 'Export proof',
            description: 'Generate official PDF',
            completed: false,
            current: currentStep === 'exports',
            href: `/vault/case/${caseId}/exports`
        }
    ]

    // Find next incomplete step
    const nextStep = steps.find(s => !s.completed && !s.current)

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100 p-4 relative overflow-hidden">
            {/* Dismiss button */}
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/50 transition-colors"
                title="Dismiss"
            >
                <X size={16} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-blue-600" />
                <h3 className="font-semibold text-slate-800">Your evidence workflow</h3>
            </div>

            {/* Progress steps */}
            <div className="flex items-center gap-2 mb-4">
                {steps.map((step, index) => (
                    <div key={step.key} className="flex items-center">
                        <Link
                            href={step.href}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${step.current
                                    ? 'bg-blue-600 text-white'
                                    : step.completed
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-white/60 text-slate-500 hover:bg-white'
                                }`}
                        >
                            <step.icon size={16} />
                            <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
                        </Link>
                        {index < steps.length - 1 && (
                            <ChevronRight size={16} className="mx-1 text-slate-300" />
                        )}
                    </div>
                ))}
            </div>

            {/* Next step prompt */}
            {nextStep && !steps.find(s => s.current)?.completed && (
                <div className="text-sm text-slate-600">
                    <span className="font-medium">Next:</span> {nextStep.description}
                </div>
            )}
        </div>
    )
}
