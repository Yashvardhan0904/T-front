'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function OrdersPage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth() as any;
    const router = useRouter();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login');
            return;
        }

        if (isAuthenticated) {
            fetchOrders();
        }
    }, [isAuthenticated, authLoading, router]);

    const fetchOrders = async () => {
        try {
            setError(null);
            const response = await fetch('/api/orders');
            if (response.ok) {
                const data = await response.json();
                setOrders(data.orders || []);
            } else {
                const err = await response.json();
                setError(err.message || 'Failed to fetch orders');
            }
        } catch (error: any) {
            console.error('Failed to fetch orders:', error);
            setError(error.message || 'Network error');
        } finally {
            setLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
                <p className="text-gray-500">Loading your orders...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h1>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={fetchOrders} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Orders Yet</h1>
                    <p className="text-gray-500 mb-6">Your order history will appear here once you make a purchase.</p>
                    <Link href="/products" className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors inline-block">
                        Start Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Orders</h1>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Order placed</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {new Date(order.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Total</p>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            ₹{order.totalAmount?.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 dark:text-gray-400">Ship to</p>
                                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                                            {order.shippingAddress?.fullName?.split(' ')[0] || user?.name}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase mb-1">Order # {order.trackingNumber || order._id.slice(-8)}</p>
                                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                                        ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                                'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="space-y-6">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex items-start gap-4">
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center relative overflow-hidden">
                                                {item.productImage ? (
                                                    <img src={item.productImage} alt={item.productName} className="object-cover w-full h-full" />
                                                ) : (
                                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
                                                    {item.productName}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">Quantity: {item.quantity}</p>
                                                <p className="text-sm font-medium text-amber-600 mt-1">
                                                    ₹{(item.priceAtPurchase || item.price)?.toLocaleString()}
                                                </p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <Link href={`/orders/${order._id}`} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity text-center whitespace-nowrap">
                                                    Track Order
                                                </Link>
                                                <Link href={`/products/${item.product}`} className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center whitespace-nowrap">
                                                    View Item
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
