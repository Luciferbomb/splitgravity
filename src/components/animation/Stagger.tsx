'use client'

import { motion } from 'framer-motion'
import { variants } from '@/lib/animations'

interface StaggerProps {
    children: React.ReactNode
    className?: string
    staggerDelay?: number
}

export function Stagger({
    children,
    className = '',
    staggerDelay = 0.05
}: StaggerProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={{
                animate: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerItem({ children, className = '' }: { children: React.ReactNode, className?: string }) {
    return (
        <motion.div
            variants={variants.staggerItem}
            className={className}
        >
            {children}
        </motion.div>
    )
}
