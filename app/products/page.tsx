'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { ProductCard } from '@/components/product/product-card';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuth } from '@/context/AuthContext';
import { sortProducts } from '@/lib/services/product';
import { Search, ChevronDown, Check } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Simple Dropdown
function SortDropdown({ value, onChange, options }: { value: string, onChange: (val: string) => void, options: { label: string, value: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const selected = options.find(o => o.value === value)?.label || value;

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-white/10 rounded text-[10px] font-medium"
            >
                <span className="truncate max-w-[80px]">{selected}</span>
                <ChevronDown className={`w-3 h-3 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50 min-w-[140px]">
                    {options.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onChange(opt.value); setIsOpen(false); }}
                            className={`w-full text-left px-3 py-2 text-xs ${value === opt.value ? 'bg-amber-50 text-amber-600 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function ProductsPage() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc' | 'name' | 'rating'>('newest');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(t);
    }, [searchQuery]);

    const addToCart = useCartStore((s) => s.addItem);
    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuth() as any;
    const { showToast } = useToast();

    const { data: catData } = useSWR('/api/products/categories', fetcher);
    const categories = catData?.categories || ['All'];

    const { data: prodData, error, isLoading } = useSWR(
        `/api/products?category=${selectedCategory}&search=${debouncedSearch}`,
        fetcher,
        { revalidateOnFocus: false, dedupingInterval: 2000 }
    );

    const products = prodData?.products || [];
    const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy]);

    const sortOptions = [
        { label: 'Newest', value: 'newest' },
        { label: 'Price: Low', value: 'price-asc' },
        { label: 'Price: High', value: 'price-desc' },
        { label: 'Name A-Z', value: 'name' },
    ];

    if (error) return <div className="p-4 text-red-500 text-center">Failed to load products</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0c] w-full">
            {/* COMPACT HEADER - Fix for overlap with sidebar toggle */}
            <div className="bg-white dark:bg-[#111] border-b border-gray-100 dark:border-white/10 px-3 py-3 lg:py-2 lg:sticky lg:top-0 lg:z-30 pt-16 lg:pt-2">
                {/* Search Row */}
                <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-7 pr-2 py-1.5 bg-gray-100 dark:bg-white/10 rounded text-xs border-0 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                    </div>
                    <SortDropdown value={sortBy} onChange={(val: any) => setSortBy(val)} options={sortOptions} />
                </div>

                {/* Category Pills - Single row scroll */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                    {categories.map((cat: string) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase whitespace-nowrap flex-shrink-0 ${selectedCategory === cat
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="p-2 lg:p-6">
                {isLoading && sortedProducts.length === 0 ? (
                    // Loading skeleton - 1 column mobile, 4 columns desktop
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-white/5 rounded-xl overflow-hidden animate-pulse">
                                <div className="aspect-[16/10] lg:aspect-[3/4] bg-gray-200 dark:bg-white/10"></div>
                                <div className="p-3 space-y-2">
                                    <div className="h-2 bg-gray-200 dark:bg-white/10 rounded w-1/3"></div>
                                    <div className="h-3 bg-gray-200 dark:bg-white/10 rounded w-full"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : sortedProducts.length > 0 ? (
                    // 1 column on mobile, 2 on sm, 4 on lg
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
                        {sortedProducts.map((product: any) => (
                            <ProductCard
                                key={product._id}
                                product={{ ...product, id: product._id }}
                                onAddToCart={async () => {
                                    if (!isAuthenticated) {
                                        showToast('Please sign in to manage your shopping bag', 'info');
                                        return;
                                    }
                                    try {
                                        await addToCart({
                                            id: product._id,
                                            name: product.name,
                                            price: product.price,
                                            priceAtAdd: product.price,
                                        });
                                        showToast('Item successfully added to your bag', 'success');
                                    } catch (err) {
                                        showToast('Failed to add item to bag. Please try again.', 'error');
                                    }
                                }}
                                onWishlist={() => {
                                    if (!isAuthenticated) {
                                        showToast('Please sign in to manage your wishlist', 'info');
                                        return;
                                    }
                                    const id = product._id;
                                    if (isInWishlist(id)) {
                                        removeFromWishlist(id);
                                        fetch('/api/user/wishlist', {
                                            method: 'DELETE',
                                            credentials: 'include',
                                            body: JSON.stringify({ productId: id })
                                        });
                                    } else {
                                        addToWishlist({ id, name: product.name, price: product.price });
                                        fetch('/api/user/wishlist', {
                                            method: 'POST',
                                            credentials: 'include',
                                            body: JSON.stringify({ productId: id })
                                        });
                                    }
                                }}
                                isWishlisted={isInWishlist(product._id)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No products found</p>
                        <button
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                            className="mt-3 px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded"
                        >
                            View All
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
