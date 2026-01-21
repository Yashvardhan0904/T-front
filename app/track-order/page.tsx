'use client';

import { useState } from 'react';

/**
 * Track Order Page
 * Allows users to track their orders by ID
 */
export default function TrackOrderPage() {
    const [trackingId, setTrackingId] = useState('');
    const [orderStatus, setOrderStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async () => {
        if (!trackingId.trim()) {
            setError('Please enter a tracking ID');
            return;
        }

        setLoading(true);
        setError('');
        setOrderStatus(null);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock response
            setOrderStatus({
                orderId: trackingId,
                status: 'shipped',
                estimatedDelivery: 'December 18, 2024',
                timeline: [
                    { status: 'Order Placed', date: 'Dec 13, 2024', completed: true },
                    { status: 'Confirmed', date: 'Dec 13, 2024', completed: true },
                    { status: 'Packed', date: 'Dec 14, 2024', completed: true },
                    { status: 'Shipped', date: 'Dec 15, 2024', completed: true },
                    { status: 'Out for Delivery', date: 'Expected Dec 18', completed: false },
                    { status: 'Delivered', date: '', completed: false },
                ],
            });
        } catch (err) {
            setError('Order not found. Please check the tracking ID.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Track Your Order</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Enter your order ID or tracking number</p>
                </div>

                {/* Search Box */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 mb-6">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={trackingId}
                            onChange={(e) => setTrackingId(e.target.value)}
                            placeholder="Enter order ID or tracking number"
                            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            onKeyDown={(e) => e.key === 'Enter' && handleTrack()}
                        />
                        <button
                            onClick={handleTrack}
                            disabled={loading}
                            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                        >
                            {loading ? 'Tracking...' : 'Track'}
                        </button>
                    </div>
                    {error && (
                        <p className="mt-3 text-sm text-red-600">{error}</p>
                    )}
                </div>

                {/* Order Status */}
                {orderStatus && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm text-gray-500">Order ID</p>
                                <p className="font-mono font-semibold text-gray-900 dark:text-white">{orderStatus.orderId}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Estimated Delivery</p>
                                <p className="font-semibold text-amber-600">{orderStatus.estimatedDelivery}</p>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="relative">
                            {orderStatus.timeline.map((step: any, i: number) => (
                                <div key={step.status} className="flex items-start gap-4 pb-6 last:pb-0">
                                    {/* Line */}
                                    <div className="flex flex-col items-center">
                                        <div className={`w-4 h-4 rounded-full ${step.completed ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                                            }`} />
                                        {i < orderStatus.timeline.length - 1 && (
                                            <div className={`w-0.5 h-full min-h-[2rem] ${step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                                                }`} />
                                        )}
                                    </div>
                                    {/* Content */}
                                    <div className="flex-1">
                                        <p className={`font-medium ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                            {step.status}
                                        </p>
                                        {step.date && (
                                            <p className="text-sm text-gray-500">{step.date}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
