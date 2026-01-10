'use client'

import { useRef, useEffect, ReactNode } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface FloatingElementProps {
    children: ReactNode
    speed?: number
    className?: string
}

export function FloatingElement({
    children,
    speed = 0.5,
    className = ''
}: FloatingElementProps) {
    const ref = useRef<HTMLDivElement>(null)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    const springConfig = { damping: 25, stiffness: 150 }
    const x = useSpring(useTransform(mouseX, [0, window.innerWidth], [-20 * speed, 20 * speed]), springConfig)
    const y = useSpring(useTransform(mouseY, [0, window.innerHeight], [-20 * speed, 20 * speed]), springConfig)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY])

    return (
        <motion.div
            ref={ref}
            className={`floating ${className}`}
            style={{ x, y }}
        >
            {children}
        </motion.div>
    )
}
