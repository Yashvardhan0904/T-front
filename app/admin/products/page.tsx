'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function ProductManagement() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchProducts = async () => {
        try {
            const response = await fetch('/api/admin/products/list');
            if (response.ok) {
                const data = await response.json();
                // console.log('📦 Admin Products Loaded:', data.products);
                setProducts(data.products || []);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleAction = async (pId: string | undefined, action: string) => {
        // Fallback for ID if somehow it's missing or named differently
        const productId = pId;
        // console.log(`🚀 [AdminAction] ${action} triggered for ID:`, productId);

        if (!productId || productId === 'undefined') {
            console.error('❌ Cannot perform action: Product ID is missing');
            alert('Error: Product ID is missing. Please refresh the page.');
            return;
        }

        setActionLoading(productId);
        const url = `/api/admin/products/${productId}/approve`;
        // console.log(`🔗 Fetching: ${url}`);

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });

            if (response.ok) {
                await fetchProducts(); // Refresh list
            } else {
                const data = await response.json();
                alert(`Action failed: ${data.message || data.error}`);
            }
        } catch (error) {
            console.error('Action error:', error);
            alert('A network error occurred.');
        } finally {
            setActionLoading(null);
        }
    };

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

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900">Product Management</h1>
                        <p className="text-gray-600 mt-2">Approve listings and manage catalog availability</p>
                    </div>
                    <Link
                        href="/admin/products/new"
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                        + Add Admin Product
                    </Link>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
                    <p className="text-gray-600 text-sm font-medium">Total Products</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{products.length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                    <p className="text-gray-600 text-sm font-medium">Pending Approval</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{products.filter(p => !p.isApproved).length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm font-medium">Active Products</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{products.filter(p => p.status === 'ACTIVE').length}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <p className="text-gray-600 text-sm font-medium">Suspended</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{products.filter(p => !p.isActive).length}</p>
                </div>
            </div>

            {/* Products Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Seller</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Approval</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mx-auto mb-4"></div>
                                        Loading products...
                                    </td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        No products found.
                                    </td>
                                </tr>
                            ) : (
                                products.map((product) => {
                                    const productId = product._id || product.id;
                                    return (
                                        <tr key={productId || Math.random()} className="hover:bg-gray-50 transition">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden shadow-inner">
                                                        {(() => {
                                                            const img = product.images?.[0];
                                                            let imgSrc = typeof img === 'string' ? img : img?.path;
                                                            if (imgSrc) imgSrc = imgSrc.replace(/^\/?public\//, '/');
                                                            return imgSrc ? (
                                                                <img src={imgSrc} alt={product.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                '📦'
                                                            );
                                                        })()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                                        <div className="text-xs text-gray-500">
                                                            {product.category} • <span className="text-purple-600 font-semibold">{product.source === 'pending' ? 'STAGED' : 'LIVE'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {product.seller?.firstName ? `${product.seller.firstName} ${product.seller.lastName || ''}` :
                                                        (product.seller?.name || 'Admin')}
                                                </div>
                                                <div className="text-xs text-gray-500">{product.seller?.email || '-'}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₹{product.price?.toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <ApprovalBadge isApproved={product.isApproved} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    {!product.isApproved && (
                                                        <button
                                                            onClick={() => handleAction(productId, 'approve')}
                                                            disabled={actionLoading === productId}
                                                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                                                        >
                                                            Approve
                                                        </button>
                                                    )}
                                                    {product.isApproved && product.isActive && (
                                                        <button
                                                            onClick={() => handleAction(productId, 'suspend')}
                                                            disabled={actionLoading === productId}
                                                            className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600 disabled:opacity-50"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    {!product.isActive && (
                                                        <button
                                                            onClick={() => handleAction(productId, 'restore')}
                                                            disabled={actionLoading === productId}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                                                        >
                                                            Restore
                                                        </button>
                                                    )}
                                                    {product.status === 'PENDING_APPROVAL' && (
                                                        <button
                                                            onClick={() => handleAction(productId, 'reject')}
                                                            disabled={actionLoading === productId}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    )}
                                                    <Link
                                                        href={`/admin/products/${productId}/edit`}
                                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 flex items-center"
                                                    >
                                                        Edit
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        ACTIVE: 'bg-green-100 text-green-800',
        INACTIVE: 'bg-gray-100 text-gray-800',
        OUT_OF_STOCK: 'bg-red-100 text-red-800',
        PENDING_APPROVAL: 'bg-amber-100 text-amber-800',
    };
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}

function ApprovalBadge({ isApproved }: { isApproved: boolean }) {
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${isApproved ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
            {isApproved ? 'Approved' : 'Pending'}
        </span>
    );
}
