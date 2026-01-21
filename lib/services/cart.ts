/**
 * Cart Service
 * Business logic for cart operations
 */

import { Product, CartItem } from '@/types';

/**
 * Validate cart items against current product data
 * Checks stock availability and price changes
 */
export async function validateCart(
    cartItems: CartItem[],
    products: Product[]
): Promise<{
    valid: boolean;
    errors: string[];
    priceChanges: { id: string; old: number; new: number }[];
}> {
    const errors: string[] = [];
    const priceChanges: { id: string; old: number; new: number }[] = [];

    for (const item of cartItems) {
        const product = products.find(p => p.id === item.id);

        if (!product) {
            errors.push(`Product "${item.name}" is no longer available`);
            continue;
        }

        // Stock validation
        if (product.stock !== undefined && product.stock < item.quantity) {
            errors.push(
                `Only ${product.stock} units of "${product.name}" available (requested: ${item.quantity})`
            );
        }

        // Price validation
        if (item.priceAtAdd && product.price !== item.priceAtAdd) {
            priceChanges.push({
                id: item.id,
                old: item.priceAtAdd,
                new: product.price,
            });
        }
    }

    return {
        valid: errors.length === 0,
        errors,
        priceChanges,
    };
}

/**
 * Calculate cart totals
 */
export function calculateCartTotals(cartItems: CartItem[]): {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
} {
    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shipping + tax;

    return { subtotal, shipping, tax, total };
}

/**
 * Sync cart with server (for logged-in users)
 */
export async function syncCartWithServer(
    userId: string,
    cartItems: CartItem[]
): Promise<void> {
    try {
        await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, items: cartItems }),
        });
    } catch (error) {
        console.error('Failed to sync cart:', error);
    }
}
