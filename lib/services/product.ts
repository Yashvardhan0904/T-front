/**
 * Product Service
 * Business logic for product operations
 */

import { Product } from '@/types';

/**
 * Filter products by category and search query
 */
export function filterProducts(
    products: Product[],
    filters: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        inStock?: boolean;
    }
): Product[] {
    return products.filter(product => {
        // Category filter
        if (filters.category && filters.category !== 'All') {
            if (product.category !== filters.category) return false;
        }

        // Search filter
        if (filters.search) {
            const query = filters.search.toLowerCase();
            const matchesName = product.name.toLowerCase().includes(query);
            const matchesBrand = product.brand.toLowerCase().includes(query);
            const matchesDesc = product.description?.toLowerCase().includes(query);
            if (!matchesName && !matchesBrand && !matchesDesc) return false;
        }

        // Price range filter
        if (filters.minPrice !== undefined && product.price < filters.minPrice) {
            return false;
        }
        if (filters.maxPrice !== undefined && product.price > filters.maxPrice) {
            return false;
        }

        // In stock filter
        if (filters.inStock && (product.stock === 0 || product.status === 'OUT_OF_STOCK')) {
            return false;
        }

        return true;
    });
}

/**
 * Calculate discounted price
 */
export function getDiscountedPrice(product: Product): number | null {
    if (!product.discount?.percentage) return null;

    const now = new Date();
    if (product.discount.validUntil && new Date(product.discount.validUntil) < now) {
        return null; // Discount expired
    }

    const discount = product.price * (product.discount.percentage / 100);
    return Math.round(product.price - discount);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
    return `₹${price.toLocaleString('en-IN')}`;
}

/**
 * Check if product is in stock
 */
export function isInStock(product: Product): boolean {
    if (product.status === 'OUT_OF_STOCK') return false;
    if (product.stock !== undefined && product.stock <= 0) return false;
    return true;
}

/**
 * Get stock status label
 */
export function getStockStatus(product: Product): {
    label: string;
    type: 'success' | 'warning' | 'error';
} {
    if (!isInStock(product)) {
        return { label: 'Out of Stock', type: 'error' };
    }

    if (product.stock !== undefined) {
        if (product.stock <= 5) {
            return { label: `Only ${product.stock} left`, type: 'warning' };
        }
        return { label: 'In Stock', type: 'success' };
    }

    return { label: 'In Stock', type: 'success' };
}

/**
 * Sort products
 */
export function sortProducts(
    products: Product[],
    sortBy: 'price-asc' | 'price-desc' | 'name' | 'rating' | 'newest'
): Product[] {
    const sorted = [...products];

    switch (sortBy) {
        case 'price-asc':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'rating':
            return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        case 'newest':
            return sorted; // Assume already sorted by newest
        default:
            return sorted;
    }
}
