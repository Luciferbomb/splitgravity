'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'

interface UseCounterProps {
    value: number
    duration?: number
    decimals?: number
    onUpdate?: (value: number) => void
}

export function useAnimatedCounter({
    value,
    duration = 0.5,
    decimals = 2,
    onUpdate
}: UseCounterProps) {
    const nodeRef = useRef<HTMLSpanElement>(null)
    const counterRef = useRef({ value: 0 })

    useEffect(() => {
        const node = nodeRef.current
        if (!node) return

        gsap.to(counterRef.current, {
            value,
            duration,
            ease: 'power2.out',
            onUpdate: () => {
                const currentValue = counterRef.current.value
                node.textContent = currentValue.toFixed(decimals)
                onUpdate?.(currentValue)
            },
        })
    }, [value, duration, decimals, onUpdate])

    return nodeRef
}

interface AnimatedNumberProps {
    value: number
    duration?: number
    decimals?: number
    prefix?: string
    suffix?: string
    className?: string
}

export function AnimatedNumber({
    value,
    duration = 0.5,
    decimals = 2,
    prefix = '',
    suffix = '',
    className = ''
}: AnimatedNumberProps) {
    const ref = useAnimatedCounter({ value, duration, decimals })

    return (
        <span className={className}>
            {prefix}
            <span ref={ref}>0.00</span>
            {suffix}
        </span>
    )
}
