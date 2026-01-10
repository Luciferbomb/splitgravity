'use client'

import { motion, HTMLMotionProps } from 'framer-motion'
import { variants } from '@/lib/animations'

interface MotionButtonProps extends Omit<HTMLMotionProps<'button'>, 'variants'> {
    children: React.ReactNode
    isLoading?: boolean
}

export function MotionButton({
    children,
    className = '',
    isLoading = false,
    disabled,
    ...props
}: MotionButtonProps) {
    return (
        <motion.button
            className={className}
            initial="rest"
            whileHover={disabled || isLoading ? undefined : "hover"}
            whileTap={disabled || isLoading ? undefined : "tap"}
            variants={variants.button}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <motion.div
                    className="flex items-center gap-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    <motion.div
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                    />
                    {typeof children === 'string' ? children : 'Loading...'}
                </motion.div>
            ) : (
                children
            )}
        </motion.button>
    )
}
