import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// POST /api/bills/join - Join a bill by group code
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { groupCode, userId } = body

        if (!groupCode || !userId) {
            return NextResponse.json(
                { error: 'groupCode and userId are required' },
                { status: 400 }
            )
        }

        // Find the bill
        const bill = await prisma.bill.findUnique({
            where: { groupCode },
            include: {
                items: true,
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        if (!bill) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
        }

        // Check if user is already a participant
        const existingParticipant = bill.participants.find(
            (p) => p.userId === userId
        )

        if (existingParticipant) {
            return NextResponse.json(bill)
        }

        // Add user as participant
        await prisma.billParticipant.create({
            data: {
                billId: bill.id,
                userId,
                amountOwed: 0,
            },
        })

        // Get updated bill
        const updatedBill = await prisma.bill.findUnique({
            where: { groupCode },
            include: {
                items: {
                    include: {
                        selections: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
        })

        return NextResponse.json(updatedBill)
    } catch (error) {
        console.error('Error joining bill:', error)
        return NextResponse.json({ error: 'Failed to join bill' }, { status: 500 })
    }
}
