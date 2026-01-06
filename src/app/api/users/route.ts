import { prisma } from '@/lib/prisma'
import { createUserSchema } from '@/lib/validations'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/users - Get all users or a specific user by email
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const email = searchParams.get('email')

        if (email) {
            const user = await prisma.user.findUnique({
                where: { email },
            })

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 })
            }

            return NextResponse.json(user)
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error('Error fetching users:', error)
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validated = createUserSchema.safeParse(body)

        if (!validated.success) {
            return NextResponse.json(
                { error: validated.error.errors[0].message },
                { status: 400 }
            )
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validated.data.email },
        })

        if (existingUser) {
            return NextResponse.json(existingUser)
        }

        const user = await prisma.user.create({
            data: validated.data,
        })

        return NextResponse.json(user, { status: 201 })
    } catch (error) {
        console.error('Error creating user:', error)
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }
}
