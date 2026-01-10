'use client'

import { motion } from 'framer-motion'
import { variants, transition } from '@/lib/animations'

interface SlideInProps {
    children: React.ReactNode
    className?: string
    direction?: 'up' | 'down' | 'left' | 'right'
    delay?: number
}

export function SlideIn({
    children,
    className = '',
    direction = 'up',
    delay = 0
}: SlideInProps) {
    const variantMap = {
        up: variants.slideUp,
        down: variants.slideDown,
        left: variants.slideLeft,
        right: variants.slideRight,
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={variantMap[direction]}
            transition={{ ...transition.normal, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
