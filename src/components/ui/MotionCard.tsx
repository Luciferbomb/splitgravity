'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { variants } from '@/lib/animations'

interface MotionCardProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
    children: React.ReactNode
    lift?: boolean
    delay?: number
}

export function MotionCard({
    children,
    className = '',
    lift = false,
    delay = 0,
    ...props
}: MotionCardProps) {
    if (lift) {
        return (
            <motion.div
                className={className}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                variants={variants.lift}
                transition={{ delay }}
                {...props}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <motion.div
            className={className}
            initial="initial"
            animate="animate"
            variants={variants.slideUp}
            transition={{ delay }}
            {...props}
        >
            {children}
        </motion.div>
    )
}
