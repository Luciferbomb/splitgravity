'use client'

import { formatCurrency } from '@/lib/utils'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { UserBreakdown } from '@/lib/calculations'
import { Check, Clock } from 'lucide-react'

interface CalculationBreakdownProps {
    breakdown: UserBreakdown
    userName: string
    isPaid?: boolean
    showDetails?: boolean
}

export function CalculationBreakdown({
    breakdown,
    userName,
    isPaid = false,
    showDetails = true,
}: CalculationBreakdownProps) {
    return (
        <div className="glass-card p-4 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <UserAvatar name={userName} id={breakdown.userId} size="lg" />
                    <div>
                        <h3 className="font-semibold">{userName}</h3>
                        <span className="text-sm text-[var(--text-muted)]">
                            {breakdown.percentage.toFixed(1)}% of bill
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isPaid ? (
                        <span className="badge badge-success flex items-center gap-1">
                            <Check size={12} />
                            Paid
                        </span>
                    ) : (
                        <span className="badge badge-warning flex items-center gap-1">
                            <Clock size={12} />
                            Pending
                        </span>
                    )}
                </div>
            </div>

            {showDetails && (
                <div className="space-y-2 mb-4">
                    {breakdown.items.map((item) => (
                        <div
                            key={item.itemId}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="text-[var(--text-secondary)]">
                                {item.name}
                                {item.isShared && (
                                    <span className="text-xs text-[var(--secondary)] ml-1">
                                        (split)
                                    </span>
                                )}
                            </span>
                            <span className="money">{formatCurrency(item.amount)}</span>
                        </div>
                    ))}
                </div>
            )}

            <div className="divider" />

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Items Subtotal</span>
                    <span className="money">{formatCurrency(breakdown.itemsSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tax Share</span>
                    <span className="money">{formatCurrency(breakdown.taxShare)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Service Charge Share</span>
                    <span className="money">{formatCurrency(breakdown.serviceChargeShare)}</span>
                </div>
            </div>

            <div className="divider" />

            <div className="flex justify-between items-center">
                <span className="font-semibold">Total Owed</span>
                <span className="money-large">{formatCurrency(breakdown.total)}</span>
            </div>
        </div>
    )
}

interface BillSummaryProps {
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
}

export function BillSummary({ subtotal, tax, serviceCharge, total }: BillSummaryProps) {
    return (
        <div className="glass-card p-4">
            <h3 className="font-semibold mb-3">Bill Summary</h3>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                    <span className="money">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Tax</span>
                    <span className="money">{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Service Charge</span>
                    <span className="money">{formatCurrency(serviceCharge)}</span>
                </div>
            </div>

            <div className="divider" />

            <div className="flex justify-between items-center">
                <span className="font-semibold">Total</span>
                <span className="money text-xl text-[var(--accent)]">
                    {formatCurrency(total)}
                </span>
            </div>
        </div>
    )
}
