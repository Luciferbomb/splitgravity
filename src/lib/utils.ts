import { customAlphabet } from 'nanoid'

// Generate a unique 6-character group code (uppercase letters and numbers)
const generateCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 6)

export function generateGroupCode(): string {
    return generateCode()
}

// Format currency (INR for India)
export function formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount)
}

// Calculate percentage
export function calculatePercentage(part: number, total: number): number {
    if (total === 0) return 0
    return (part / total) * 100
}

// Round to 2 decimal places
export function roundToTwo(num: number): number {
    return Math.round((num + Number.EPSILON) * 100) / 100
}

// Deep clone an object
export function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj))
}

// Generate shareable bill link
export function generateBillLink(groupCode: string): string {
    if (typeof window === 'undefined') return ''
    return `${window.location.origin}/bill/${groupCode}`
}

// Copy text to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text)
        return true
    } catch {
        return false
    }
}

// Get initials from name
export function getInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// Generate a random color for user avatar
export function getUserColor(userId: string): string {
    const colors = [
        '#6366f1', // Indigo
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#f43f5e', // Rose
        '#ef4444', // Red
        '#f97316', // Orange
        '#eab308', // Yellow
        '#22c55e', // Green
        '#14b8a6', // Teal
        '#06b6d4', // Cyan
        '#3b82f6', // Blue
    ]

    // Simple hash to consistently pick a color for a user
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash)
    }

    return colors[Math.abs(hash) % colors.length]
}

// Delay utility for animations
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// Classnames utility
export function cn(...classes: (string | boolean | undefined | null)[]): string {
    return classes.filter(Boolean).join(' ')
}
