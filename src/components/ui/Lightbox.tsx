'use client'

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'

interface LightboxProps {
    images: {
        src: string
        alt?: string
        caption?: string
        subcaption?: string
    }[]
    initialIndex?: number
    isOpen: boolean
    onClose: () => void
}

export function Lightbox({ images, initialIndex = 0, isOpen, onClose }: LightboxProps) {
    const [currentIndex, setCurrentIndex] = useState(initialIndex)
    const [zoom, setZoom] = useState(1)

    useEffect(() => {
        setCurrentIndex(initialIndex)
    }, [initialIndex])

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return
            if (e.key === 'Escape') onClose()
            if (e.key === 'ArrowLeft') showPrev()
            if (e.key === 'ArrowRight') showNext()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, currentIndex])

    if (!isOpen || images.length === 0) return null

    const showPrev = () => {
        setCurrentIndex(prev => (prev === 0 ? images.length - 1 : prev - 1))
        setZoom(1)
    }

    const showNext = () => {
        setCurrentIndex(prev => (prev === images.length - 1 ? 0 : prev + 1))
        setZoom(1)
    }

    const currentImage = images[currentIndex]

    return (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
            {/* Header / Controls */}
            <div className="flex items-center justify-between p-4 text-white z-50">
                <div className="text-sm text-slate-300">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setZoom(z => Math.max(1, z - 0.5))} className="p-2 hover:bg-white/10 rounded-full">
                        <ZoomOut size={20} />
                    </button>
                    <button onClick={() => setZoom(z => Math.min(3, z + 0.5))} className="p-2 hover:bg-white/10 rounded-full">
                        <ZoomIn size={20} />
                    </button>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Nav buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={showPrev}
                            className="absolute left-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 z-40 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={showNext}
                            className="absolute right-4 p-3 bg-black/50 text-white rounded-full hover:bg-black/70 z-40 transition-colors"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </>
                )}

                {/* Image */}
                <div
                    className="relative transition-transform duration-300 ease-out"
                    style={{ transform: `scale(${zoom})` }}
                >
                    <img
                        src={currentImage.src}
                        alt={currentImage.alt || 'Evidence photo'}
                        className="max-h-[80vh] max-w-[90vw] object-contain select-none"
                    />
                </div>
            </div>

            {/* Footer / Caption */}
            <div className="p-6 bg-black/80 text-white pb-safe">
                <div className="max-w-3xl mx-auto text-center">
                    {currentImage.caption && (
                        <h3 className="text-lg font-medium mb-1">{currentImage.caption}</h3>
                    )}
                    {currentImage.subcaption && (
                        <p className="text-sm text-slate-400">{currentImage.subcaption}</p>
                    )}
                </div>
            </div>
        </div>
    )
}
