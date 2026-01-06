'use client'

import { getInitials, getUserColor, cn } from '@/lib/utils'

interface UserAvatarProps {
    name: string
    id: string
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function UserAvatar({ name, id, size = 'md', className }: UserAvatarProps) {
    const color = getUserColor(id)
    const initials = getInitials(name)

    const sizes = {
        sm: 'w-6 h-6 text-[10px]',
        md: 'w-8 h-8 text-xs',
        lg: 'w-10 h-10 text-sm',
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center font-semibold text-white',
                sizes[size],
                className
            )}
            style={{ backgroundColor: color }}
            title={name}
        >
            {initials}
        </div>
    )
}

interface UserChipProps {
    name: string
    id: string
    onRemove?: () => void
}

export function UserChip({ name, id, onRemove }: UserChipProps) {
    const color = getUserColor(id)

    return (
        <span
            className="user-chip"
            style={{ backgroundColor: color }}
        >
            {getInitials(name)}
            <span className="hidden sm:inline">{name.split(' ')[0]}</span>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                    aria-label={`Remove ${name}`}
                >
                    ×
                </button>
            )}
        </span>
    )
}
