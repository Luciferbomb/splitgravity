'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { CalculationBreakdown } from '@/components/bill/CalculationBreakdown'
import { calculateAllUserShares, calculateSettlements, UserBreakdown, Settlement } from '@/lib/calculations'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, ArrowRight, Wallet, Check } from 'lucide-react'
import Link from 'next/link'

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
        amountPaid: number
        isPaid: boolean
        user: {
            id: string
            name: string
            email: string
        }
    }[]
}

export default function SummaryPage() {
    const params = useParams()
    const groupCode = params.groupCode as string

    const [bill, setBill] = useState<BillData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [breakdowns, setBreakdowns] = useState<Map<string, UserBreakdown>>(new Map())
    const [settlements, setSettlements] = useState<Settlement[]>([])
    const [editingPayment, setEditingPayment] = useState<string | null>(null)
    const [paymentInputs, setPaymentInputs] = useState<Record<string, string>>({})

    const fetchBill = useCallback(async () => {
        try {
            const response = await fetch(`/api/bills?groupCode=${groupCode}`)
            if (!response.ok) return

            const data: BillData = await response.json()
            setBill(data)

            // Calculate breakdowns
            const items = data.items.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
            }))

            const selections = data.items.flatMap((i) =>
                i.selections.map((s) => ({
                    id: s.id,
                    itemId: i.id,
                    userId: s.userId,
                    splitRatio: s.splitRatio,
                }))
            )

            const calculated = calculateAllUserShares(items, selections, {
                subtotal: data.subtotal,
                tax: data.tax,
                serviceCharge: data.serviceCharge,
                total: data.total,
            })

            setBreakdowns(calculated)

            // Initialize payment inputs and calculate settlements
            const inputs: Record<string, string> = {}
            const participantData = data.participants.map((p) => {
                const breakdown = calculated.get(p.userId)
                inputs[p.userId] = String(p.amountPaid || 0)
                return {
                    userId: p.userId,
                    userName: p.user.name,
                    amountOwed: breakdown?.total || 0,
                    amountPaid: p.amountPaid || 0,
                }
            })

            setPaymentInputs(inputs)
            setSettlements(calculateSettlements(participantData))
        } catch (error) {
            console.error('Failed to fetch bill:', error)
        } finally {
            setIsLoading(false)
        }
    }, [groupCode])

    useEffect(() => {
        fetchBill()
    }, [fetchBill])

    const handlePaymentUpdate = async (userId: string) => {
        if (!bill) return

        const amount = parseFloat(paymentInputs[userId]) || 0

        try {
            await fetch('/api/payments', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    billId: bill.id,
                    userId,
                    amountPaid: amount,
                }),
            })

            setEditingPayment(null)
            await fetchBill()
        } catch (error) {
            console.error('Failed to update payment:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen">
                <Header title="Loading..." showBack={true} showNav={false} />
                <main className="container py-8">
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-48" />
                        ))}
                    </div>
                </main>
            </div>
        )
    }

    if (!bill) {
        return (
            <div className="min-h-screen">
                <Header title="Error" showBack={true} showNav={false} />
                <main className="container py-8 text-center">
                    <div className="glass-card p-8 space-y-4">
                        <AlertTriangle size={48} className="mx-auto text-[var(--warning)]" />
                        <h1 className="text-xl font-bold">Bill not found</h1>
                        <Link href="/" className="btn btn-primary">
                            Go Home
                        </Link>
                    </div>
                </main>
            </div>
        )
    }

    const unassignedItems = bill.items.filter((item) => item.selections.length === 0)

    const participantsWithBreakdowns = bill.participants.map((p) => ({
        ...p,
        breakdown: breakdowns.get(p.userId),
    }))

    const totalAssigned = Array.from(breakdowns.values()).reduce(
        (sum, b) => sum + b.total,
        0
    )

    const totalPaid = bill.participants.reduce((sum, p) => sum + (p.amountPaid || 0), 0)

    return (
        <div className="min-h-screen pb-8">
            <Header title="Bill Summary" showBack={true} showNav={false} />

            <main className="container py-6 space-y-6">
                {/* Bill Info */}
                <div className="text-center">
                    <h1 className="text-2xl font-bold">{bill.name}</h1>
                    <p className="text-[var(--text-secondary)] mt-1">
                        {bill.participants.length} people · {bill.items.length} items
                    </p>
                </div>

                {/* Unassigned Warning */}
                {unassignedItems.length > 0 && (
                    <div className="glass-card p-4 border-l-4 border-[var(--warning)]">
                        <div className="flex items-start gap-3">
                            <AlertTriangle size={20} className="text-[var(--warning)] shrink-0 mt-0.5" />
                            <div>
                                <p className="font-semibold">
                                    {unassignedItems.length} items not claimed
                                </p>
                                <ul className="text-sm text-[var(--text-secondary)] mt-1 space-y-1">
                                    {unassignedItems.map((item) => (
                                        <li key={item.id}>
                                            • {item.name} ({formatCurrency(item.price * item.quantity)})
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={`/bill/${groupCode}`}
                                    className="text-sm text-[var(--primary)] mt-2 inline-block"
                                >
                                    Go back to select items →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="glass-card p-3 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">Total</p>
                        <p className="text-lg font-bold text-[var(--accent)]">
                            {formatCurrency(bill.total)}
                        </p>
                    </div>
                    <div className="glass-card p-3 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">Assigned</p>
                        <p className="text-lg font-bold">
                            {formatCurrency(totalAssigned)}
                        </p>
                    </div>
                    <div className="glass-card p-3 text-center">
                        <p className="text-xs text-[var(--text-secondary)]">Paid</p>
                        <p className="text-lg font-bold text-[var(--primary)]">
                            {formatCurrency(totalPaid)}
                        </p>
                    </div>
                </div>

                {/* Payment Input Section */}
                <section className="space-y-4">
                    <h2 className="font-semibold text-[var(--text-secondary)] flex items-center gap-2">
                        <Wallet size={18} />
                        Who Paid How Much?
                    </h2>

                    <div className="glass-card p-4 space-y-3">
                        {participantsWithBreakdowns.map((p) => (
                            <div key={p.id} className="flex items-center gap-3 py-2 border-b border-[var(--border)] last:border-0">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-center text-white font-semibold">
                                    {p.user.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{p.user.name}</p>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        Owes: {formatCurrency(p.breakdown?.total || 0)}
                                    </p>
                                </div>

                                {editingPayment === p.userId ? (
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">₹</span>
                                            <input
                                                type="number"
                                                value={paymentInputs[p.userId] || ''}
                                                onChange={(e) => setPaymentInputs({
                                                    ...paymentInputs,
                                                    [p.userId]: e.target.value
                                                })}
                                                className="input w-24 pl-6 text-right"
                                                placeholder="0"
                                            />
                                        </div>
                                        <button
                                            onClick={() => handlePaymentUpdate(p.userId)}
                                            className="p-2 bg-[var(--primary)] rounded-lg text-white"
                                        >
                                            <Check size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setEditingPayment(p.userId)}
                                        className="text-right"
                                    >
                                        <p className="money text-[var(--primary)]">
                                            {formatCurrency(p.amountPaid || 0)}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)]">Tap to edit</p>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </section>

                {/* Settlements - Who pays whom */}
                {settlements.length > 0 && (
                    <section className="space-y-4">
                        <h2 className="font-semibold text-[var(--text-secondary)]">
                            Who Pays Whom
                        </h2>

                        <div className="space-y-2">
                            {settlements.map((s, idx) => (
                                <div
                                    key={idx}
                                    className="glass-card-elevated p-4 flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex-center font-semibold text-[var(--danger)]">
                                        {s.from.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 flex items-center gap-2">
                                        <span className="font-medium">{s.from.name}</span>
                                        <ArrowRight size={16} className="text-[var(--text-muted)]" />
                                        <span className="font-medium">{s.to.name}</span>
                                    </div>
                                    <span className="money-large text-[var(--accent)]">
                                        {formatCurrency(s.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {settlements.length === 0 && totalPaid >= bill.total && (
                    <div className="glass-card-elevated p-6 text-center space-y-2">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--accent)]/20 flex-center">
                            <Check size={32} className="text-[var(--accent)]" />
                        </div>
                        <h3 className="text-lg font-semibold">All Settled!</h3>
                        <p className="text-sm text-[var(--text-secondary)]">
                            Everyone has paid their share. No payments needed.
                        </p>
                    </div>
                )}

                {/* Individual Breakdowns */}
                <section className="space-y-4">
                    <h2 className="font-semibold text-[var(--text-secondary)]">
                        Detailed Breakdown
                    </h2>

                    {participantsWithBreakdowns.map((p) => (
                        <div key={p.id}>
                            {p.breakdown ? (
                                <CalculationBreakdown
                                    breakdown={p.breakdown}
                                    userName={p.user.name}
                                    isPaid={p.isPaid}
                                    showDetails={true}
                                />
                            ) : (
                                <div className="glass-card p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-[var(--surface-elevated)] flex-center">
                                            {p.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold">{p.user.name}</p>
                                            <p className="text-sm text-[var(--text-muted)]">
                                                No items selected
                                            </p>
                                        </div>
                                    </div>
                                    <span className="money text-[var(--text-muted)]">₹0.00</span>
                                </div>
                            )}
                        </div>
                    ))}
                </section>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={`/bill/${groupCode}`}
                        className="btn btn-secondary w-full"
                    >
                        Edit Selections
                    </Link>
                </div>
            </main>
        </div>
    )
}
