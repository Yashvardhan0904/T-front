'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Order Success Page
 * Shown after successful order placement
 */
export default function OrderSuccessPage({ params }: { params: { orderId: string } }) {
    const [orderDetails, setOrderDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await fetch(`/api/orders/${params.orderId}`);
                const data = await res.json();
                if (data.success) {
                    setOrderDetails(data.order);
                }
            } catch (err) {
                console.error("Failed to fetch order details", err);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [params.orderId]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                    <span className="text-4xl">✓</span>
                </div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Order Placed Successfully!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                    Thank you for your order. We'll send you a confirmation email shortly.
                </p>

                {/* Order Details Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 text-left">
                    <div className="space-y-4">
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Order ID</p>
                            <p className="font-mono font-medium text-gray-900 dark:text-white">{orderDetails?._id || params.orderId}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Tracking Number</p>
                            <p className="font-mono font-medium text-gray-900 dark:text-white">{orderDetails?.trackingNumber || 'Processing...'}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 uppercase">Estimated Delivery</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                                {orderDetails?.estimatedDelivery
                                    ? new Date(orderDetails.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                                    : '5-7 Business Days'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/orders"
                        className="block w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                    >
                        View My Orders
                    </Link>
                    <Link
                        href="/products"
                        className="block w-full py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>

                {/* Help */}
                <p className="mt-6 text-sm text-gray-500">
                    Need help? <Link href="/support" className="text-amber-600 hover:underline">Contact Support</Link>
                </p>
            </div>
        </div>
    );
}
