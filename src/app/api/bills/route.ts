import { prisma } from '@/lib/prisma'
import { createBillSchema, updateBillSchema } from '@/lib/validations'
import { generateGroupCode } from '@/lib/utils'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/bills - Get bills for a user
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')
        const groupCode = searchParams.get('groupCode')

        if (groupCode) {
            const bill = await prisma.bill.findUnique({
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

            if (!bill) {
                return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
            }

            return NextResponse.json(bill)
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'userId or groupCode is required' },
                { status: 400 }
            )
        }

        const bills = await prisma.bill.findMany({
            where: {
                participants: {
                    some: { userId },
                },
            },
            include: {
                items: true,
                participants: {
                    include: {
                        user: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(bills)
    } catch (error) {
        console.error('Error fetching bills:', error)
        return NextResponse.json({ error: 'Failed to fetch bills' }, { status: 500 })
    }
}

// POST /api/bills - Create a new bill
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = createBillSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            )
        }

        // Generate unique group code
        let groupCode = generateGroupCode()
        let attempts = 0

        while (attempts < 10) {
            const existing = await prisma.bill.findUnique({
                where: { groupCode },
            })

            if (!existing) break
            groupCode = generateGroupCode()
            attempts++
        }

        const bill = await prisma.bill.create({
            data: {
                groupCode,
                name: validated.data.name || 'Untitled Bill',
                subtotal: validated.data.subtotal || 0,
                tax: validated.data.tax || 0,
                serviceCharge: validated.data.serviceCharge || 0,
                total:
                    (validated.data.subtotal || 0) +
                    (validated.data.tax || 0) +
                    (validated.data.serviceCharge || 0),
            },
        })

        return NextResponse.json(bill, { status: 201 })
    } catch (error) {
        console.error('Error creating bill:', error)
        return NextResponse.json({ error: 'Failed to create bill' }, { status: 500 })
    }
}

// PATCH /api/bills - Update a bill
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const billId = searchParams.get('billId')

        if (!billId) {
            return NextResponse.json({ error: 'billId is required' }, { status: 400 })
        }

        const body = await request.json()
        const validated = updateBillSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.issues[0].message },
                { status: 400 }
            )
        }

        // Calculate new total if subtotal, tax, or serviceCharge changed
        const currentBill = await prisma.bill.findUnique({
            where: { id: billId },
        })

        if (!currentBill) {
            return NextResponse.json({ error: 'Bill not found' }, { status: 404 })
        }

        const newSubtotal = validated.data.subtotal ?? currentBill.subtotal
        const newTax = validated.data.tax ?? currentBill.tax
        const newServiceCharge = validated.data.serviceCharge ?? currentBill.serviceCharge

        const bill = await prisma.bill.update({
            where: { id: billId },
            data: {
                ...validated.data,
                total: newSubtotal + newTax + newServiceCharge,
            },
        })

        return NextResponse.json(bill)
    } catch (error) {
        console.error('Error updating bill:', error)
        return NextResponse.json({ error: 'Failed to update bill' }, { status: 500 })
    }
}
