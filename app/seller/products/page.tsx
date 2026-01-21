'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { Plus, Search, Package, Edit2, Trash2, MoreVertical } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function SellerProductsPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const { data: prodData, isLoading } = useSWR('/api/seller/products', fetcher, {
        revalidateOnFocus: false,
        dedupingInterval: 5000,
    });

    const products = prodData?.products || [];

    const filteredProducts = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black/5 p-4 lg:p-8 font-sans text-gray-900 dark:text-white selection:bg-amber-100 dark:selection:bg-amber-900/30">
            <div className="max-w-7xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-2">Products</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-lg">
                            Manage your inventory and detailed listings.
                        </p>
                    </div>
                    <Link
                        href="/seller/products/new"
                        className="group flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-full font-bold shadow-lg hover:shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Product</span>
                    </Link>
                </div>

                {/* Search & Filter Bar */}
                <div className="bg-white dark:bg-gray-900/50 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-2xl p-2 flex items-center shadow-sm">
                    <div className="pl-4 text-gray-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search products by name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-3 bg-transparent border-none text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none text-base"
                    />
                </div>

                {/* Products List - Desktop Table / Mobile Cards */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50 dark:bg-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                                <tr>
                                    <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                                    <th className="px-6 py-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {isLoading && products.length === 0 ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-6 h-24 bg-gray-50/50 dark:bg-gray-800/10"></td>
                                        </tr>
                                    ))
                                ) : filteredProducts.length > 0 ? (
                                    filteredProducts.map((product: any) => (
                                        <tr key={product._id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center text-xl shadow-inner">
                                                        {(() => {
                                                            const img = product.images?.[0];
                                                            let imgSrc = typeof img === 'string' ? img : img?.path;
                                                            if (imgSrc) imgSrc = imgSrc.replace(/^\/?public\//, '/');
                                                            return imgSrc ? (
                                                                <img src={imgSrc} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                '📦'
                                                            );
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-white text-base">{product.name}</div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 max-w-[200px] truncate">
                                                            ID: {product._id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="font-mono text-gray-700 dark:text-gray-300 font-medium">
                                                    ₹{product.price.toLocaleString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.stock > 10 ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                                                    product.stock > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' :
                                                        'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                    {product.stock} units
                                                </span>
                                            </td>
                                            <td className="px-6 py-5">
                                                <StatusBadge status={product.status} />
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Link
                                                        href={`/seller/products/${product._id}`}
                                                        className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg transition-colors"
                                                        title="Edit Product"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                        title="Delete Product"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden divide-y divide-gray-100 dark:divide-gray-800">
                        {isLoading && products.length === 0 ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="p-4 animate-pulse space-y-3">
                                    <div className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl"></div>
                                </div>
                            ))
                        ) : filteredProducts.length > 0 ? (
                            filteredProducts.map((product: any) => (
                                <div key={product._id} className="p-4 space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-xl flex-shrink-0">
                                            {(() => {
                                                const img = product.images?.[0];
                                                let imgSrc = typeof img === 'string' ? img : img?.path;
                                                if (imgSrc) imgSrc = imgSrc.replace(/^\/?public\//, '/');
                                                return imgSrc ? (
                                                    <img src={imgSrc} alt={product.name} className="w-full h-full object-cover rounded-xl" />
                                                ) : (
                                                    '📦'
                                                );
                                            })()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                                            <p className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{product.price.toLocaleString()}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <StatusBadge status={product.status} />
                                                <span className="text-xs text-gray-500">{product.stock} in stock</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Link
                                            href={`/seller/products/${product._id}`}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button className="px-4 py-2.5 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-gray-400">
                                    <Package className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="text-lg font-medium text-gray-900 dark:text-white">No products found</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const styles: Record<string, string> = {
        ACTIVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800',
        INACTIVE: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700',
        OUT_OF_STOCK: 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800',
        PENDING_APPROVAL: 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize tracking-wide ${styles[status] || styles.INACTIVE}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-2 ${status === 'ACTIVE' ? 'bg-emerald-500' :
                status === 'OUT_OF_STOCK' ? 'bg-rose-500' :
                    status === 'PENDING_APPROVAL' ? 'bg-amber-500' :
                        'bg-gray-500'
                }`}></span>
            {status.toLowerCase().replace(/_/g, ' ')}
        </span>
    );
}
