import { prisma } from '@/lib/prisma'
import { createBillItemSchema, updateBillItemSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/items - Get items for a bill
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const billId = searchParams.get('billId')

        if (!billId) {
            return NextResponse.json({ error: 'billId is required' }, { status: 400 })
        }

        const items = await prisma.billItem.findMany({
            where: { billId },
            include: {
                selections: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { id: 'asc' },
        })

        return NextResponse.json(items)
    } catch (error) {
        console.error('Error fetching items:', error)
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
    }
}

// POST /api/items - Create a new item
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = createBillItemSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            )
        }

        const item = await prisma.billItem.create({
            data: validated.data,
            include: {
                selections: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        // Update bill subtotal and total
        const allItems = await prisma.billItem.findMany({
            where: { billId: validated.data.billId },
        })

        const newSubtotal = allItems.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
            0
        )

        const bill = await prisma.bill.findUnique({
            where: { id: validated.data.billId },
        })

        if (bill) {
            await prisma.bill.update({
                where: { id: validated.data.billId },
                data: {
                    subtotal: newSubtotal,
                    total: newSubtotal + bill.tax + bill.serviceCharge,
                },
            })
        }

        return NextResponse.json(item, { status: 201 })
    } catch (error) {
        console.error('Error creating item:', error)
        return NextResponse.json({ error: 'Failed to create item' }, { status: 500 })
    }
}

// PATCH /api/items - Update an item
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get('itemId')

        if (!itemId) {
            return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
        }

        const body = await request.json()
        const validated = updateBillItemSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            )
        }

        const item = await prisma.billItem.update({
            where: { id: itemId },
            data: validated.data,
            include: {
                selections: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        // Update bill subtotal and total
        const allItems = await prisma.billItem.findMany({
            where: { billId: item.billId },
        })

        const newSubtotal = allItems.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
            0
        )

        const bill = await prisma.bill.findUnique({
            where: { id: item.billId },
        })

        if (bill) {
            await prisma.bill.update({
                where: { id: item.billId },
                data: {
                    subtotal: newSubtotal,
                    total: newSubtotal + bill.tax + bill.serviceCharge,
                },
            })
        }

        return NextResponse.json(item)
    } catch (error) {
        console.error('Error updating item:', error)
        return NextResponse.json({ error: 'Failed to update item' }, { status: 500 })
    }
}

// DELETE /api/items - Delete an item
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const itemId = searchParams.get('itemId')

        if (!itemId) {
            return NextResponse.json({ error: 'itemId is required' }, { status: 400 })
        }

        const item = await prisma.billItem.findUnique({
            where: { id: itemId },
        })

        if (!item) {
            return NextResponse.json({ error: 'Item not found' }, { status: 404 })
        }

        await prisma.billItem.delete({
            where: { id: itemId },
        })

        // Update bill subtotal and total
        const allItems = await prisma.billItem.findMany({
            where: { billId: item.billId },
        })

        const newSubtotal = allItems.reduce(
            (sum: number, item: { price: number; quantity: number }) => sum + item.price * item.quantity,
            0
        )

        const bill = await prisma.bill.findUnique({
            where: { id: item.billId },
        })

        if (bill) {
            await prisma.bill.update({
                where: { id: item.billId },
                data: {
                    subtotal: newSubtotal,
                    total: newSubtotal + bill.tax + bill.serviceCharge,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting item:', error)
        return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 })
    }
}
