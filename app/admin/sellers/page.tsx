'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function SellerManagement() {
    const [sellers, setSellers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchSellers = async () => {
        try {
            const response = await fetch('/api/admin/sellers');
            if (response.ok) {
                const data = await response.json();
                setSellers(data.sellers || []);
            }
        } catch (error) {
            console.error('Failed to fetch sellers:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSellers();
    }, []);

    const handleAction = async (sellerId: string, status: string) => {
        if (!confirm(`Are you sure you want to set this seller to ${status}?`)) return;

        setActionLoading(sellerId);
        try {
            const response = await fetch('/api/admin/sellers', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sellerId, status }),
            });

            if (response.ok) {
                await fetchSellers(); // Refresh list
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
                        <h1 className="text-4xl font-bold text-gray-900">Seller Management</h1>
                        <p className="text-gray-600 mt-2">Approve or reject merchant store applications</p>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500">
                    <p className="text-gray-600 text-sm font-medium">Pending Applications</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {sellers.filter(s => s.status === 'PENDING').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
                    <p className="text-gray-600 text-sm font-medium">Verified Sellers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {sellers.filter(s => s.status === 'VERIFIED').length}
                    </p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
                    <p className="text-gray-600 text-sm font-medium">Rejected/Suspended</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                        {sellers.filter(s => ['REJECTED', 'SUSPENDED'].includes(s.status)).length}
                    </p>
                </div>
            </div>

            {/* Sellers Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Store / Merchant</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Bank Details</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500 mx-auto mb-4"></div>
                                        Loading applications...
                                    </td>
                                </tr>
                            ) : sellers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No seller applications found.
                                    </td>
                                </tr>
                            ) : (
                                sellers.map((seller) => (
                                    <tr key={seller._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-amber-100 rounded-full flex items-center justify-center text-xl">
                                                    🏪
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900">{seller.storeName}</div>
                                                    <div className="text-xs text-gray-500">{seller.user?.name || 'Unknown User'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{seller.contactEmail}</div>
                                            <div className="text-xs text-gray-500">{seller.contactPhone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-xs text-gray-900 font-mono">
                                                {seller.bankDetails?.bankName}<br />
                                                {seller.bankDetails?.accountNumber}<br />
                                                {seller.bankDetails?.ifscCode}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <StatusBadge status={seller.status} />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex gap-2">
                                                {seller.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleAction(seller._id, 'VERIFIED')}
                                                            disabled={actionLoading === seller._id}
                                                            className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleAction(seller._id, 'REJECTED')}
                                                            disabled={actionLoading === seller._id}
                                                            className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                {seller.status === 'VERIFIED' && (
                                                    <button
                                                        onClick={() => handleAction(seller._id, 'SUSPENDED')}
                                                        disabled={actionLoading === seller._id}
                                                        className="px-3 py-1 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition"
                                                    >
                                                        Suspend
                                                    </button>
                                                )}
                                                {(seller.status === 'REJECTED' || seller.status === 'SUSPENDED') && (
                                                    <button
                                                        onClick={() => handleAction(seller._id, 'VERIFIED')}
                                                        disabled={actionLoading === seller._id}
                                                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition"
                                                    >
                                                        Re-activate
                                                    </button>
                                                )}
                                            </div>
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

function StatusBadge({ status }: { status: string }) {
    const styles: any = {
        VERIFIED: 'bg-green-100 text-green-800 border border-green-200',
        PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
        REJECTED: 'bg-red-100 text-red-800 border border-red-200',
        SUSPENDED: 'bg-gray-100 text-gray-800 border border-gray-200',
    };
    return (
        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}
