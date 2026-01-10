'use client'

import { motion } from 'framer-motion'
import { InputHTMLAttributes, forwardRef, useState } from 'react'

interface AnimatedInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string
    error?: string
    leftIcon?: React.ReactNode
    rightIcon?: React.ReactNode
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
    ({ label, error, leftIcon, rightIcon, className = '', ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false)

        return (
            <div className="space-y-1">
                {label && (
                    <motion.label
                        className="block text-sm font-medium text-slate-700"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {label}
                    </motion.label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <motion.div
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            animate={{
                                scale: isFocused ? 1.1 : 1,
                                color: isFocused ? 'rgb(99 102 241)' : 'rgb(148 163 184)'
                            }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        >
                            {leftIcon}
                        </motion.div>
                    )}

                    <motion.input
                        ref={ref}
                        className={`w-full px-4 py-3 ${leftIcon ? 'pl-10' : ''} ${rightIcon ? 'pr-10' : ''} 
              bg-white border border-slate-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
              transition-all ${error ? 'border-red-500' : ''} ${className}`}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        whileFocus={{ scale: 1.01 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                            {rightIcon}
                        </div>
                    )}

                    {/* Animated underline */}
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: isFocused ? 1 : 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                </div>

                {error && (
                    <motion.p
                        className="text-sm text-red-500"
                        initial={{ opacity: 0, y: -2 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {error}
                    </motion.p>
                )}
            </div>
        )
    }
)

AnimatedInput.displayName = 'AnimatedInput'
