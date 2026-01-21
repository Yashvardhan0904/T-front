'use client';

import { useState, useEffect, use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Check, ChevronDown, ChevronUp, Heart, Share2, ShieldCheck, Star } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

// Helper for fetching
const fetcher = (url: string) => fetch(url).then((res) => res.json());

// --- Mock Data for Variants (since DB doesn't have them yet) ---
const COLORS = [
    { name: 'Midnight Black', hex: '#1a1a1a' },
    { name: 'Pure White', hex: '#ffffff' },
    { name: 'Navy Blue', hex: '#1e3a8a' },
];

const SIZES_CLOTHING = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SIZES_FOOTWEAR = ['6 UK', '7 UK', '8 UK', '9 UK', '10 UK'];

/**
 * Utility to extract image path from various formats
 * Supports: string, { path }, or null/undefined
 */
const getImagePath = (image: any) => {
    if (!image) return null;
    let path = typeof image === 'string' ? image : image.path;
    if (!path) return null;
    // Defensive: strip /public from start if present (Next.js serves public at root)
    return path.replace(/^\/?public\//, '/');
};

// --- Components ---

const AccordionItem = ({ title, isOpen, onClick, children }: any) => (
    <div className="border-b border-gray-100 dark:border-gray-800">
        <button
            onClick={onClick}
            className="w-full flex items-center justify-between py-4 text-left group"
        >
            <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-500 transition-colors">
                {title}
            </span>
            {isOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
        </button>
        <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-4' : 'max-h-0 opacity-0'
                }`}
        >
            <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {children}
            </div>
        </div>
    </div>
);

const SizeChartModal = ({ isOpen, onClose, category }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                    ✕
                </button>
                <h3 className="text-lg font-bold mb-4">Size Guide ({category})</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-4 py-2">Size</th>
                                <th className="px-4 py-2">{category === 'Footwear' ? 'Length (cm)' : 'Chest (in)'}</th>
                                <th className="px-4 py-2">{category === 'Footwear' ? 'EU' : 'Length (in)'}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {/* Mock Data */}
                            <tr>
                                <td className="px-4 py-3 font-medium">S / 6 UK</td>
                                <td className="px-4 py-3">25</td>
                                <td className="px-4 py-3">39</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">M / 7 UK</td>
                                <td className="px-4 py-3">26</td>
                                <td className="px-4 py-3">40</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-3 font-medium">L / 8 UK</td>
                                <td className="px-4 py-3">27</td>
                                <td className="px-4 py-3">41</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
    // Correctly unwrap params in Next.js 15+
    const unwrappedParams = use(params);
    const { id } = unwrappedParams;

    const router = useRouter();
    // Correct store usage
    const addItemToCart = useCartStore((s) => s.addItem);
    const { showToast } = useToast();

    const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuth() as any;

    const { data: productData, error, isLoading } = useSWR(id ? `/api/products/${id}` : null, fetcher, {
        revalidateOnFocus: false,
    });

    const [selectedColor, setSelectedColor] = useState(COLORS[0]);
    const [selectedSize, setSelectedSize] = useState('');
    const [openSection, setOpenSection] = useState('description');
    const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

    if (error) return <div className="text-center py-20 text-red-500">Failed to load product.</div>;
    if (isLoading || !productData) return (
        <div className="min-h-screen bg-white dark:bg-black animate-pulse">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 p-6 lg:p-8">
                <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-900 rounded-3xl" />
                <div className="space-y-6 pt-8">
                    <div className="h-8 w-1/3 bg-gray-100 dark:bg-gray-900 rounded-lg" />
                    <div className="h-12 w-3/4 bg-gray-100 dark:bg-gray-900 rounded-lg" />
                    <div className="h-6 w-1/4 bg-gray-100 dark:bg-gray-900 rounded-lg" />
                    <div className="h-24 w-full bg-gray-100 dark:bg-gray-900 rounded-lg" />
                </div>
            </div>
        </div>
    );

    const { product } = productData;
    const isWishlisted = isInWishlist(id);

    // Logic for sizes based on category
    const isFootwear = product.category?.toLowerCase().includes('shoe') ||
        product.category?.toLowerCase().includes('footwear') ||
        product.category?.toLowerCase().includes('slipper');

    const sizeOptions = isFootwear ? SIZES_FOOTWEAR : SIZES_CLOTHING;

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            showToast('Please sign in to manage your shopping bag', 'info');
            return;
        }
        if (!selectedSize) {
            showToast('Please select a size to continue', 'info');
            return;
        }

        try {
            await addItemToCart({
                id: product._id,
                name: product.name,
                price: product.price,
                priceAtAdd: product.price,
                image: getImagePath(product.images?.[0]),
                size: selectedSize,
                color: selectedColor.name,
            });
            showToast('Item successfully added to your bag', 'success');
        } catch (e) {
            console.error(e);
            showToast('Could not add item to bag. Please try again.', 'error');
        }
    };

    const toggleWishlist = () => {
        if (!isAuthenticated) {
            showToast('Please sign in to manage your wishlist', 'info');
            return;
        }
        if (isWishlisted) {
            removeFromWishlist(id);
            fetch('/api/user/wishlist', {
                method: 'DELETE',
                credentials: 'include',
                body: JSON.stringify({ productId: id }),
            }).catch(console.error);
        } else {
            addToWishlist({ id, name: product.name, price: product.price, image: getImagePath(product.images?.[0]) });
            fetch('/api/user/wishlist', {
                method: 'POST',
                credentials: 'include',
                body: JSON.stringify({ productId: id }),
            }).catch(console.error);
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 selection:bg-amber-100 dark:selection:bg-amber-900">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">

                {/* Breadcrumb (Minimal) */}
                <nav className="flex text-sm text-gray-500 mb-6 lg:mb-8">
                    <button onClick={() => router.back()} className="hover:text-amber-500 transition-colors">
                        ← Back
                    </button>
                    <span className="mx-2">/</span>
                    <span className="hover:text-amber-500 cursor-pointer">{product.category}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">

                    {/* LEFT COLUMN: HERO IMAGE */}
                    <div className="relative group">
                        <div className="aspect-[3/4] relative rounded-3xl overflow-hidden bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                            {/* Image Placeholder or Real Image */}
                            {getImagePath(product.images?.[0]) ? (
                                <Image
                                    src={getImagePath(product.images[0])!}
                                    alt={product.name}
                                    fill
                                    className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
                                    priority
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-200">
                                    <span className="text-4xl">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: DETAILS & ACTIONS */}
                    <div className="flex flex-col h-full sticky top-8">

                        {/* 1. Header Info */}
                        <div className="mb-6">
                            <h2 className="text-sm font-medium text-amber-600 dark:text-amber-500 tracking-wide uppercase mb-2">
                                {product.brand}
                            </h2>
                            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-3">
                                {product.name}
                            </h1>
                            <div className="flex items-center gap-4">
                                <span className="text-xl font-medium text-gray-900 dark:text-gray-100">
                                    ₹{product.price.toLocaleString()}
                                </span>
                                {product.stock > 0 ? (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                        In Stock
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        Out of Stock
                                    </span>
                                )}
                            </div>
                        </div>

                        <hr className="border-gray-100 dark:border-gray-800 mb-6" />

                        {/* 2. Variants (Color) */}
                        <div className="mb-6">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                Color: <span className="text-gray-500 font-normal">{selectedColor.name}</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${selectedColor.name === color.name
                                            ? 'border-amber-500 ring-2 ring-amber-500/20 scale-110'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                            }`}
                                        title={color.name}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full"
                                            style={{ backgroundColor: color.hex, border: color.hex === '#ffffff' ? '1px solid #e5e5e5' : 'none' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 3. Sizes */}
                        <div className="mb-8">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                                    Select Size
                                </h3>
                                <button
                                    onClick={() => setIsSizeChartOpen(true)}
                                    className="text-xs font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700 underline decoration-amber-500/30 underline-offset-4"
                                >
                                    Size Guide
                                </button>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                {sizeOptions.map((size) => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`py-2.5 text-sm font-medium rounded-lg border transition-all ${selectedSize === size
                                            ? 'bg-gray-900 dark:bg-white text-white dark:text-black border-transparent shadow-md transform scale-[1.02]'
                                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-300 hover:border-amber-400 dark:hover:border-amber-500/50'
                                            }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 4. Actions */}
                        <div className="flex gap-3 mb-10">
                            <button
                                onClick={handleAddToCart}
                                disabled={product.stock === 0}
                                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                            <button
                                onClick={toggleWishlist}
                                className={`p-3.5 rounded-xl border transition-all ${isWishlisted
                                    ? 'bg-red-50 border-red-200 text-red-500'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400 hover:border-gray-300 hover:text-gray-600'
                                    }`}
                            >
                                <Heart className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} />
                            </button>
                            <button className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-600 transition-all">
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>

                        {/* 5. Value Points (Trust) */}
                        <div className="grid grid-cols-2 gap-4 mb-12 py-6 border-y border-gray-50 dark:border-gray-800/50 bg-gray-50/50 dark:bg-gray-900/20 rounded-2xl px-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-600 dark:text-blue-400">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Authentic Quality</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-full text-green-600 dark:text-green-400">
                                    <Check className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Fast Shipping</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-600 dark:text-purple-400">
                                    <Star className="w-5 h-5" />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Top Rated Seller</span>
                            </div>
                            {/* Add more as needed */}
                        </div>

                        {/* 6. Accordions (Progressive Disclosure) */}
                        <div className="space-y-1">
                            <AccordionItem
                                title="Description"
                                isOpen={openSection === 'description'}
                                onClick={() => setOpenSection(openSection === 'description' ? '' : 'description')}
                            >
                                {product.description}
                                <br /><br />
                                Experience premium quality and comfort designed for modern living.
                                Each piece is crafted with attention to detail and durability in mind.
                            </AccordionItem>

                            <AccordionItem
                                title="Material & Care"
                                isOpen={openSection === 'material'}
                                onClick={() => setOpenSection(openSection === 'material' ? '' : 'material')}
                            >
                                • 100% Premium Cotton<br />
                                • Machine wash cold<br />
                                • Do not bleach<br />
                                • Tumble dry low
                            </AccordionItem>

                            <AccordionItem
                                title="Shipping & Returns"
                                isOpen={openSection === 'shipping'}
                                onClick={() => setOpenSection(openSection === 'shipping' ? '' : 'shipping')}
                            >
                                Free standard shipping on all orders. Returns are accepted within 30 days of delivery.
                                Item must be unused and in original packaging.
                            </AccordionItem>
                        </div>

                        {/* 7. Seller Info (Minimal card) */}
                        {product.seller && (
                            <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800">
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Sold By</h4>
                                <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                                    {product.seller.logo ? (
                                        <Image src={product.seller.logo} alt={product.seller.storeName} width={48} height={48} className="rounded-full" />
                                    ) : (
                                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold text-lg">
                                            {product.seller.storeName?.substring(0, 1)}
                                        </div>
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {product.seller.storeName || 'Trendora Seller'}
                                            </span>
                                            {product.seller.isVerified && (
                                                <ShieldCheck className="w-4 h-4 text-blue-500" />
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-500">Verified Merchant</span>
                                    </div>
                                    <button className="ml-auto text-sm font-medium text-amber-600 dark:text-amber-500 hover:text-amber-700">
                                        View Store
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            </div>

            <SizeChartModal
                isOpen={isSizeChartOpen}
                onClose={() => setIsSizeChartOpen(false)}
                category={isFootwear ? 'Footwear' : 'Clothing'}
            />
        </div>
    );
}
