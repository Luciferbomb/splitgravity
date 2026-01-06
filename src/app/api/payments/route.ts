import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/payments - Update a participant's payment amount
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json()
        const { billId, userId, amountPaid } = body

        if (!billId || !userId || amountPaid === undefined) {
            return NextResponse.json(
                { error: 'billId, userId, and amountPaid are required' },
                { status: 400 }
            )
        }

        const participant = await prisma.billParticipant.update({
            where: {
                billId_userId: { billId, userId },
            },
            data: { amountPaid: parseFloat(amountPaid) || 0 },
            include: {
                user: true,
            },
        })

        return NextResponse.json(participant)
    } catch (error) {
        console.error('Error updating payment:', error)
        return NextResponse.json(
            { error: 'Failed to update payment' },
            { status: 500 }
        )
    }
}

// GET /api/payments - Get payment info for a bill
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const billId = searchParams.get('billId')

        if (!billId) {
            return NextResponse.json(
                { error: 'billId is required' },
                { status: 400 }
            )
        }

        const participants = await prisma.billParticipant.findMany({
            where: { billId },
            include: {
                user: true,
            },
        })

        return NextResponse.json(participants)
    } catch (error) {
        console.error('Error fetching payments:', error)
        return NextResponse.json(
            { error: 'Failed to fetch payments' },
            { status: 500 }
        )
    }
}
