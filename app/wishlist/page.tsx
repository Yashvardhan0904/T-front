'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export default function WishlistPage() {
    const { items, removeItem } = useWishlistStore();
    const addToCart = useCartStore((s) => s.addItem);
    const { showToast } = useToast();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { isAuthenticated } = useAuth() as any;

    const handleMoveToCart = async (item: typeof items[0]) => {
        if (!isAuthenticated) {
            showToast('Please sign in to manage your shopping bag', 'info');
            return;
        }
        try {
            await addToCart({ id: item.id, name: item.name, price: item.price });
            handleRemove(item.id);
            showToast('Item successfully moved to your bag', 'success');
        } catch (err) {
            showToast('Failed to move item to bag. Please try again.', 'error');
        }
    };

    const handleRemove = (id: string) => {
        removeItem(id);
        if (isAuthenticated) {
            fetch('/api/user/wishlist', {
                method: 'DELETE',
                credentials: 'include',
                body: JSON.stringify({ productId: id }),
            }).catch(console.error);
        }
    };

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Wishlist Empty</h1>
                    <p className="text-gray-500 mb-6">Save items you love by clicking the Save button on products.</p>
                    <Link href="/products" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors inline-block">
                        Browse Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Wishlist</h1>
                <div className="space-y-3">
                    {items.map(item => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</h3>
                                <p className="text-amber-600 font-bold">₹{item.price.toLocaleString()}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleMoveToCart(item)} className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors">
                                    Add to Cart
                                </button>
                                <button onClick={() => handleRemove(item.id)} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors">
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
