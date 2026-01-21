/**
 * Validators using Zod
 * Centralized validation schemas for all data
 */

import { z } from 'zod';

// Address schema
export const addressSchema = z.object({
    label: z.string().min(1, 'Label is required'),
    fullName: z.string().min(2, 'Name must be at least 2 characters'),
    phone: z.string()
        .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional(),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    postalCode: z.string()
        .regex(/^\d{6}$/, 'Invalid postal code'),
    country: z.string().default('India'),
    isDefault: z.boolean().optional(),
});

// Cart item schema
export const cartItemSchema = z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    quantity: z.number().int().positive().max(10, 'Maximum 10 items per product'),
});

// Order creation schema
export const createOrderSchema = z.object({
    items: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
    shippingAddress: addressSchema,
    paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET']),
    idempotencyKey: z.string().optional(), // Prevent duplicate orders
});

// Product creation schema (for sellers)
export const createProductSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters').max(200),
    description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
    price: z.number().positive('Price must be positive').max(10000000, 'Price too high'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
    category: z.string().min(1, 'Category is required'),
    brand: z.string().min(1, 'Brand is required'),
    discount: z.object({
        percentage: z.number().min(0).max(100),
        validUntil: z.string().datetime().optional(),
    }).optional(),
    tags: z.array(z.string()).optional(),
});

// User registration schema
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain uppercase letter')
        .regex(/[a-z]/, 'Password must contain lowercase letter')
        .regex(/[0-9]/, 'Password must contain number'),
});

// Login schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Seller onboarding schema
export const sellerOnboardingSchema = z.object({
    storeName: z.string().min(3, 'Store name must be at least 3 characters'),
    storeDescription: z.string().optional(),
    contactEmail: z.string().email('Invalid email'),
    contactPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
    bankDetails: z.object({
        accountName: z.string().min(2, 'Account name is required'),
        accountNumber: z.string().min(9, 'Invalid account number').max(18),
        bankName: z.string().min(2, 'Bank name is required'),
        ifscCode: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, 'Invalid IFSC code'),
    }),
});

// Type exports
export type AddressInput = z.infer<typeof addressSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SellerOnboardingInput = z.infer<typeof sellerOnboardingSchema>;
