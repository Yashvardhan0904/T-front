'use client';

import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminDashboard() {
    const { user } = useAuth() as { user: any };
    const pathname = usePathname();

    const { data: statsData, isLoading } = useSWR('/api/admin/system/stats', fetcher, {
        refreshInterval: 60000, // Reduced polling for DB cost savings
    });

    const stats = statsData?.stats || {
        totalProducts: '-',
        totalUsers: '-',
        totalOrders: '-',
        totalRevenue: '-',
        pendingApprovals: '-'
    };

    const dashboardCards = [
        {
            title: 'Product Management',
            description: `Manage ${stats.totalProducts} products and ${stats.pendingApprovals} pending approvals`,
            icon: '📦',
            href: '/admin/products',
            color: 'from-blue-500 to-blue-600',
        },
        // ... rest of the cards ...
        {
            title: 'User Management',
            description: `View and manage ${stats.totalUsers} user accounts`,
            icon: '👥',
            href: '/admin/users',
            color: 'from-green-500 to-green-600',
        },
        {
            title: 'Seller Management',
            description: `Approve or reject merchant applications (${stats.pendingSellers || 0} pending)`,
            icon: '🏪',
            href: '/admin/sellers',
            color: 'from-amber-500 to-amber-600',
        },
        {
            title: 'Order Management',
            description: `Track ${stats.totalOrders} customer orders`,
            icon: '📋',
            href: '/admin/orders',
            color: 'from-purple-500 to-purple-600',
        },
        {
            title: 'AI Tools & Analytics',
            description: `Revenue: ₹${stats.totalRevenue.toLocaleString()}`,
            icon: '🤖',
            href: '/admin/ai-tools',
            color: 'from-amber-500 to-amber-600',
        },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            {/* Header */}
            <div className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Welcome back, <span className="font-semibold text-amber-600">{user?.name}</span>
                            {isLoading && <span className="ml-4 text-xs text-amber-500 animate-pulse">Live Syncing...</span>}
                        </p>
                    </div>
                    <Link
                        href="/"
                        className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-lg font-medium shadow-md hover:shadow-lg transition border border-gray-200"
                    >
                        ← Back to Store
                    </Link>
                </div>

                {/* Admin Badge */}
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Admin Access</span>
                </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {dashboardCards.map((card) => (
                    <Link
                        key={card.href}
                        href={card.href}
                        className="group relative overflow-hidden bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                    >
                        {/* Gradient Background */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                        {/* Content */}
                        <div className="relative p-8">
                            <div className="flex items-start justify-between mb-4">
                                <div className="text-5xl">{card.icon}</div>
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${card.color} text-white shadow-md`}>
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                {card.title}
                            </h3>
                            <p className="text-gray-600 h-10 overflow-hidden">
                                {card.description}
                            </p>
                        </div>

                        {/* Hover Effect Line */}
                        <div className={`h-1 bg-gradient-to-r ${card.color} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`} />
                    </Link>
                ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Products</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalProducts}</p>
                        </div>
                        <div className="text-4xl">📦</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Users</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalUsers}</p>
                        </div>
                        <div className="text-4xl">👥</div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-600 text-sm font-medium">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalOrders}</p>
                        </div>
                        <div className="text-4xl">📋</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
