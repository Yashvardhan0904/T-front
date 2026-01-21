'use client';

/**
 * Seller Analytics Page
 * Sales data, revenue trends, and performance metrics
 */
export default function SellerAnalyticsPage() {
    // Mock analytics data - replace with real API data
    const analytics = {
        totalRevenue: 245000,
        totalOrders: 128,
        averageOrderValue: 1914,
        returnRate: 2.3,
    };

    const monthlyRevenue = [
        { month: 'Jul', revenue: 18000 },
        { month: 'Aug', revenue: 22000 },
        { month: 'Sep', revenue: 28000 },
        { month: 'Oct', revenue: 35000 },
        { month: 'Nov', revenue: 42000 },
        { month: 'Dec', revenue: 45000 },
    ];

    const topProducts = [
        { name: 'Wireless Bluetooth Earbuds', sales: 45, revenue: 89955 },
        { name: 'Smart Watch Pro', sales: 28, revenue: 139972 },
        { name: 'Laptop Stand Aluminum', sales: 36, revenue: 46764 },
        { name: 'Portable Charger 10000mAh', sales: 52, revenue: 46748 },
    ];

    const maxRevenue = Math.max(...monthlyRevenue.map(m => m.revenue));

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Track your store performance</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Total Revenue" value={`₹${analytics.totalRevenue.toLocaleString()}`} change="+12.5%" positive />
                <MetricCard label="Total Orders" value={analytics.totalOrders.toString()} change="+8.2%" positive />
                <MetricCard label="Avg. Order Value" value={`₹${analytics.averageOrderValue.toLocaleString()}`} change="+3.1%" positive />
                <MetricCard label="Return Rate" value={`${analytics.returnRate}%`} change="-0.5%" positive />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
                    <div className="flex items-end gap-2 h-48">
                        {monthlyRevenue.map((item) => (
                            <div key={item.month} className="flex-1 flex flex-col items-center">
                                <div
                                    className="w-full bg-amber-500 rounded-t transition-all"
                                    style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
                                />
                                <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Products</h2>
                    <div className="space-y-4">
                        {topProducts.map((product, index) => (
                            <div key={product.name} className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-xs flex items-center justify-center font-medium">
                                    {index + 1}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">{product.sales} sales</p>
                                </div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    ₹{product.revenue.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
                <div className="space-y-4">
                    <ActivityItem icon="📦" text="New order #ORD-2024-129 received" time="2 hours ago" />
                    <ActivityItem icon="✅" text="Order #ORD-2024-127 delivered successfully" time="5 hours ago" />
                    <ActivityItem icon="⭐" text="5-star review received for 'Smart Watch Pro'" time="1 day ago" />
                    <ActivityItem icon="📋" text="New order #ORD-2024-126 received" time="1 day ago" />
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, change, positive }: { label: string; value: string; change: string; positive: boolean }) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
                <span className={`text-sm ${positive ? 'text-green-600' : 'text-red-600'}`}>
                    {change}
                </span>
            </div>
        </div>
    );
}

function ActivityItem({ icon, text, time }: { icon: string; text: string; time: string }) {
    return (
        <div className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
            <span className="text-lg">{icon}</span>
            <div className="flex-1">
                <p className="text-sm text-gray-900 dark:text-white">{text}</p>
                <p className="text-xs text-gray-500">{time}</p>
            </div>
        </div>
    );
}
