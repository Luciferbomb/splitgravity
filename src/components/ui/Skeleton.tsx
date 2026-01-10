'use client'

import { motion } from 'framer-motion'

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'circular' | 'rectangular'
    animation?: 'pulse' | 'wave'
}

export function Skeleton({
    className = '',
    variant = 'text',
    animation = 'wave'
}: SkeletonProps) {
    const baseClass = 'bg-slate-200 overflow-hidden'
    const variantClass = {
        text: 'h-4 rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    }[variant]

    if (animation === 'pulse') {
        return (
            <motion.div
                className={`${baseClass} ${variantClass} ${className}`}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            />
        )
    }

    return (
        <div className={`${baseClass} ${variantClass} ${className} relative`}>
            <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'linear'
                }}
            />
        </div>
    )
}

// Common skeleton patterns
export function BillItemSkeleton() {
    return (
        <div className="glass-card p-4 space-y-3">
            <div className="flex justify-between">
                <Skeleton className="w-32" />
                <Skeleton className="w-16" />
            </div>
            <Skeleton className="w-24 h-3" />
        </div>
    )
}

export function BillSummarySkeleton() {
    return (
        <div className="glass-card p-6 space-y-4">
            <Skeleton className="w-40 h-6" />
            <div className="space-y-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between">
                        <Skeleton className="w-24 h-4" />
                        <Skeleton className="w-16 h-4" />
                    </div>
                ))}
            </div>
        </div>
    )
}
