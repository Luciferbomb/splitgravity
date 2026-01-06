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
    const [showQuantityPicker, setShowQuantityPicker] = useState(false)
    const [selectedQty, setSelectedQty] = useState(1)

    const currentSelection = selections.find((s) => s.userId === currentUserId)
    const isSelected = !!currentSelection
    const isShared = selections.length > 1
    const totalPrice = price * quantity

    // Calculate how many are already claimed by others
    const claimedByOthers = selections
        .filter((s) => s.userId !== currentUserId)
        .reduce((sum, s) => sum + Math.round(s.splitRatio * quantity), 0)

    const availableQty = quantity - claimedByOthers
    const myClaimedQty = currentSelection
        ? Math.round(currentSelection.splitRatio * quantity)
        : 0

    const handleClick = () => {
        if (isSelecting) return

        if (isSelected) {
            // Deselect
            onToggleSelect(id, 0)
        } else if (quantity > 1 && availableQty > 1) {
            // Show quantity picker for multi-quantity items
            setSelectedQty(Math.min(1, availableQty))
            setShowQuantityPicker(true)
        } else {
            // Single item or only 1 available, select all
            onToggleSelect(id, availableQty)
        }
    }

    const handleConfirmQuantity = () => {
        onToggleSelect(id, selectedQty)
        setShowQuantityPicker(false)
    }

    const handleCancelQuantity = () => {
        setShowQuantityPicker(false)
    }

    // Show quantity claimed by each user
    const getSelectionText = (s: Selection) => {
        const claimed = Math.round(s.splitRatio * quantity)
        if (quantity > 1 && claimed < quantity) {
            return `${claimed}/${quantity}`
        }
        return undefined
    }

    return (
        <>
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
                            {selections.map((s) => {
                                const qtyText = getSelectionText(s)
                                return (
                                    <div key={s.userId} className="flex items-center gap-1">
                                        <UserChip name={s.user.name} id={s.userId} />
                                        {qtyText && (
                                            <span className="text-xs text-[var(--text-muted)]">
                                                ({qtyText})
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
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

            {/* Quantity Picker Modal */}
            {showQuantityPicker && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50" onClick={handleCancelQuantity}>
                    <div
                        className="w-full max-w-md bg-[var(--surface)] rounded-t-2xl p-6 space-y-6 animate-slide-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">How many did you have?</h3>
                            <button onClick={handleCancelQuantity} className="p-2 hover:bg-[var(--surface-hover)] rounded-full">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="text-center">
                            <p className="text-[var(--text-secondary)] mb-4">
                                {name} <span className="text-[var(--text-muted)]">×{quantity} total</span>
                            </p>

                            <div className="flex items-center justify-center gap-6">
                                <button
                                    onClick={() => setSelectedQty(Math.max(1, selectedQty - 1))}
                                    disabled={selectedQty <= 1}
                                    className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex-center disabled:opacity-50"
                                >
                                    <Minus size={20} />
                                </button>

                                <div className="text-center">
                                    <span className="text-4xl font-bold">{selectedQty}</span>
                                    <p className="text-sm text-[var(--text-muted)]">
                                        of {availableQty} available
                                    </p>
                                </div>

                                <button
                                    onClick={() => setSelectedQty(Math.min(availableQty, selectedQty + 1))}
                                    disabled={selectedQty >= availableQty}
                                    className="w-12 h-12 rounded-full bg-[var(--surface-elevated)] flex-center disabled:opacity-50"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            <p className="text-sm text-[var(--text-secondary)] mt-4">
                                Your share: {formatCurrency(price * selectedQty)}
                            </p>
                        </div>

                        <button
                            onClick={handleConfirmQuantity}
                            className="btn btn-primary w-full"
                        >
                            Claim {selectedQty} {selectedQty === 1 ? 'item' : 'items'}
                        </button>
                    </div>
                </div>
            )}
        </>
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
