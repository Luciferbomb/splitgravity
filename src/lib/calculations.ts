import { roundToTwo } from './utils'

export interface BillItem {
    id: string
    name: string
    quantity: number
    price: number
}

export interface ItemSelection {
    id: string
    itemId: string
    userId: string
    splitRatio: number
}

export interface Bill {
    subtotal: number
    tax: number
    serviceCharge: number
    total: number
}

export interface UserBreakdown {
    userId: string
    itemsSubtotal: number
    taxShare: number
    serviceChargeShare: number
    total: number
    percentage: number
    items: {
        itemId: string
        name: string
        amount: number
        splitRatio: number
        isShared: boolean
    }[]
}

/**
 * Calculate how much each user owes based on their item selections
 * Tax and service charge are distributed proportionally based on each user's share of the subtotal
 */
export function calculateAllUserShares(
    items: BillItem[],
    selections: ItemSelection[],
    bill: Bill
): Map<string, UserBreakdown> {
    const userBreakdowns = new Map<string, UserBreakdown>()

    // Get unique users from selections
    const userIds = [...new Set(selections.map((s) => s.userId))]

    // Initialize breakdowns for each user
    for (const userId of userIds) {
        userBreakdowns.set(userId, {
            userId,
            itemsSubtotal: 0,
            taxShare: 0,
            serviceChargeShare: 0,
            total: 0,
            percentage: 0,
            items: [],
        })
    }

    // Calculate each user's item subtotal
    for (const item of items) {
        const itemSelections = selections.filter((s) => s.itemId === item.id)
        const totalRatio = itemSelections.reduce((sum, s) => sum + s.splitRatio, 0)
        const isShared = itemSelections.length > 1

        for (const selection of itemSelections) {
            const breakdown = userBreakdowns.get(selection.userId)
            if (!breakdown) continue

            // Calculate this user's share of the item
            const itemTotal = item.price * item.quantity
            const userShare = totalRatio > 0
                ? (selection.splitRatio / totalRatio) * itemTotal
                : 0

            breakdown.itemsSubtotal += userShare
            breakdown.items.push({
                itemId: item.id,
                name: item.name,
                amount: roundToTwo(userShare),
                splitRatio: selection.splitRatio,
                isShared,
            })
        }
    }

    // Calculate actual subtotal from items (may differ from bill.subtotal due to rounding)
    const totalItemsSubtotal = Array.from(userBreakdowns.values()).reduce(
        (sum, b) => sum + b.itemsSubtotal,
        0
    )

    // Distribute tax and service charge proportionally
    for (const breakdown of userBreakdowns.values()) {
        if (totalItemsSubtotal > 0) {
            const percentage = breakdown.itemsSubtotal / totalItemsSubtotal
            breakdown.percentage = roundToTwo(percentage * 100)
            breakdown.taxShare = roundToTwo(bill.tax * percentage)
            breakdown.serviceChargeShare = roundToTwo(bill.serviceCharge * percentage)
        }

        // Round subtotal
        breakdown.itemsSubtotal = roundToTwo(breakdown.itemsSubtotal)

        // Calculate total
        breakdown.total = roundToTwo(
            breakdown.itemsSubtotal + breakdown.taxShare + breakdown.serviceChargeShare
        )
    }

    return userBreakdowns
}

/**
 * Calculate a single user's breakdown
 */
export function calculateUserShare(
    userId: string,
    items: BillItem[],
    selections: ItemSelection[],
    bill: Bill
): UserBreakdown | null {
    const allBreakdowns = calculateAllUserShares(items, selections, bill)
    return allBreakdowns.get(userId) || null
}

/**
 * Check if all items have been selected by at least one person
 */
export function getUnassignedItems(
    items: BillItem[],
    selections: ItemSelection[]
): BillItem[] {
    const assignedItemIds = new Set(selections.map((s) => s.itemId))
    return items.filter((item) => !assignedItemIds.has(item.id))
}

/**
 * Calculate optimal payment flow to minimize transactions
 * Takes into account what each person owes vs what they paid
 * Returns an array of transactions: [{from, to, amount}]
 */
export interface Participant {
    userId: string
    userName: string
    amountOwed: number
    amountPaid: number
}

export interface Settlement {
    from: { userId: string; name: string }
    to: { userId: string; name: string }
    amount: number
}

export function calculateSettlements(participants: Participant[]): Settlement[] {
    const settlements: Settlement[] = []

    // Calculate balance for each person (positive = they overpaid, negative = they owe)
    const balances = participants.map((p) => ({
        userId: p.userId,
        name: p.userName,
        balance: roundToTwo(p.amountPaid - p.amountOwed),
    }))

    // Separate into creditors (positive balance = overpaid) and debtors (negative balance = owe)
    const creditors = balances.filter((b) => b.balance > 0.01).sort((a, b) => b.balance - a.balance)
    const debtors = balances.filter((b) => b.balance < -0.01).sort((a, b) => a.balance - b.balance)

    // Match debtors with creditors
    let creditIdx = 0
    let debtIdx = 0

    while (creditIdx < creditors.length && debtIdx < debtors.length) {
        const creditor = creditors[creditIdx]
        const debtor = debtors[debtIdx]

        // How much the debtor owes (absolute value)
        const debtAmount = Math.abs(debtor.balance)
        const creditAmount = creditor.balance

        // The settlement amount is the minimum of what's owed and what's available
        const settlementAmount = roundToTwo(Math.min(debtAmount, creditAmount))

        if (settlementAmount > 0.01) {
            settlements.push({
                from: { userId: debtor.userId, name: debtor.name },
                to: { userId: creditor.userId, name: creditor.name },
                amount: settlementAmount,
            })

            // Update balances
            creditor.balance = roundToTwo(creditor.balance - settlementAmount)
            debtor.balance = roundToTwo(debtor.balance + settlementAmount)
        }

        // Move to next if settled
        if (creditor.balance <= 0.01) creditIdx++
        if (debtor.balance >= -0.01) debtIdx++
    }

    return settlements
}

/**
 * Simple version for backwards compatibility - single payer
 */
export function calculateOptimalPayments(
    breakdowns: UserBreakdown[],
    payerId: string
): { from: string; to: string; amount: number }[] {
    const transactions: { from: string; to: string; amount: number }[] = []

    // Everyone except the payer owes their total to the payer
    for (const breakdown of breakdowns) {
        if (breakdown.userId !== payerId && breakdown.total > 0) {
            transactions.push({
                from: breakdown.userId,
                to: payerId,
                amount: breakdown.total,
            })
        }
    }

    return transactions
}

/**
 * Calculate the bill total from items
 */
export function calculateBillTotal(
    items: BillItem[],
    tax: number,
    serviceCharge: number
): { subtotal: number; total: number } {
    const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    )
    const total = subtotal + tax + serviceCharge

    return {
        subtotal: roundToTwo(subtotal),
        total: roundToTwo(total),
    }
}
