'use client'

import { motion, HTMLMotionProps, Variant } from 'framer-motion'
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface PolymorphicButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
    variant?: ButtonVariant
    size?: ButtonSize
    isLoading?: boolean
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
    children: React.ReactNode
    fullWidth?: boolean
}

const baseStyles = 'relative inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden'

const variantStyles: Record<ButtonVariant, string> = {
    primary: 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white hover:from-indigo-700 hover:to-indigo-800 focus:ring-indigo-500 shadow-lg shadow-indigo-500/20',
    secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-300',
    ghost: 'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-300',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 shadow-lg shadow-red-500/20',
}

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-base gap-2',
    lg: 'px-6 py-3.5 text-lg gap-2.5',
}

export const PolymorphicButton = forwardRef<HTMLButtonElement, PolymorphicButtonProps>(
    ({
        variant = 'primary',
        size = 'md',
        isLoading = false,
        leftIcon,
        rightIcon,
        children,
        fullWidth,
        disabled,
        ...props
    }, ref) => {
        const className = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${fullWidth ? 'w-full' : ''}`

        return (
            <motion.button
                ref={ref}
                className={className}
                disabled={disabled || isLoading}
                whileHover={disabled || isLoading ? {} : { scale: 1.02, y: -1 }}
                whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                {...props}
            >
                {/* Shimmer effect on hover */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.6 }}
                />

                {/* Content */}
                <span className="relative flex items-center gap-inherit">
                    {isLoading ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-inherit"
                        >
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Loading...</span>
                        </motion.div>
                    ) : (
                        <>
                            {leftIcon && (
                                <motion.span
                                    initial={{ opacity: 0, x: -4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {leftIcon}
                                </motion.span>
                            )}
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.05 }}
                            >
                                {children}
                            </motion.span>
                            {rightIcon && (
                                <motion.span
                                    initial={{ opacity: 0, x: 4 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {rightIcon}
                                </motion.span>
                            )}
                        </>
                    )}
                </span>
            </motion.button>
        )
    }
)

PolymorphicButton.displayName = 'PolymorphicButton'
