'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, total, clearCart, loading } = useCartStore();
    const cartTotal = total();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-black p-6">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-2xl flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-gray-400" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h1>
                <p className="text-gray-500 dark:text-gray-400 mb-8 text-center max-w-sm">
                    Looks like you haven't added anything to your cart yet.
                </p>
                <Link
                    href="/"
                    className="group flex items-center gap-2 px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-amber-600/25"
                >
                    Start Shopping
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        );
    }

    // Price calculations
    const subtotal = cartTotal;
    const shippingThreshold = 500;
    const shipping = subtotal > shippingThreshold ? 0 : 50;
    const estimatedTotal = subtotal + shipping;
    const progressToFreeShipping = Math.min((subtotal / shippingThreshold) * 100, 100);

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">

                {/* Header */}
                <div className="flex items-end justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight mb-1">Shopping Cart</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {items.length} {items.length === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* Cart List */}
                    <div className="lg:col-span-8 space-y-6">
                        {items.map((item) => (
                            <div
                                key={`${item.id}-${item.size}-${item.color}`}
                                className="group flex gap-5 py-5 border-b border-gray-50 dark:border-gray-900 last:border-0 relative"
                            >
                                {/* Image */}
                                <div className="w-20 h-28 lg:w-24 lg:h-32 bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden relative flex-shrink-0">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover object-center"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                            <ShoppingBag className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                                                <Link href={`/products/${item.id}`} className="hover:text-amber-600 transition-colors">
                                                    {item.name}
                                                </Link>
                                            </h3>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                                                {item.size && (
                                                    <span className="flex items-center gap-1">
                                                        Size: <span className="text-gray-900 dark:text-gray-200 font-medium">{item.size}</span>
                                                    </span>
                                                )}
                                                {item.size && item.color && <span className="w-1 h-1 bg-gray-300 rounded-full" />}
                                                {item.color && (
                                                    <span className="flex items-center gap-1">
                                                        Color: <span className="text-gray-900 dark:text-gray-200 font-medium">{item.color}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="font-semibold text-base">
                                            ₹{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>

                                    <div className="mt-auto flex justify-between items-center">
                                        {/* Quantity */}
                                        <div className="flex items-center gap-2 p-1 rounded-md border border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
                                            <button
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1), item.size, item.color)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors disabled:opacity-30"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-xs font-semibold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.size, item.color)}
                                                className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-amber-600 transition-colors"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Remove */}
                                        <button
                                            onClick={() => removeItem(item.id, item.size, item.color)}
                                            className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md transition-colors"
                                            title="Remove item"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:col-span-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 sticky top-24 border border-gray-100 dark:border-gray-800">
                            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-gray-900 dark:text-white font-medium">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                    <span>Shipping Estimate</span>
                                    <span className={shipping === 0 ? 'text-green-600 font-medium' : 'text-gray-900 dark:text-white font-medium'}>
                                        {shipping === 0 ? 'Free' : `₹${shipping}`}
                                    </span>
                                </div>
                                {/* Free Shipping Progress */}
                                {shipping > 0 && (
                                    <div className="mt-2 text-xs">
                                        <div className="flex justify-between mb-1 text-amber-600 dark:text-amber-500 font-medium">
                                            <span>Add ₹{shippingThreshold - subtotal} for free shipping</span>
                                            <span>{Math.round(progressToFreeShipping)}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1">
                                            <div
                                                className="bg-amber-500 h-1 rounded-full transition-all duration-500"
                                                style={{ width: `${progressToFreeShipping}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-3 border-t border-gray-200 dark:border-gray-800 flex justify-between items-end">
                                    <span className="font-bold text-base">Total</span>
                                    <span className="font-extrabold text-2xl">₹{estimatedTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            <Link
                                href="/checkout"
                                className="block w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-center text-base shadow-md hover:shadow-amber-600/20 active:scale-[0.98] transition-all"
                            >
                                Checkout
                            </Link>

                            <div className="mt-4 flex justify-center">
                                <span className="text-[10px] uppercase tracking-wider text-center text-gray-400 font-medium">
                                    Secure Checkout • Free Returns
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
