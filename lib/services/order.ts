/**
 * Order Service
 * Business logic for order operations
 */

import { Order, OrderStatus, CartItem, Address, PaymentMethod } from '@/types';
import { calculateCartTotals, validateCart } from './cart';

// Order status flow
const ORDER_STATUS_FLOW: Record<string, string[]> = {
    PLACED: ['PAID', 'CANCELLED'],
    PAID: ['SHIPPED', 'CANCELLED'],
    SHIPPED: ['DELIVERED'],
    DELIVERED: [],
    CANCELLED: [],
};

/**
 * Validate order status transition
 */
export function canTransitionTo(
    currentStatus: OrderStatus,
    newStatus: OrderStatus
): boolean {
    return ORDER_STATUS_FLOW[currentStatus]?.includes(newStatus) || false;
}

/**
 * Create order payload from cart
 */
export function createOrderPayload(
    userId: string,
    cartItems: CartItem[],
    address: Address,
    paymentMethod: PaymentMethod
): Omit<Order, 'id' | 'createdAt' | 'updatedAt'> {
    const { subtotal, shipping, tax, total } = calculateCartTotals(cartItems);
    const trackingNumber = generateTrackingNumber();

    return {
        userId,
        items: cartItems.map(item => ({
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            priceAtPurchase: item.price,
        })),
        status: 'PLACED',
        subtotal,
        shippingFee: shipping,
        tax,
        totalAmount: total,
        shippingAddress: address,
        paymentMethod,
        paymentStatus: 'PENDING',
        trackingNumber,
    };
}

/**
 * Generate tracking number
 */
function generateTrackingNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TRK${timestamp}${random}`;
}

/**
 * Get estimated delivery date (5-7 days)
 */
export function getEstimatedDelivery(): Date {
    const date = new Date();
    date.setDate(date.getDate() + 5 + Math.floor(Math.random() * 3));
    return date;
}

/**
 * Format order status for display
 */
export function formatOrderStatus(status: string): {
    label: string;
    color: string;
} {
    const statusConfig: Record<string, { label: string; color: string }> = {
        PLACED: { label: 'Placed', color: 'blue' },
        PAID: { label: 'Paid', color: 'indigo' },
        SHIPPED: { label: 'Shipped', color: 'purple' },
        DELIVERED: { label: 'Delivered', color: 'green' },
        CANCELLED: { label: 'Cancelled', color: 'red' },
    };

    return statusConfig[status] || { label: status, color: 'gray' };
}

/**
 * Get seller-specific order status (per item)
 */
export function getSellerOrderStatus(
    orderStatus: string
): 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED' {
    const mapping: Record<string, 'PENDING' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'DELIVERED'> = {
        PLACED: 'PENDING',
        PAID: 'CONFIRMED',
        SHIPPED: 'SHIPPED',
        DELIVERED: 'DELIVERED',
        CANCELLED: 'PENDING',
    };
    return mapping[orderStatus] || 'PENDING';
}
