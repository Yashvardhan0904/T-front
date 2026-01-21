'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function OrderManagement() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch orders from API
        const fetchOrders = async () => {
            try {
                const response = await fetch('/api/admin/orders');
                if (response.ok) {
                    const data = await response.json();
                    setOrders(data.orders || []);
                }
            } catch (error) {
                console.error('Failed to fetch orders:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-8">
                <Link
                    href="/admin"
                    className="inline-flex items-center text-amber-600 hover:text-amber-700 font-medium mb-4"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>

                <div>
                    <h1 className="text-4xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-600 mt-2">Track and fulfill customer orders</p>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
                    <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
                    <p className="text-gray-600 text-sm font-medium">Pending</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{pendingOrders}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{completedOrders}</p>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mx-auto mb-4"></div>
                                        Loading orders...
                                    </td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No orders found. Orders will appear here when customers make purchases.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            #{order._id?.slice(-8) || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.customer?.name || 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                            ${order.total?.toFixed(2) || '0.00'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : order.status === 'cancelled'
                                                        ? 'bg-red-100 text-red-800'
                                                        : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {order.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button className="text-amber-600 hover:text-amber-900">View</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
