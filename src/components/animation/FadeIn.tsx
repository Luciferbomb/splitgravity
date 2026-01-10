'use client'

import { motion } from 'framer-motion'
import { variants, transition } from '@/lib/animations'

interface FadeInProps {
    children: React.ReactNode
    className?: string
    delay?: number
}

export function FadeIn({ children, className = '', delay = 0 }: FadeInProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={variants.fadeIn}
            transition={{ ...transition.normal, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
