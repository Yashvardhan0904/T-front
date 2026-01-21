'use client';

import Link from 'next/link';

export default function AITools() {
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
                    <h1 className="text-4xl font-bold text-gray-900">AI Tools & Analytics</h1>
                    <p className="text-gray-600 mt-2">AI-powered insights and automation</p>
                </div>
            </div>

            {/* AI Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Shopping AI Insights */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-8 border border-purple-200">
                    <div className="text-5xl mb-4">🤖</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Shopping AI Analytics</h3>
                    <p className="text-gray-600 mb-4">View AI shopping assistant interactions and customer preferences</p>
                    <Link
                        href="/shop-ai"
                        className="inline-block px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
                    >
                        View AI Dashboard
                    </Link>
                </div>

                {/* Sales Predictions */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-lg p-8 border border-blue-200">
                    <div className="text-5xl mb-4">📊</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Sales Predictions</h3>
                    <p className="text-gray-600 mb-4">AI-powered sales forecasting and trend analysis</p>
                    <button
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                        disabled
                    >
                        Coming Soon
                    </button>
                </div>

                {/* Customer Insights */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-8 border border-green-200">
                    <div className="text-5xl mb-4">👤</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Customer Insights</h3>
                    <p className="text-gray-600 mb-4">AI-driven customer behavior and segmentation</p>
                    <button
                        className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition"
                        disabled
                    >
                        Coming Soon
                    </button>
                </div>

                {/* Inventory Optimization */}
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl shadow-lg p-8 border border-amber-200">
                    <div className="text-5xl mb-4">📦</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Inventory Optimization</h3>
                    <p className="text-gray-600 mb-4">AI recommendations for stock management</p>
                    <button
                        className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition"
                        disabled
                    >
                        Coming Soon
                    </button>
                </div>

                {/* Product Recommendations */}
                <div className="bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl shadow-lg p-8 border border-pink-200">
                    <div className="text-5xl mb-4">✨</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Product Recommendations</h3>
                    <p className="text-gray-600 mb-4">AI-powered product suggestion engine</p>
                    <button
                        className="inline-block px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg transition"
                        disabled
                    >
                        Coming Soon
                    </button>
                </div>

                {/* Automated Marketing */}
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl shadow-lg p-8 border border-indigo-200">
                    <div className="text-5xl mb-4">📧</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Automated Marketing</h3>
                    <p className="text-gray-600 mb-4">AI-generated marketing campaigns and emails</p>
                    <button
                        className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition"
                        disabled
                    >
                        Coming Soon
                    </button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-12 bg-white rounded-xl shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">AI Performance Metrics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                        <p className="text-4xl font-bold text-purple-600">-</p>
                        <p className="text-gray-600 mt-2">AI Conversations</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                        <p className="text-4xl font-bold text-green-600">-</p>
                        <p className="text-gray-600 mt-2">Conversion Rate</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                        <p className="text-4xl font-bold text-blue-600">-</p>
                        <p className="text-gray-600 mt-2">Avg. Session Time</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
