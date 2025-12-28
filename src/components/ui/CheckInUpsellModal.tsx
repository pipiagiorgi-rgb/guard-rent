'use client'

import { useState } from 'react'
import { X, Check, Loader2, Sparkles } from 'lucide-react'

interface UpsellModalProps {
    isOpen: boolean
    onClose: () => void
    onSelectPack: (packType: 'checkin' | 'bundle', amount: number) => void
    purchasing: boolean
}

export function CheckInUpsellModal({ isOpen, onClose, onSelectPack, purchasing }: UpsellModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 z-10"
                >
                    <X size={24} />
                </button>

                <div className="p-6 pb-8">
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h2 className="text-xl font-bold text-slate-900 mb-2">
                            Complete your purchase
                        </h2>
                        <p className="text-slate-600">
                            Choose the pack that fits your needs
                        </p>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {/* Full Bundle - Recommended */}
                        <button
                            onClick={() => onSelectPack('bundle', 3900)}
                            disabled={purchasing}
                            className="w-full relative p-4 border-2 border-blue-500 bg-blue-50 rounded-xl text-left hover:bg-blue-100 transition-colors disabled:opacity-50"
                        >
                            <div className="absolute -top-3 left-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-semibold rounded-full flex items-center gap-1">
                                <Sparkles size={12} />
                                BEST VALUE
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Full Bundle</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Move In + Move Out + Deposit Recovery
                                    </p>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-blue-600">€39</span>
                                    <p className="text-xs text-slate-500">Save €19</p>
                                </div>
                            </div>
                            <div className="mt-3 pt-3 border-t border-blue-200 grid grid-cols-2 gap-2 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    Move-In PDF
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    Move-Out PDF
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    Deposit Recovery Pack
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    1 Year Storage
                                </div>
                            </div>
                        </button>

                        {/* Check-In Only */}
                        <button
                            onClick={() => onSelectPack('checkin', 1900)}
                            disabled={purchasing}
                            className="w-full p-4 border-2 border-slate-200 rounded-xl text-left hover:border-slate-300 hover:bg-slate-50 transition-colors disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-semibold text-slate-900">Check-In Pack</h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        Move-In evidence only
                                    </p>
                                </div>
                                <span className="text-2xl font-bold text-slate-900">€19</span>
                            </div>
                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    Move-In PDF
                                </div>
                                <div className="flex items-center gap-1">
                                    <Check size={14} className="text-green-500" />
                                    1 Year Storage
                                </div>
                            </div>
                        </button>
                    </div>

                    {/* Loading indicator */}
                    {purchasing && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-slate-500">
                            <Loader2 size={16} className="animate-spin" />
                            <span className="text-sm">Redirecting to checkout...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
