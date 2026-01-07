'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { ItemEditor } from '@/components/bill/BillItemCard'
import { UserSetup } from '@/components/bill/ShareBill'
import { ReceiptScanner } from '@/components/bill/ReceiptScanner'
import { formatCurrency } from '@/lib/utils'
import { Trash2, ArrowRight, Camera, Pencil } from 'lucide-react'

interface TempItem {
    id: string
    name: string
    quantity: number
    price: number
}

interface ExtractedBill {
    restaurantName?: string
    items: { name: string; quantity: number; price: number }[]
    subtotal: number
    tax: number
    serviceCharge: number
    discount: number
    total: number
}

export default function NewBillPage() {
    const router = useRouter()
    const [step, setStep] = useState<'choose' | 'items' | 'details' | 'user'>('choose')
    const [showScanner, setShowScanner] = useState(false)
    const [items, setItems] = useState<TempItem[]>([])
    const [billName, setBillName] = useState('')
    const [tax, setTax] = useState(0)
    const [serviceCharge, setServiceCharge] = useState(0)
    const [discount, setDiscount] = useState(0)
    const [isCreating, setIsCreating] = useState(false)

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total = subtotal + tax + serviceCharge - discount

    const addItem = (item: { name: string; quantity: number; price: number }) => {
        setItems([...items, { ...item, id: crypto.randomUUID() }])
    }

    const removeItem = (id: string) => {
        setItems(items.filter((i) => i.id !== id))
    }

    const handleScanComplete = (data: ExtractedBill) => {
        // Add scanned items
        const newItems = data.items.map((item) => ({
            ...item,
            id: crypto.randomUUID(),
        }))
        setItems(newItems)

        // Set bill details
        if (data.restaurantName) {
            setBillName(data.restaurantName)
        }
        setTax(data.tax || 0)
        setServiceCharge(data.serviceCharge || 0)
        setDiscount(data.discount || 0)

        setShowScanner(false)
        setStep('items')
    }

    const handleCreateBill = async (user: { id: string; name: string; email: string }) => {
        if (items.length === 0) return

        setIsCreating(true)

        // Generate a temporary group code for instant navigation
        const tempGroupCode = `temp-${Date.now()}`

        // Navigate instantly (optimistic)
        router.push(`/bill/${tempGroupCode}?creating=true`)

        // Create bill in background
        try {
            // Create the bill
            const billResponse = await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: billName || 'Untitled Bill',
                    subtotal,
                    tax,
                    serviceCharge,
                }),
            })

            if (!billResponse.ok) {
                throw new Error('Failed to create bill')
            }

            const bill = await billResponse.json()

            // Batch create items (parallel instead of sequential)
            await Promise.all(
                items.map(item =>
                    fetch('/api/items', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            billId: bill.id,
                            name: item.name,
                            quantity: item.quantity,
                            price: item.price,
                        }),
                    })
                )
            )

            // Join the bill as a participant
            await fetch('/api/bills/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupCode: bill.groupCode,
                    userId: user.id,
                }),
            })

            // Replace temp URL with real group code
            router.replace(`/bill/${bill.groupCode}`)
        } catch (error) {
            console.error('Error creating bill:', error)
            // If creation fails, show error and go back
            router.replace('/bill/new?error=creation_failed')
            setIsCreating(false)
        }
    }

    // Show scanner overlay
    if (showScanner) {
        return (
            <ReceiptScanner
                onScanComplete={handleScanComplete}
                onCancel={() => {
                    setShowScanner(false)
                    setStep('choose')
                }}
            />
        )
    }

    return (
        <div className="min-h-screen">
            <Header title="New Bill" showBack={true} showNav={false} />

            <main className="container py-6 space-y-6 pb-32">
                {/* Progress Steps */}
                {step !== 'choose' && (
                    <div className="flex justify-center gap-2">
                        {['items', 'details', 'user'].map((s, i) => (
                            <div
                                key={s}
                                className={`w-3 h-3 rounded-full transition-all ${step === s
                                    ? 'bg-[var(--primary)] w-8'
                                    : i < ['items', 'details', 'user'].indexOf(step)
                                        ? 'bg-[var(--primary)]'
                                        : 'bg-[var(--surface-elevated)]'
                                    }`}
                            />
                        ))}
                    </div>
                )}

                {/* Step: Choose input method */}
                {step === 'choose' && (
                    <div className="space-y-8 animate-fade-in pt-8">
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold">Create New Bill</h1>
                            <p className="text-[var(--text-secondary)]">
                                How would you like to add items?
                            </p>
                        </div>

                        <div className="space-y-4">
                            <button
                                onClick={() => setShowScanner(true)}
                                className="glass-card p-6 w-full text-left hover:border-[var(--primary)] border-2 border-transparent transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex-center shrink-0">
                                        <Camera size={28} className="text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Scan Receipt</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            Take a photo of your bill and we&apos;ll extract items automatically using AI
                                        </p>
                                        <span className="inline-block mt-2 text-xs bg-[var(--accent)]/20 text-[var(--accent)] px-2 py-1 rounded-full">
                                            Recommended
                                        </span>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => setStep('items')}
                                className="glass-card p-6 w-full text-left hover:border-[var(--primary)] border-2 border-transparent transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[var(--surface-elevated)] flex-center shrink-0">
                                        <Pencil size={24} className="text-[var(--text-secondary)]" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold">Enter Manually</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            Type in items, prices, and taxes yourself
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {step === 'items' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Bill Items</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                {items.length > 0 ? 'Review and edit items' : 'Add items from your bill'}
                            </p>
                        </div>

                        {/* Item List */}
                        {items.length > 0 && (
                            <div className="space-y-2">
                                {items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="glass-card p-3 flex items-center justify-between animate-slide-up"
                                    >
                                        <div>
                                            <span className="font-medium">{item.name}</span>
                                            {item.quantity > 1 && (
                                                <span className="text-sm text-[var(--text-muted)] ml-2">
                                                    ×{item.quantity}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="money">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="p-2 text-[var(--danger)] hover:bg-[var(--surface)] rounded-lg transition-colors"
                                                aria-label="Remove item"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-between items-center pt-2 px-1">
                                    <span className="text-[var(--text-secondary)]">Subtotal</span>
                                    <span className="money text-lg">{formatCurrency(subtotal)}</span>
                                </div>
                            </div>
                        )}

                        {/* Add Item Form */}
                        <ItemEditor onAdd={addItem} />

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setItems([])
                                    setStep('choose')
                                }}
                                className="btn btn-secondary"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('details')}
                                disabled={items.length === 0}
                                className="btn btn-primary flex-1"
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 'details' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Bill Details</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                Review tax and service charges
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Bill Name (optional)</label>
                                <input
                                    type="text"
                                    value={billName}
                                    onChange={(e) => setBillName(e.target.value)}
                                    placeholder="e.g., Dinner at Molecule"
                                    className="input"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Tax (GST/VAT)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={tax || ''}
                                            onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="input pl-7"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="label">Service Charge</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={serviceCharge || ''}
                                            onChange={(e) => setServiceCharge(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="input pl-7"
                                        />
                                    </div>
                                </div>
                            </div>

                            {discount > 0 && (
                                <div>
                                    <label className="label">Discount</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                                            ₹
                                        </span>
                                        <input
                                            type="number"
                                            value={discount || ''}
                                            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                                            placeholder="0.00"
                                            step="0.01"
                                            min="0"
                                            className="input pl-7"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Summary */}
                        <div className="glass-card p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Subtotal ({items.length} items)</span>
                                <span className="money">{formatCurrency(subtotal)}</span>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--accent)]">Discount</span>
                                    <span className="money text-[var(--accent)]">-{formatCurrency(discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Tax (GST/VAT)</span>
                                <span className="money">{formatCurrency(tax)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-[var(--text-secondary)]">Service Charge</span>
                                <span className="money">{formatCurrency(serviceCharge)}</span>
                            </div>
                            <div className="divider" />
                            <div className="flex justify-between">
                                <span className="font-semibold">Total</span>
                                <span className="money-large">{formatCurrency(total)}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep('items')}
                                className="btn btn-secondary flex-1"
                            >
                                Back
                            </button>
                            <button
                                onClick={() => setStep('user')}
                                className="btn btn-primary flex-1"
                            >
                                Continue
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {step === 'user' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold">Almost Done!</h1>
                            <p className="text-[var(--text-secondary)] mt-1">
                                Enter your info to create the bill
                            </p>
                        </div>

                        <UserSetup onComplete={handleCreateBill} isLoading={isCreating} />

                        <button
                            onClick={() => setStep('details')}
                            className="btn btn-ghost w-full"
                        >
                            Back
                        </button>
                    </div>
                )}
            </main>
        </div>
    )
}
