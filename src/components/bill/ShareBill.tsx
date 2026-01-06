'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/useStore'
import { Copy, Check, ExternalLink, User, AlertCircle } from 'lucide-react'
import { generateBillLink, copyToClipboard } from '@/lib/utils'

interface ShareBillProps {
    groupCode: string
}

export function ShareBill({ groupCode }: ShareBillProps) {
    const [copied, setCopied] = useState(false)
    const link = generateBillLink(groupCode)

    const handleCopy = async () => {
        const success = await copyToClipboard(link || groupCode)
        if (success) {
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Join my bill on SplitGravity',
                    text: `Join my bill using code: ${groupCode}`,
                    url: link,
                })
            } catch {
                // User cancelled or share failed
            }
        } else {
            handleCopy()
        }
    }

    return (
        <div className="glass-card p-4 space-y-4">
            <h3 className="font-semibold">Share This Bill</h3>

            <div className="flex items-center gap-2">
                <div className="flex-1 px-4 py-3 bg-[var(--surface)] rounded-lg font-mono text-lg tracking-widest text-center">
                    {groupCode}
                </div>
                <button
                    onClick={handleCopy}
                    className="btn btn-secondary p-3"
                    aria-label="Copy code"
                >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
            </div>

            <button
                onClick={handleShare}
                className="btn btn-primary w-full"
            >
                <ExternalLink size={18} />
                Share Link
            </button>

            <p className="text-sm text-[var(--text-muted)] text-center">
                Friends can join using this code or link
            </p>
        </div>
    )
}

interface UserSetupProps {
    onComplete: (user: { id: string; name: string; email: string }) => void
    isLoading?: boolean
    title?: string
    subtitle?: string
}

export function UserSetup({ onComplete, isLoading, title, subtitle }: UserSetupProps) {
    const { currentUser, setCurrentUser } = useUserStore()
    const [error, setError] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showDifferentAccount, setShowDifferentAccount] = useState(false)

    // Hydration fix - wait for client-side state
    const [mounted, setMounted] = useState(false)
    useEffect(() => {
        setMounted(true)
    }, [])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError('')

        const form = e.currentTarget
        const formData = new FormData(form)

        const name = (formData.get('name') as string).trim()
        const email = (formData.get('email') as string).trim().toLowerCase()
        const phone = (formData.get('phone') as string)?.trim() || null

        // Validation
        if (!name || name.length < 2) {
            setError('Please enter your name (at least 2 characters)')
            return
        }

        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Failed to create user')
            }

            const user = await response.json()
            setCurrentUser({ id: user.id, name: user.name, email: user.email })
            onComplete(user)
        } catch (err) {
            console.error('Error creating user:', err)
            setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleUseDifferentAccount = () => {
        setCurrentUser(null)
        setShowDifferentAccount(true)
    }

    // Wait for hydration
    if (!mounted) {
        return (
            <div className="glass-card p-4">
                <div className="skeleton h-40" />
            </div>
        )
    }

    // If user already exists and they haven't asked to switch
    if (currentUser && !showDifferentAccount) {
        return (
            <div className="glass-card p-4 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-center text-white font-semibold text-lg">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold">Welcome back!</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            {currentUser.name}
                        </p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {currentUser.email}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => onComplete(currentUser)}
                    disabled={isLoading}
                    className="btn btn-primary w-full"
                >
                    {isLoading ? 'Loading...' : 'Continue as ' + currentUser.name.split(' ')[0]}
                </button>

                <button
                    onClick={handleUseDifferentAccount}
                    className="btn btn-ghost w-full text-sm"
                >
                    <User size={16} />
                    Use a different account
                </button>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
            <div>
                <h3 className="font-semibold">{title || "Who's splitting?"}</h3>
                {subtitle && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{subtitle}</p>
                )}
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-[var(--danger)]/10 border border-[var(--danger)]/20 rounded-lg">
                    <AlertCircle size={16} className="text-[var(--danger)] shrink-0" />
                    <p className="text-sm text-[var(--danger)]">{error}</p>
                </div>
            )}

            <div className="space-y-3">
                <div>
                    <label className="label">Your Name *</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="e.g., Rahul Kumar"
                        className="input"
                        required
                        minLength={2}
                        autoComplete="name"
                    />
                </div>

                <div>
                    <label className="label">Email *</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="your@email.com"
                        className="input"
                        required
                        autoComplete="email"
                    />
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Used to identify you when splitting bills
                    </p>
                </div>

                <div>
                    <label className="label">Phone (optional)</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        className="input"
                        autoComplete="tel"
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={isLoading || isSubmitting}
                className="btn btn-primary w-full"
            >
                {isSubmitting ? 'Setting up...' : isLoading ? 'Loading...' : 'Continue'}
            </button>

            {showDifferentAccount && (
                <button
                    type="button"
                    onClick={() => setShowDifferentAccount(false)}
                    className="btn btn-ghost w-full text-sm"
                >
                    Cancel
                </button>
            )}
        </form>
    )
}

interface JoinBillFormProps {
    onJoin?: (groupCode: string) => void
}

export function JoinBillForm({ onJoin }: JoinBillFormProps) {
    const router = useRouter()
    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (code.length < 6) {
            setError('Please enter a valid 6-character code')
            return
        }

        setIsLoading(true)
        setError('')

        try {
            // Check if bill exists
            const response = await fetch(`/api/bills?groupCode=${code.toUpperCase()}`)

            if (!response.ok) {
                setError('Bill not found. Please check the code.')
                return
            }

            if (onJoin) {
                onJoin(code.toUpperCase())
            } else {
                router.push(`/bill/${code.toUpperCase()}`)
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="label">Enter Bill Code</label>
                <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                        setCode(e.target.value.toUpperCase())
                        setError('')
                    }}
                    placeholder="ABC123"
                    maxLength={6}
                    className="input text-center text-2xl tracking-widest font-mono uppercase"
                    autoComplete="off"
                />
            </div>

            {error && (
                <p className="text-sm text-[var(--danger)] text-center">{error}</p>
            )}

            <button
                type="submit"
                disabled={isLoading || code.length < 6}
                className="btn btn-primary w-full"
            >
                {isLoading ? 'Joining...' : 'Join Bill'}
            </button>
        </form>
    )
}
