'use client'

import { useState, useRef, MouseEvent } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface MagnifierProps {
    src: string
    alt: string
    width?: number
    height?: number
    className?: string
    magnifierSize?: number
    zoomLevel?: number
}

export function Magnifier({
    src,
    alt,
    width = 400,
    height = 600,
    className,
    magnifierSize = 150,
    zoomLevel = 2.5,
}: MagnifierProps) {
    const [isHovering, setIsHovering] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    // Mouse position relative to the container
    const x = useMotionValue(0)
    const y = useMotionValue(0)

    // Smooth spring animation for the magnifier movement
    const smoothX = useSpring(x, { damping: 20, stiffness: 300 })
    const smoothY = useSpring(y, { damping: 20, stiffness: 300 })

    // Calculate the position of the zoomed image inside the magnifier
    // We need to shift the background image in the opposite direction of the mouse
    // to create the magnifying effect.
    const bgX = useTransform(smoothX, (latest) => -latest * zoomLevel + magnifierSize / 2)
    const bgY = useTransform(smoothY, (latest) => -latest * zoomLevel + magnifierSize / 2)

    const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return

        const rect = containerRef.current.getBoundingClientRect()
        const clientX = e.clientX - rect.left
        const clientY = e.clientY - rect.top

        // Clamp values to keep magnifier inside (optional, but feels better if it follows mouse exactly)
        x.set(clientX)
        y.set(clientY)
    }

    return (
        <div
            ref={containerRef}
            className={cn('relative overflow-hidden rounded-xl cursor-crosshair', className)}
            style={{ width: '100%', maxWidth: width, aspectRatio: `${width}/${height}` }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
        >
            {/* Base Image */}
            <Image
                src={src}
                alt={alt}
                fill
                className="object-cover"
                priority
            />

            {/* Magnifier Lens */}
            <motion.div
                className="absolute border-2 border-white/20 shadow-2xl rounded-full pointer-events-none z-20 bg-white"
                style={{
                    width: magnifierSize,
                    height: magnifierSize,
                    x: useTransform(smoothX, (val) => val - magnifierSize / 2),
                    y: useTransform(smoothY, (val) => val - magnifierSize / 2),
                    opacity: isHovering ? 1 : 0,
                    scale: isHovering ? 1 : 0.8,
                }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: isHovering ? 1 : 0, scale: isHovering ? 1 : 0.8 }}
                transition={{ duration: 0.2 }}
            >
                {/* Zoomed Image Layer */}
                <motion.div
                    className="absolute w-full h-full rounded-full overflow-hidden"
                    style={{
                        backgroundImage: `url(${src})`,
                        backgroundSize: `${(containerRef.current?.offsetWidth || width) * zoomLevel}px ${(containerRef.current?.offsetHeight || height) * zoomLevel}px`,
                        backgroundPositionX: bgX,
                        backgroundPositionY: bgY,
                        backgroundRepeat: 'no-repeat',
                    }}
                />

                {/* Glass Reflection Effect */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
            </motion.div>
        </div>
    )
}
