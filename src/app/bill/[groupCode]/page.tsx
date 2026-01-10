'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { BillItemCard } from '@/components/bill/BillItemCard'
import { BillSummary } from '@/components/bill/CalculationBreakdown'
import { ShareBill, UserSetup } from '@/components/bill/ShareBill'
import { useUserStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { calculateAllUserShares } from '@/lib/calculations'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { Users, AlertTriangle, ArrowRight, Share2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Stagger, StaggerItem, FadeIn, SlideIn } from '@/components/animation'

interface BillData {
    id: string
    groupCode: string
    name: string
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
    items: {
        id: string
        name: string
        quantity: number
        price: number
        selections: {
            id: string
            userId: string
            splitRatio: number
            user: {
                id: string
                name: string
                email: string
            }
        }[]
    }[]
    participants: {
        id: string
        userId: string
        amountOwed: number
        isPaid: boolean
        user: {
            id: string
            name: string
            email: string
        }
    }[]
}

export default function BillPage() {
    const params = useParams()
    const router = useRouter()
    const groupCode = params.groupCode as string

    const { currentUser } = useUserStore()
    const [bill, setBill] = useState<BillData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [showShare, setShowShare] = useState(false)
    const [needsSetup, setNeedsSetup] = useState(false)
    const [isSelecting, setIsSelecting] = useState(false)

    const fetchBill = useCallback(async () => {
        try {
            const response = await fetch(`/api/bills?groupCode=${groupCode}`)
            if (!response.ok) {
                setError('Bill not found')
                return
            }
            const data = await response.json()
            setBill(data)

            // Check if current user needs to join
            if (currentUser) {
                const isParticipant = data.participants.some(
                    (p: { userId: string }) => p.userId === currentUser.id
                )
                if (!isParticipant) {
                    setNeedsSetup(true)
                }
            } else {
                setNeedsSetup(true)
            }
        } catch {
            setError('Failed to load bill')
        } finally {
            setIsLoading(false)
        }
    }, [groupCode, currentUser])

    useEffect(() => {
        fetchBill()
    }, [fetchBill])

    const handleJoinBill = async (user: { id: string; name: string; email: string }) => {
        try {
            await fetch('/api/bills/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupCode,
                    userId: user.id,
                }),
            })
            setNeedsSetup(false)
            fetchBill()
        } catch (error) {
            console.error('Failed to join bill:', error)
        }
    }

    const handleToggleSelect = async (itemId: string, claimedQuantity?: number) => {
        if (!currentUser || !bill) return

        // 1. Optimistic Update
        const previousBill = bill

        const updatedItems = bill.items.map(item => {
            if (item.id !== itemId) return item

            let newSelections = [...item.selections]
            const existingSelectionIndex = newSelections.findIndex(s => s.userId === currentUser.id)

            if (claimedQuantity === 0) {
                // Remove selection
                if (existingSelectionIndex !== -1) {
                    newSelections.splice(existingSelectionIndex, 1)
                }
            } else {
                // Add or Update selection
                const splitRatio = claimedQuantity ? claimedQuantity / item.quantity : 1

                const newSelection = {
                    id: existingSelectionIndex !== -1 ? newSelections[existingSelectionIndex].id : `temp-${Date.now()}`,
                    userId: currentUser.id,
                    splitRatio,
                    user: {
                        id: currentUser.id,
                        name: currentUser.name,
                        email: currentUser.email || ''
                    }
                }

                if (existingSelectionIndex !== -1) {
                    newSelections[existingSelectionIndex] = newSelection
                } else {
                    newSelections.push(newSelection)
                }
            }

            return { ...item, selections: newSelections }
        })

        setBill({ ...bill, items: updatedItems })

        // 2. Background API Call
        try {
            const item = bill.items.find((i) => i.id === itemId)

            if (claimedQuantity === 0) {
                await fetch('/api/selections', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId, userId: currentUser.id }),
                })
            } else {
                const splitRatio = item && claimedQuantity ? claimedQuantity / item.quantity : 1
                await fetch('/api/selections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itemId, userId: currentUser.id, splitRatio }),
                })
            }

            // Sync in background without blocking UI
            fetchBill()
        } catch (error) {
            console.error('Failed to toggle selection:', error)
            // Revert on error
            setBill(previousBill)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Header title="Loading..." showBack={true} showNav={false} />
                <main className="container py-8">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-20" />
                        ))}
                    </div>
                </main>
            </div>
        )
    }

    if (error || !bill) {
        return (
            <div className="min-h-screen">
                <Header title="Error" showBack={true} showNav={false} />
                <main className="container py-8 text-center">
                    <div className="glass-card p-8 space-y-4">
                        <AlertTriangle size={48} className="mx-auto text-[var(--warning)]" />
                        <h1 className="text-xl font-bold">{error || 'Bill not found'}</h1>
                        <p className="text-[var(--text-secondary)]">
                            The bill you&apos;re looking for doesn&apos;t exist or has expired.
                        </p>
                        <Link href="/" className="btn btn-primary">
                            Go Home
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    if (needsSetup) {
        return (
            <div className="min-h-screen">
                <Header title={bill.name} showBack={true} showNav={false} />
                <main className="container py-8 max-w-md mx-auto">
                    <div className="space-y-6">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Join This Bill</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                {bill.items.length} items · {formatCurrency(bill.total)} total
                            </p>
                        </div>

                        <UserSetup
                            onComplete={handleJoinBill}
                            title="Enter Your Details"
                            subtitle="Tell us who you are so we can track your share"
                        />
                    </div>
                </main>
            </div>
        )
    }

    // Calculate user breakdowns
    const items = bill.items.map((i) => ({
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        price: i.price,
    }))

    const selections = bill.items.flatMap((i) =>
        i.selections.map((s) => ({
            id: s.id,
            itemId: i.id,
            userId: s.userId,
            splitRatio: s.splitRatio,
        }))
    )

    const breakdowns = calculateAllUserShares(items, selections, {
        subtotal: bill.subtotal,
        tax: bill.tax,
        serviceCharge: bill.serviceCharge,
        total: bill.total,
    })

    const myBreakdown = currentUser ? breakdowns.get(currentUser.id) : null
    const unassignedItems = bill.items.filter(
        (item) => item.selections.length === 0
    )

    return (
        <div className="min-h-screen pb-32">
            <Header
                title={bill.name}
                showBack={true}
                showNav={false}
                action={
                    <button
                        onClick={() => setShowShare(!showShare)}
                        className="btn-ghost p-2 rounded-full"
                        aria-label="Share bill"
                    >
                        <Share2 size={20} />
                    </button>
                }
            />

            <main className="container py-6 space-y-6">
                {/* Share Section */}
                {showShare && (
                    <div className="animate-slide-up">
                        <ShareBill groupCode={bill.groupCode} />
                    </div>
                )}

                {/* Participants */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    <Users size={16} className="text-[var(--text-muted)] shrink-0" />
                    <span className="text-sm text-[var(--text-muted)] shrink-0">
                        {bill.participants.length} people
                    </span>
                    <div className="flex -space-x-2">
                        {bill.participants.map((p) => (
                            <UserAvatar
                                key={p.userId}
                                name={p.user.name}
                                id={p.userId}
                                size="sm"
                            />
                        ))}
                    </div>
                </div>

                {/* Unassigned Warning */}
                {unassignedItems.length > 0 && (
                    <div className="glass-card p-3 border-l-4 border-[var(--warning)] flex items-center gap-3">
                        <AlertTriangle size={20} className="text-[var(--warning)] shrink-0" />
                        <p className="text-sm">
                            <strong>{unassignedItems.length} items</strong> haven&apos;t been claimed yet
                        </p>
                    </div>
                )}

                {/* Items */}
                <section className="space-y-3">
                    <h2 className="font-semibold text-[var(--text-secondary)]">
                        Select Your Items
                    </h2>

                    <div className="space-y-2">
                        {bill.items.map((item) => (
                            <BillItemCard
                                key={item.id}
                                id={item.id}
                                name={item.name}
                                quantity={item.quantity}
                                price={item.price}
                                selections={item.selections}
                                currentUserId={currentUser?.id || ''}
                                onToggleSelect={handleToggleSelect}
                                isSelecting={isSelecting}
                            />
                        ))}
                    </div>
                </section>

                {/* Bill Summary */}
                <BillSummary
                    subtotal={bill.subtotal}
                    tax={bill.tax}
                    serviceCharge={bill.serviceCharge}
                    total={bill.total}
                />

                {/* My Total */}
                {myBreakdown && myBreakdown.items.length > 0 && (
                    <div className="glass-card-elevated p-4 animate-slide-up">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-[var(--text-secondary)]">Your Total</p>
                                <p className="money-large">{formatCurrency(myBreakdown.total)}</p>
                            </div>
                            <Link
                                href={`/bill/${groupCode}/summary`}
                                className="btn btn-primary"
                            >
                                View Split
                                <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
