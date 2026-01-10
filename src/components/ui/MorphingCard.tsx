'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MorphingCardProps {
    children: ReactNode
    className?: string
    variant?: 'default' | 'glass' | 'elevated'
    hover?: boolean
    onClick?: () => void
}

export function MorphingCard({
    children,
    className = '',
    variant = 'default',
    hover = true,
    onClick
}: MorphingCardProps) {
    const variants = {
        default: 'bg-white border border-slate-200',
        glass: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl',
        elevated: 'bg-white border border-slate-200 shadow-lg',
    }

    return (
        <motion.div
            className={`${variants[variant]} rounded-xl  overflow-hidden ${className} ${onClick ? 'cursor-pointer' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={hover ? {
                y: -4,
                scale: 1.01,
                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                borderColor: 'rgb(99 102 241 / 0.3)'
            } : {}}
            whileTap={onClick ? { scale: 0.98 } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={onClick}
        >
            {/* Gradient overlay on hover */}
            {hover && (
                <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-transparent to-transparent opacity-0 pointer-events-none"
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                />
            )}

            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    )
}
