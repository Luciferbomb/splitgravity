/**
 * Animation Configuration
 * Centralized animation timing, easing curves, and variant definitions
 */

import { Transition, Variants } from 'framer-motion'

// Duration constants
export const duration = {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    slower: 0.7,
} as const

// Easing curves
export const ease = {
    // Smooth entrance/exit
    smooth: [0.4, 0.0, 0.2, 1],
    // Sharp/snappy
    sharp: [0.4, 0.0, 0.6, 1],
    // Bouncy/playful
    bounce: [0.68, -0.55, 0.265, 1.55],
    // Spring-like
    spring: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
    },
    // Gentle spring
    gentleSpring: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
    },
} as const

// Common transitions
export const transition = {
    fast: { duration: duration.fast, ease: ease.smooth },
    normal: { duration: duration.normal, ease: ease.smooth },
    slow: { duration: duration.slow, ease: ease.smooth },
    spring: ease.spring,
    gentleSpring: ease.gentleSpring,
} as const

// Reusable animation variants
export const variants = {
    // Fade in/out
    fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    } as Variants,

    // Slide up
    slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    } as Variants,

    // Slide down
    slideDown: {
        initial: { opacity: 0, y: -20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 20 },
    } as Variants,

    // Slide left
    slideLeft: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    } as Variants,

    // Slide right
    slideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    } as Variants,

    // Scale in/out
    scaleIn: {
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.9 },
    } as Variants,

    // Pop (bouncy scale)
    pop: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
    } as Variants,

    // Lift (hover effect)
    lift: {
        rest: { y: 0, scale: 1 },
        hover: { y: -4, scale: 1.02 },
        tap: { y: 0, scale: 0.98 },
    } as Variants,

    // Button states
    button: {
        rest: { scale: 1 },
        hover: { scale: 1.02 },
        tap: { scale: 0.98 },
    } as Variants,

    // Stagger container (for lists)
    stagger: {
        animate: {
            transition: {
                staggerChildren: 0.05,
            },
        },
    } as Variants,

    // Stagger item
    staggerItem: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
    } as Variants,

    // Page transitions
    pageSlideLeft: {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    } as Variants,

    pageSlideRight: {
        initial: { opacity: 0, x: -20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 20 },
    } as Variants,

    pageFade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    } as Variants,
} as const

// Accessibility: respect user's motion preferences
export const shouldReduceMotion = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

// Get transition with reduced motion support
export const getTransition = (t: Transition): Transition => {
    if (shouldReduceMotion()) {
        return { duration: 0.01 }
    }
    return t
}
