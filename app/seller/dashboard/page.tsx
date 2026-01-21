'use client';

import useSWR from 'swr';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SellerDashboardPage() {
    const { user, isSeller, isAdmin } = useAuth() as any;

    const { data, error, isLoading } = useSWR(
        isSeller || isAdmin ? '/api/seller/stats' : null,
        fetcher,
        { refreshInterval: 60000 }
    );

    if (!user && !isLoading) {
        return <div className="text-center py-20">Please log in to access the seller dashboard.</div>;
    }

    if (user && !isSeller && !isAdmin) {
        return (
            <div className="text-center py-20 space-y-4">
                <p className="text-red-500 font-bold">Access Denied</p>
                <p className="text-gray-500">You must be a registered seller to access this area.</p>
                <Link href="/seller/onboarding" className="inline-block px-6 py-2 bg-amber-500 text-white rounded-lg">
                    Finish Onboarding
                </Link>
            </div>
        );
    }

    if (error) return <div className="text-center py-20 text-red-500">Failed to load dashboard data.</div>;

    const stats = data?.stats || {
        totalProducts: 0,
        activeOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        walletBalance: 0,
    };

    const recentOrders = data?.recentOrders || [];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Welcome back, {user?.name?.split(' ')[0] || 'Seller'}!
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Here's what's happening with your store today.
                    </p>
                </div>
                {isLoading && <span className="text-xs text-amber-500 animate-pulse">Live Syncing...</span>}
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <MetricCard
                    label="Total Products"
                    value={stats.totalProducts}
                    icon="📦"
                    color="blue"
                    loading={isLoading}
                />
                <MetricCard
                    label="Active Orders"
                    value={stats.activeOrders}
                    icon="📋"
                    color="amber"
                    loading={isLoading}
                />
                <MetricCard
                    label="Total Revenue"
                    value={`₹${stats.totalRevenue.toLocaleString()}`}
                    icon="💰"
                    color="green"
                    loading={isLoading}
                />
                <MetricCard
                    label="Pending Orders"
                    value={stats.pendingOrders}
                    icon="⏳"
                    color="red"
                    loading={isLoading}
                />
                <MetricCard
                    label="Wallet Balance"
                    value={`₹${(stats.walletBalance || 0).toLocaleString()}`}
                    icon="💳"
                    color="purple"
                    loading={isLoading}
                />
            </div>

            {/* ... rest of the component remains similar ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link
                    href="/seller/products/new"
                    className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">➕</span>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                Add New Product
                            </h3>
                            <p className="text-sm text-gray-500">List a new product</p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/seller/orders"
                    className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📋</span>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                Manage Orders
                            </h3>
                            <p className="text-sm text-gray-500">View and update orders</p>
                        </div>
                    </div>
                </Link>
                <Link
                    href="/seller/analytics"
                    className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-amber-300 dark:hover:border-amber-700 transition-colors group"
                >
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📈</span>
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                                View Analytics
                            </h3>
                            <p className="text-sm text-gray-500">Track your performance</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Recent Orders */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
                    <Link href="/seller/orders" className="text-sm text-amber-600 hover:underline">
                        View all
                    </Link>
                </div>
                {recentOrders.length > 0 ? (
                    <div className="space-y-3">
                        {recentOrders.map((order: any) => (
                            <div
                                key={order.id}
                                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0"
                            >
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">#{order.id.slice(-8).toUpperCase()}</p>
                                    <p className="text-sm text-gray-500">{order.customer}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-medium text-gray-900 dark:text-white">₹{order.amount.toLocaleString()}</p>
                                    <StatusBadge status={order.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-gray-500">No recent orders yet.</div>
                )}
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon, color, loading }: { label: string; value: string | number; icon: string; color: string; loading?: boolean }) {
    const colorClasses: any = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    };

    return (
        <div className="p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3">
                <span className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </span>
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                    {loading && value === 0 ? <div className="h-6 w-16 bg-gray-200 animate-pulse rounded"></div> : <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles = {
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
        shipped: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        delivered: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    };

    return (
        <span className={`text-xs px-2 py-1 rounded-full ${styles[status as keyof typeof styles] || styles.pending}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
    );
}
