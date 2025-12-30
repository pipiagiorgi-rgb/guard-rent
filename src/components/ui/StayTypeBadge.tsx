'use client'

import { Home, Plane } from 'lucide-react'

type StayType = 'long_term' | 'short_stay'

interface StayTypeBadgeProps {
    stayType: StayType | null | undefined
    size?: 'sm' | 'md'
    showLabel?: boolean
}

/**
 * Reusable badge component to identify rental type.
 * Uses existing stay_type field from cases table.
 * 
 * @param stayType - 'long_term' or 'short_stay' (defaults to 'long_term' if null)
 * @param size - 'sm' for list items, 'md' for headers
 * @param showLabel - whether to show text label (default: true)
 */
export function StayTypeBadge({
    stayType,
    size = 'sm',
    showLabel = true
}: StayTypeBadgeProps) {
    // Default to long_term for legacy cases without stay_type
    const type = stayType || 'long_term'

    const isShortStay = type === 'short_stay'

    const config = isShortStay
        ? {
            icon: Plane,
            label: 'Short Stay',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-700',
            iconColor: 'text-blue-600'
        }
        : {
            icon: Home,
            label: 'Long-Term Rental',
            bgColor: 'bg-amber-50',
            textColor: 'text-amber-700',
            iconColor: 'text-amber-600'
        }

    const Icon = config.icon
    const iconSize = size === 'sm' ? 12 : 14
    const textSize = size === 'sm' ? 'text-xs' : 'text-sm'
    const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1'

    return (
        <span
            className={`inline-flex items-center gap-1 ${padding} ${config.bgColor} rounded-full`}
            title={config.label}
        >
            <Icon size={iconSize} className={config.iconColor} />
            {showLabel && (
                <span className={`${textSize} font-medium ${config.textColor}`}>
                    {config.label}
                </span>
            )}
        </span>
    )
}
