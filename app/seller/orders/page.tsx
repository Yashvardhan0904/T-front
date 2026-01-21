'use client';

import { useState } from 'react';

/**
 * Seller Orders Page
 * Manage orders for seller's products
 */
export default function SellerOrdersPage() {
    const [statusFilter, setStatusFilter] = useState('all');

    // Mock orders - replace with real API data
    const orders = [
        { id: 'ORD-2024-001', customer: 'Rahul Sharma', product: 'Wireless Bluetooth Earbuds', quantity: 2, amount: 3998, status: 'PENDING', date: '2024-12-13' },
        { id: 'ORD-2024-002', customer: 'Priya Mehta', product: 'Smart Watch Pro', quantity: 1, amount: 4999, status: 'CONFIRMED', date: '2024-12-12' },
        { id: 'ORD-2024-003', customer: 'Amit Kumar', product: 'Laptop Stand Aluminum', quantity: 1, amount: 1299, status: 'PACKED', date: '2024-12-11' },
        { id: 'ORD-2024-004', customer: 'Sneha Patel', product: 'Wireless Bluetooth Earbuds', quantity: 1, amount: 1999, status: 'SHIPPED', date: '2024-12-10' },
        { id: 'ORD-2024-005', customer: 'Vikram Singh', product: 'Portable Charger 10000mAh', quantity: 3, amount: 2697, status: 'DELIVERED', date: '2024-12-08' },
    ];

    const statusOptions = ['all', 'PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED'];

    const filteredOrders = statusFilter === 'all'
        ? orders
        : orders.filter(o => o.status === statusFilter);

    const handleStatusUpdate = (orderId: string, newStatus: string) => {
        console.log(`Updating order ${orderId} to ${newStatus}`);
        // TODO: Call API to update status
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage orders for your products</p>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-gray-500">Filter by status:</span>
                    {statusOptions.map((status) => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${statusFilter === status
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`}
                        >
                            {status === 'all' ? 'All' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders List */}
            <div className="space-y-4">
                {filteredOrders.map((order) => (
                    <div
                        key={order.id}
                        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{order.id}</h3>
                                    <StatusBadge status={order.status} />
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Ordered on {order.date}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold text-gray-900 dark:text-white">₹{order.amount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Customer</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.customer}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Product</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.product}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Quantity</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{order.quantity}</p>
                            </div>
                        </div>

                        {/* Status Update Actions */}
                        {order.status !== 'DELIVERED' && (
                            <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <span className="text-sm text-gray-500">Update status:</span>
                                {getNextStatuses(order.status).map((nextStatus) => (
                                    <button
                                        key={nextStatus}
                                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                                        className="px-3 py-1 text-sm bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-colors"
                                    >
                                        Mark as {nextStatus}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {filteredOrders.length === 0 && (
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
                        <p className="text-gray-500">No orders found</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function getNextStatuses(currentStatus: string): string[] {
    const flow: Record<string, string[]> = {
        PENDING: ['CONFIRMED'],
        CONFIRMED: ['PACKED'],
        PACKED: ['SHIPPED'],
        SHIPPED: ['DELIVERED'],
    };
    return flow[currentStatus] || [];
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        CONFIRMED: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        PACKED: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        SHIPPED: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
        DELIVERED: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    };

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${styles[status] || ''}`}>
            {status}
        </span>
    );
}
