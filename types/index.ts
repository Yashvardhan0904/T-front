/**
 * Product Types
 * Shared across the application
 */

export interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description?: string;
    image?: string;
    stock?: number;
    sellerId?: string;
    discount?: {
        percentage: number;
        validUntil?: Date;
    };
    status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'PENDING_APPROVAL';
    rating?: number;
    reviewCount?: number;
}

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    priceAtAdd?: number; // Price when added (for validation)
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    priceAtPurchase: number;
    sellerId?: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    status: OrderStatus;
    subtotal: number;
    shippingFee: number;
    tax: number;
    totalAmount: number;
    shippingAddress: Address;
    paymentMethod: PaymentMethod;
    paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
    trackingNumber?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type OrderStatus =
    | 'PLACED'
    | 'PAID'
    | 'SHIPPED'
    | 'DELIVERED'
    | 'CANCELLED';

export type PaymentMethod = 'COD' | 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET';

export interface Address {
    id?: string;
    label: string;
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'SELLER' | 'ADMIN';
    avatar?: string;
    sellerProfile?: string;
}

export interface Seller {
    id: string;
    userId: string;
    storeName: string;
    storeDescription?: string;
    status: 'PENDING' | 'APPROVED' | 'SUSPENDED' | 'REJECTED';
    contactEmail: string;
    contactPhone: string;
}
