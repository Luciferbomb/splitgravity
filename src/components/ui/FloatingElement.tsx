'use client'

import { useRef, useEffect, ReactNode, useState } from 'react'
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
    const [mounted, setMounted] = useState(false)
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)

    // Safe window dimensions
    const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 })

    useEffect(() => {
        setMounted(true)
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight
        })

        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight
            })
        }

        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const springConfig = { damping: 25, stiffness: 150 }
    const x = useSpring(useTransform(mouseX, [0, dimensions.width], [-20 * speed, 20 * speed]), springConfig)
    const y = useSpring(useTransform(mouseY, [0, dimensions.height], [-20 * speed, 20 * speed]), springConfig)

    useEffect(() => {
        if (!mounted) return

        const handleMouseMove = (e: MouseEvent) => {
            mouseX.set(e.clientX)
            mouseY.set(e.clientY)
        }

        window.addEventListener('mousemove', handleMouseMove)
        return () => window.removeEventListener('mousemove', handleMouseMove)
    }, [mouseX, mouseY, mounted])

    // Don't render parallax on server
    if (!mounted) {
        return (
            <div className={`floating ${className}`}>
                {children}
            </div>
        )
    }

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
