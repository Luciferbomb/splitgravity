'use client'

import { motion } from 'framer-motion'
import { variants, transition } from '@/lib/animations'

interface PageTransitionProps {
    children: React.ReactNode
    className?: string
    variant?: 'fade' | 'slideLeft' | 'slideRight' | 'slideUp'
}

export function PageTransition({
    children,
    className = '',
    variant = 'fade'
}: PageTransitionProps) {
    const variantMap = {
        fade: variants.pageFade,
        slideLeft: variants.pageSlideLeft,
        slideRight: variants.pageSlideRight,
        slideUp: variants.slideUp,
    }

    return (
        <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variantMap[variant]}
            transition={transition.normal}
            className={className}
        >
            {children}
        </motion.div>
    )
}
