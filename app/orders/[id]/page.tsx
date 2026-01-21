'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Order Tracking Page
 * Shows chronological order status history from MongoDB
 */
export default function OrderTrackingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.id}`);
                const data = await res.json();
                if (data.success) {
                    setOrder(data.order);
                } else {
                    setError(data.message || 'Failed to fetch order details');
                }
            } catch (err) {
                setError('Something went wrong. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <h1 className="text-xl font-bold text-red-600 mb-4">{error || 'Order not found'}</h1>
                <Link href="/orders" className="text-amber-600 hover:underline">Back to Orders</Link>
            </div>
        );
    }

    const steps = [
        { status: 'PLACED', label: 'Ordered', icon: '📝' },
        { status: 'PAID', label: 'Payment Done', icon: '💰' },
        { status: 'SHIPPED', label: 'Shipped', icon: '🚚' },
        { status: 'DELIVERED', label: 'Delivered', icon: '🎁' },
    ];

    const currentStatusIndex = steps.findIndex(s => s.status === order.status);

    return (
        <div className="min-h-screen p-4 lg:p-8 bg-gray-50 dark:bg-gray-950">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Order Tracking</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Order # {order.trackingNumber || order._id}</p>
                    </div>
                    <Link href="/orders" className="text-sm font-medium text-amber-600 hover:underline">
                        View All Orders
                    </Link>
                </div>

                {/* Progress Bar */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 mb-6 shadow-sm">
                    <div className="relative flex justify-between items-center">
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 dark:bg-gray-800 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-1 bg-amber-500 -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${(currentStatusIndex / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step, i) => {
                            const isCompleted = i <= currentStatusIndex;
                            const isCurrent = i === currentStatusIndex;

                            return (
                                <div key={step.status} className="relative z-10 flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${isCompleted ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                                        } ${isCurrent ? 'ring-4 ring-amber-100 dark:ring-amber-900/40 transform scale-110' : ''}`}>
                                        {isCompleted && i < currentStatusIndex ? '✓' : step.icon}
                                    </div>
                                    <span className={`text-xs mt-3 font-medium ${isCompleted ? 'text-amber-600' : 'text-gray-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Timeline */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Status History</h2>
                    <div className="space-y-8 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100 dark:before:bg-gray-800">
                        {order.statusHistory?.map((entry: any, i: number) => (
                            <div key={i} className="relative pl-10">
                                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-4 border-amber-500"></div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-bold text-gray-900 dark:text-white">{entry.status}</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                            {new Date(entry.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{entry.note || 'Status updated'}</p>
                                </div>
                            </div>
                        )).reverse()}
                    </div>
                </div>

                {/* Items Summary */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 shadow-sm">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Items</h2>
                    <div className="space-y-4">
                        {order.items.map((item: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex-shrink-0 flex items-center justify-center">
                                    {item.productImage ? (
                                        <img src={item.productImage} alt={item.productName} className="w-full h-full object-cover rounded-lg" />
                                    ) : (
                                        <span className="text-2xl">📦</span>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Quantity: {item.quantity}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-gray-900 dark:text-white">₹{(item.priceAtPurchase * item.quantity).toLocaleString()}</p>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center font-bold text-lg">
                            <span className="text-gray-900 dark:text-white">Total Amount</span>
                            <span className="text-amber-600">₹{order.totalAmount?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
