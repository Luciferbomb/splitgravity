'use client'

import { motion } from 'framer-motion'
import { variants, transition } from '@/lib/animations'

interface ScaleInProps {
    children: React.ReactNode
    className?: string
    delay?: number
    bounce?: boolean
}

export function ScaleIn({
    children,
    className = '',
    delay = 0,
    bounce = false
}: ScaleInProps) {
    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={bounce ? variants.pop : variants.scaleIn}
            transition={bounce ? { ...transition.spring, delay } : { ...transition.normal, delay }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
