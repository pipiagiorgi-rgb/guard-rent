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

    // Prevent body scroll when lightbox is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

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
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {/* Header / Controls */}
            <div className="flex items-center justify-between px-4 py-3 text-white z-50">
                <div className="text-sm text-slate-300 min-w-[60px]">
                    {currentIndex + 1} / {images.length}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setZoom(z => Math.max(1, z - 0.5))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full active:bg-white/20"
                        aria-label="Zoom out"
                    >
                        <ZoomOut size={22} />
                    </button>
                    <button
                        onClick={() => setZoom(z => Math.min(3, z + 0.5))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full active:bg-white/20"
                        aria-label="Zoom in"
                    >
                        <ZoomIn size={22} />
                    </button>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 flex items-center justify-center hover:bg-white/10 rounded-full active:bg-white/20"
                        aria-label="Close"
                    >
                        <X size={26} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                {/* Nav buttons - larger touch targets for mobile */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={showPrev}
                            className="absolute left-2 sm:left-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 active:bg-black/90 z-40 transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={28} />
                        </button>
                        <button
                            onClick={showNext}
                            className="absolute right-2 sm:right-4 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 active:bg-black/90 z-40 transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight size={28} />
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
                        className="max-h-[70vh] sm:max-h-[80vh] max-w-[92vw] sm:max-w-[90vw] object-contain select-none"
                        draggable={false}
                    />
                </div>
            </div>

            {/* Footer / Caption */}
            <div className="px-4 py-5 bg-black/80 text-white" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}>
                <div className="max-w-3xl mx-auto text-center">
                    {currentImage.caption && (
                        <h3 className="text-base sm:text-lg font-medium mb-1">{currentImage.caption}</h3>
                    )}
                    {currentImage.subcaption && (
                        <p className="text-sm text-slate-400">{currentImage.subcaption}</p>
                    )}
                </div>
            </div>
        </div>
    )
}

