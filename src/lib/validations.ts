import { z } from 'zod'

// User validation schemas
export const userSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
})

export const createUserSchema = userSchema

// Bill validation schemas
export const createBillSchema = z.object({
    name: z.string().min(1, 'Bill name is required').max(200).optional(),
    subtotal: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    serviceCharge: z.number().min(0).optional(),
})

export const updateBillSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    subtotal: z.number().min(0).optional(),
    tax: z.number().min(0).optional(),
    serviceCharge: z.number().min(0).optional(),
    total: z.number().min(0).optional(),
})

// Bill Item validation schemas
export const createBillItemSchema = z.object({
    billId: z.string().cuid(),
    name: z.string().min(1, 'Item name is required').max(200),
    quantity: z.number().int().min(1).default(1),
    price: z.number().min(0, 'Price must be positive'),
})

export const updateBillItemSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    quantity: z.number().int().min(1).optional(),
    price: z.number().min(0).optional(),
})

// Item Selection validation schemas
export const createSelectionSchema = z.object({
    itemId: z.string().cuid(),
    userId: z.string().cuid(),
    splitRatio: z.number().min(0).max(1).default(1),
})

export const updateSelectionSchema = z.object({
    splitRatio: z.number().min(0).max(1),
})

// Join bill schema
export const joinBillSchema = z.object({
    groupCode: z.string().min(6).max(10),
    userId: z.string().cuid(),
})

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>
export type CreateBillInput = z.infer<typeof createBillSchema>
export type UpdateBillInput = z.infer<typeof updateBillSchema>
export type CreateBillItemInput = z.infer<typeof createBillItemSchema>
export type UpdateBillItemInput = z.infer<typeof updateBillItemSchema>
export type CreateSelectionInput = z.infer<typeof createSelectionSchema>
export type UpdateSelectionInput = z.infer<typeof updateSelectionSchema>
export type JoinBillInput = z.infer<typeof joinBillSchema>
