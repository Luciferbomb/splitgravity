'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface GlassButtonProps {
    children: ReactNode
    onClick?: () => void
    variant?: 'ultra' | 'heavy' | 'frosted' | 'gradient'
    className?: string
    disabled?: boolean
}

export function GlassButton({
    children,
    onClick,
    variant = 'gradient',
    className = '',
    disabled = false
}: GlassButtonProps) {
    const variantClass = {
        ultra: 'glass-ultra',
        heavy: 'glass-heavy',
        frosted: 'glass-frosted',
        gradient: 'glass-gradient'
    }[variant]

    return (
        <motion.button
            className={`
        ${variantClass} shimmer depth-2
        px-8 py-4 rounded-2xl font-semibold text-slate-900
        transition-all duration-300
        hover:shadow-2xl hover:scale-105
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ y: -2 }}
            whileTap={{ y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        >
            {children}
        </motion.button>
    )
}
