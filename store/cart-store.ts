import { create } from 'zustand';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
    size?: string;
    color?: string;
}

interface CartState {
    items: CartItem[];
    loading: boolean;
    fetchCart: () => Promise<void>;
    addItem: (product: any, quantity?: number) => Promise<void>;
    removeItem: (productId: string, size?: string, color?: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, size?: string, color?: string) => Promise<void>;
    clearCart: () => Promise<void>;
    itemCount: () => number;
    total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,

    fetchCart: async () => {
        set({ loading: true });
        try {
            const res = await fetch('/api/cart', { credentials: 'include' });
            const data = await res.json();
            if (data.success && data.cart) {
                // Filter out items where productId is missing or deleted
                const validItems = data.cart.items.filter((item: any) => item.productId && item.productId._id);

                const mappedItems = validItems.map((item: any) => ({
                    id: item.productId._id,
                    name: item.productId.name,
                    price: item.priceAtAddTime, // Use preserved price
                    quantity: item.quantity,
                    image: (() => {
                        const img = item.productId.images?.[0];
                        let path = typeof img === 'string' ? img : img?.path || '';
                        return path.replace(/^\/?public\//, '/');
                    })(),
                    size: item.size,
                    color: item.color
                }));
                set({ items: mappedItems });
            }
        } catch (error) {
            console.error('Failed to fetch cart:', error);
        } finally {
            set({ loading: false });
        }
    },

    addItem: async (product, quantity = 1) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    productId: product.id || product._id,
                    quantity,
                    action: 'add',
                    size: product.size,
                    color: product.color
                }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to add item');
            }
            get().fetchCart(); // Refresh from server
        } catch (error) {
            console.error('Failed to add item:', error);
            throw error;
        }
    },

    removeItem: async (productId, size, color) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId, action: 'remove', size, color }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to remove item');
            }
            get().fetchCart();
        } catch (error) {
            console.error('Failed to remove item:', error);
            throw error;
        }
    },

    updateQuantity: async (productId, quantity, size, color) => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ productId, quantity, action: 'update_quantity', size, color }),
            });
            const data = await res.json();
            if (!data.success) {
                throw new Error(data.error || 'Failed to update quantity');
            }
            get().fetchCart();
        } catch (error) {
            console.error('Failed to update quantity:', error);
            throw error;
        }
    },

    clearCart: async () => {
        try {
            await fetch('/api/cart', { method: 'DELETE', credentials: 'include' });
            set({ items: [] });
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    },

    itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },

    total: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
}));
