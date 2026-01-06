import { prisma } from '@/lib/prisma'
import { calculateAllUserShares } from '@/lib/calculations'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/selections - Get selections for a bill or user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const billId = searchParams.get('billId')
        const userId = searchParams.get('userId')

        const where: { item?: { billId: string }; userId?: string } = {}

        if (billId) {
            where.item = { billId }
        }

        if (userId) {
            where.userId = userId
        }

        if (Object.keys(where).length === 0) {
            return NextResponse.json(
                { error: 'billId or userId is required' },
                { status: 400 }
            )
        }

        const selections = await prisma.itemSelection.findMany({
            where,
            include: {
                item: true,
                user: true,
            },
        })

        return NextResponse.json(selections)
    } catch (error) {
        console.error('Error fetching selections:', error)
        return NextResponse.json(
            { error: 'Failed to fetch selections' },
            { status: 500 }
        )
    }
}

// POST /api/selections - Toggle or create a selection
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { itemId, userId, splitRatio = 1.0, toggle = false } = body

        if (!itemId || !userId) {
            return NextResponse.json(
                { error: 'itemId and userId are required' },
                { status: 400 }
            )
        }

        // Check if selection already exists
        const existingSelection = await prisma.itemSelection.findUnique({
            where: {
                itemId_userId: { itemId, userId },
            },
        })

        if (toggle && existingSelection) {
            // Remove selection if toggle is true and it exists
            await prisma.itemSelection.delete({
                where: { id: existingSelection.id },
            })

            // Update participant amounts
            await updateParticipantAmounts(itemId)

            return NextResponse.json({ removed: true })
        }

        if (existingSelection) {
            // Update split ratio
            const selection = await prisma.itemSelection.update({
                where: { id: existingSelection.id },
                data: { splitRatio },
                include: {
                    item: true,
                    user: true,
                },
            })

            await updateParticipantAmounts(itemId)

            return NextResponse.json(selection)
        }

        // Create new selection
        const selection = await prisma.itemSelection.create({
            data: { itemId, userId, splitRatio },
            include: {
                item: true,
                user: true,
            },
        })

        // Make sure user is a participant
        const item = await prisma.billItem.findUnique({
            where: { id: itemId },
        })

        if (item) {
            const existingParticipant = await prisma.billParticipant.findUnique({
                where: {
                    billId_userId: { billId: item.billId, userId },
                },
            })

            if (!existingParticipant) {
                await prisma.billParticipant.create({
                    data: {
                        billId: item.billId,
                        userId,
                        amountOwed: 0,
                    },
                })
            }

            await updateParticipantAmounts(itemId)
        }

        return NextResponse.json(selection, { status: 201 })
    } catch (error) {
        console.error('Error creating selection:', error)
        return NextResponse.json(
            { error: 'Failed to create selection' },
            { status: 500 }
        )
    }
}

// DELETE /api/selections - Remove a selection
export async function DELETE(request: NextRequest) {
    try {
        // First try to get from body, fallback to query params
        let itemId: string | null = null
        let userId: string | null = null

        try {
            const body = await request.json()
            itemId = body.itemId
            userId = body.userId
        } catch {
            // Fallback to query params if no body
            const { searchParams } = new URL(request.url)
            itemId = searchParams.get('itemId')
            userId = searchParams.get('userId')
        }

        if (!itemId || !userId) {
            return NextResponse.json(
                { error: 'itemId and userId are required' },
                { status: 400 }
            )
        }

        await prisma.itemSelection.delete({
            where: {
                itemId_userId: { itemId, userId },
            },
        })

        await updateParticipantAmounts(itemId)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting selection:', error)
        return NextResponse.json(
            { error: 'Failed to delete selection' },
            { status: 500 }
        )
    }
}

// Helper function to update participant amounts after selection changes
async function updateParticipantAmounts(itemId: string) {
    try {
        const item = await prisma.billItem.findUnique({
            where: { id: itemId },
            include: { bill: true },
        })

        if (!item) return

        const bill = await prisma.bill.findUnique({
            where: { id: item.billId },
            include: {
                items: true,
                participants: true,
            },
        })

        if (!bill) return

        const selections = await prisma.itemSelection.findMany({
            where: {
                item: { billId: bill.id },
            },
        })

        // Calculate new amounts
        const breakdowns = calculateAllUserShares(
            bill.items.map((i) => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
            })),
            selections.map((s) => ({
                id: s.id,
                itemId: s.itemId,
                userId: s.userId,
                splitRatio: s.splitRatio,
            })),
            {
                subtotal: bill.subtotal,
                tax: bill.tax,
                serviceCharge: bill.serviceCharge,
                total: bill.total,
            }
        )

        // Update each participant's amount
        for (const participant of bill.participants) {
            const breakdown = breakdowns.get(participant.userId)
            await prisma.billParticipant.update({
                where: { id: participant.id },
                data: { amountOwed: breakdown?.total || 0 },
            })
        }
    } catch (error) {
        console.error('Error updating participant amounts:', error)
    }
}
