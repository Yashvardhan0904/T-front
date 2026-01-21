'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    brand: string;
    description?: string;
}

interface ProductCardProps {
    product: Product;
    onAddToCart?: () => void;
    onWishlist?: () => void;
    isWishlisted?: boolean;
}

export function ProductCard({ product, onAddToCart, onWishlist, isWishlisted }: ProductCardProps) {
    const img = (product as any).images?.[0];
    let imgSrc = typeof img === 'string' ? img : img?.path;
    if (imgSrc) imgSrc = imgSrc.replace(/^\/?public\//, '/');

    return (
        <div className="bg-white dark:bg-[#0d0d0f] rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden">
            <Link href={`/products/${product.id}`} className="block">
                {/* Unified Aspect Ratio (3/4) for all screen sizes */}
                <div className="aspect-[3/4] bg-gray-100 dark:bg-white/5 relative overflow-hidden">
                    {imgSrc && (
                        <img
                            src={imgSrc}
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                    )}

                    {/* Placeholder */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>

                    {/* Badge */}
                    <span className="absolute top-3 left-3 px-2 py-1 bg-white/90 dark:bg-black/70 rounded-lg text-[10px] font-bold uppercase tracking-wider text-gray-900 dark:text-white">
                        New
                    </span>
                </div>
            </Link>

            {/* Content - Unified padding and font sizes */}
            <div className="p-4">
                {/* Brand & Category */}
                <div className="flex items-center justify-between gap-2 mb-1 leading-none">
                    <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-500 uppercase tracking-widest truncate">{product.brand || 'Premium'}</span>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-tight shrink-0">{product.category}</span>
                </div>

                {/* Name */}
                <Link href={`/products/${product.id}`} className="block">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1 mb-3 group-hover:text-amber-500 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Price & Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                    <span className="text-base font-black text-gray-900 dark:text-white">
                        ₹{product.price.toLocaleString()}
                    </span>

                    <div className="flex gap-2">
                        {onWishlist && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onWishlist(); }}
                                className={`w-8 h-8 flex items-center justify-center rounded-xl border transition-all active:scale-90 ${isWishlisted
                                    ? 'bg-red-50 dark:bg-red-900/10 border-red-100 dark:border-red-900/30 text-red-500'
                                    : 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10 text-gray-400 hover:border-amber-300 hover:text-amber-500'
                                    }`}
                            >
                                <svg className="w-4 h-4" fill={isWishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        )}
                        {onAddToCart && (
                            <button
                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(); }}
                                className="h-8 px-4 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition-all active:scale-95 shadow-lg shadow-amber-500/20"
                            >
                                Add to Cart
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
