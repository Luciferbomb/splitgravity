'use client'

import { useState } from 'react'
import { formatCurrency, cn } from '@/lib/utils'
import { UserChip } from '@/components/ui/UserAvatar'
import { Check, Users, Minus, Plus, X } from 'lucide-react'

interface Selection {
    id: string
    userId: string
    splitRatio: number
    user: {
        id: string
        name: string
    }
}

interface BillItemCardProps {
    id: string
    name: string
    quantity: number
    price: number
    selections: Selection[]
    currentUserId: string
    onToggleSelect: (itemId: string, claimedQuantity?: number) => void
    isSelecting?: boolean
}

export function BillItemCard({
    id,
    name,
    quantity,
    price,
    selections,
    currentUserId,
    onToggleSelect,
    isSelecting = false,
}: BillItemCardProps) {
    const currentSelection = selections.find((s) => s.userId === currentUserId)
    const isSelected = !!currentSelection
    const isShared = selections.length > 1
    const totalPrice = price * quantity
    const handleClick = () => {
        if (isSelecting) return

        if (isSelected) {
            // Deselect
            onToggleSelect(id, 0)
        } else {
            // Always claim 1 unit
            // If multiple people claim, it will automatically split the cost
            onToggleSelect(id, 1)
        }
    }



    return (
        <button
            onClick={handleClick}
            disabled={isSelecting}
            className={cn(
                'item-card w-full text-left animate-fade-in',
                isSelected && 'selected',
                isShared && 'shared'
            )}
        >
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{name}</span>
                    {quantity > 1 && (
                        <span className="text-sm text-[var(--text-muted)]">×{quantity}</span>
                    )}
                </div>

                {selections.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                        {selections.map((s) => (
                            <div key={s.userId} className="flex items-center gap-1">
                                <UserChip name={s.user.name} id={s.userId} />
                            </div>
                        ))}
                        {isShared && (
                            <span className="flex items-center gap-1 text-xs text-[var(--secondary)]">
                                <Users size={12} />
                                Split
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center gap-3">
                <span className="money text-[var(--text-primary)]">
                    {formatCurrency(totalPrice)}
                </span>

                <div
                    className={cn(
                        'w-6 h-6 rounded-full border-2 flex-center transition-all',
                        isSelected
                            ? 'bg-[var(--primary)] border-[var(--primary)]'
                            : 'border-[var(--border-strong)]'
                    )}
                >
                    {isSelected && <Check size={14} className="text-white" />}
                </div>
            </div>
        </button>
    )
}

interface ItemEditorProps {
    onAdd: (item: { name: string; quantity: number; price: number }) => void
    isAdding?: boolean
}

export function ItemEditor({ onAdd, isAdding }: ItemEditorProps) {
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formData = new FormData(form)

        const name = formData.get('name') as string
        const quantity = parseInt(formData.get('quantity') as string) || 1
        const price = parseFloat(formData.get('price') as string) || 0

        if (!name || price <= 0) return

        onAdd({ name, quantity, price })
        form.reset()

        // Focus back on name field
        const nameInput = form.querySelector('input[name="name"]') as HTMLInputElement
        nameInput?.focus()
    }

    return (
        <form onSubmit={handleSubmit} className="glass-card p-4 space-y-4">
            <h3 className="font-semibold text-sm text-[var(--text-secondary)]">
                Add Item
            </h3>

            <div className="grid grid-cols-12 gap-3">
                <div className="col-span-6">
                    <input
                        type="text"
                        name="name"
                        placeholder="Item name"
                        className="input"
                        required
                    />
                </div>
                <div className="col-span-2">
                    <input
                        type="number"
                        name="quantity"
                        placeholder="Qty"
                        defaultValue={1}
                        min={1}
                        className="input text-center"
                    />
                </div>
                <div className="col-span-4">
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            ₹
                        </span>
                        <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            step="0.01"
                            min="0"
                            className="input pl-7"
                            required
                        />
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isAdding}
                className="btn btn-secondary w-full"
            >
                {isAdding ? 'Adding...' : 'Add Item'}
            </button>
        </form>
    )
}
