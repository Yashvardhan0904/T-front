'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

// --- Categorized Constants ---

const CATEGORY_GROUPS = {
    'Tops': ['tshirt', 'shirt', 'polo', 'hoodie', 'sweatshirt', 'tank-top', 'blouse', 'crop-top', 'tunic'],
    'Bottoms': ['jeans', 'trousers', 'chinos', 'shorts', 'skirt', 'leggings', 'joggers', 'track-pants'],
    'Outerwear': ['jacket', 'coat', 'blazer', 'puffer', 'trench-coat', 'cardigan', 'sweater', 'vest'],
    'Ethnic': ['kurta', 'saree', 'sherwani', 'lehenga', 'dhoti'],
    'Active & Inner': ['activewear', 'sports-bra', 'swimwear', 'boxers', 'briefs', 'robe', 'nightsuit'],
    'Accessories': ['scarf', 'shawl', 'tie', 'belt', 'socks'],
    'Other': ['other']
};

const FABRIC_GROUPS = {
    'Natural': ['cotton', 'wool', 'silk', 'linen', 'hemp', 'jute', 'cashmere', 'mohair', 'angora', 'alpaca'],
    'Synthetic': ['polyester', 'nylon', 'spandex', 'acrylic', 'polypropylene'],
    'Semi-Synthetic': ['rayon', 'viscose', 'modal', 'tencel', 'acetate', 'cupro'],
    'Specialized': ['leather', 'suede', 'velvet', 'denim', 'canvas', 'chiffon', 'satin', 'fleece', 'organza', 'tweed', 'flannel', 'corduroy', 'jersey', 'pique', 'poplin', 'mesh', 'lace', 'tulle'],
    'Blends': ['blend', 'other']
};

const OCCASION_GROUPS = {
    'Core': ['casual', 'office', 'formal', 'party', 'lounge', 'work-from-home'],
    'Sports': ['gym', 'yoga', 'running', 'hiking', 'swimming', 'cycling', 'tennis', 'basketball', 'cricket', 'football', 'activewear'],
    'GenZ / Styles': ['streetwear', 'y2k', 'athleisure', 'gorpcore', 'minimalist', 'boho', 'preppy', 'vintage'],
    'Events & Lifestyle': ['brunch', 'date-night', 'festival', 'concert', 'clubbing', 'wedding', 'festive', 'cocktail', 'evening-wear', 'graduation', 'interview', 'vacation', 'travel', 'beachwear']
};

const WARMTH_LEVELS = ['light', 'medium', 'heavy'];
const SEASONS = ['summer', 'winter', 'all-season', 'spring', 'autumn', 'monsoon', 'pre-fall'];
const COLORS = ['black', 'white', 'red', 'blue', 'green', 'yellow', 'grey', 'navy', 'beige', 'brown', 'pink', 'purple', 'orange', 'olive', 'maroon', 'gold', 'silver', 'multi'];
const FITS = ['slim', 'regular', 'oversized'];

export default function AdminProductEditForm({ productId }: { productId: string }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const [formData, setFormData] = useState<any>({
        name: '',
        brand: '',
        price: '',
        description: '',
        category: 'tshirt',
        fabric: 'cotton',
        warmth_level: 'light',
        season: [],
        fit: 'regular',
        color: 'black',
        occasion: [],
        status: 'draft',
    });

    const [existingImages, setExistingImages] = useState<any[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
    const [newFiles, setNewFiles] = useState<File[]>([]);

    useEffect(() => {
        setIsMounted(true);
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/admin/products/${productId}`);
                const data = await res.json();
                if (data.success) {
                    setFormData(data.product);
                    setExistingImages(data.product.images || []);
                } else {
                    setError(data.message || 'Failed to load product');
                }
            } catch (err) {
                setError('Failed to connect to server');
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: 'season' | 'occasion', value: string) => {
        setFormData((prev: any) => {
            const current = [...prev[name]];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter((item: any) => item !== value) };
            } else {
                return { ...prev, [name]: [...current, value] };
            }
        });
    };

    const handleRemoveExistingImage = (path: string) => {
        setExistingImages(prev => prev.filter(img => img.path !== path));
        setImagesToDelete(prev => [...prev, path]);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            const totalCount = existingImages.length + files.length;
            if (totalCount > 5) {
                alert('Max 5 images total.');
                e.target.value = '';
                return;
            }
            setNewFiles(files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const submitData = new FormData();
            submitData.append('productData', JSON.stringify(formData));
            submitData.append('imagesToDelete', JSON.stringify(imagesToDelete));
            newFiles.forEach(file => submitData.append('newImages', file));

            const res = await fetch(`/api/admin/products/${productId}`, {
                method: 'PATCH',
                body: submitData,
            });

            const result = await res.json();
            if (result.success) {
                setSuccess(true);
                setTimeout(() => router.push('/admin/products'), 1500);
            } else {
                setError(result.message || 'Update failed');
            }
        } catch (err) {
            setError('Update failed due to network error');
        } finally {
            setSubmitting(false);
        }
    };

    if (!isMounted || loading) return <div className="p-12 text-center text-gray-400 font-medium">Fetching product data...</div>;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-10">
            <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Overwrite</h2>
                    <p className="text-sm text-gray-500 mt-1">Direct metadata correction and inventory status control.</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">System Status</span>
                    <select
                        suppressHydrationWarning
                        name="status"
                        className="bg-white dark:bg-gray-900 px-4 py-2 text-xs font-bold rounded-xl border-none outline-none focus:ring-2 focus:ring-amber-500"
                        value={formData.status}
                        onChange={handleInputChange}
                    >
                        <option value="draft">DRAFT (REVIEW)</option>
                        <option value="active">ACTIVE (LIVE)</option>
                        <option value="inactive">INACTIVE (HIDDEN)</option>
                    </select>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Identification */}
                    <section className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Verified Product Name</label>
                            <input
                                suppressHydrationWarning
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Verified Brand</label>
                                <input
                                    suppressHydrationWarning
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price (₹)</label>
                                <input
                                    suppressHydrationWarning
                                    type="number"
                                    name="price"
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">AI-Optimized Description</label>
                            <textarea
                                suppressHydrationWarning
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none h-48 resize-none transition-all"
                            />
                        </div>
                    </section>

                    {/* Classification */}
                    <section className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Category Group</label>
                                <select
                                    suppressHydrationWarning
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {Object.entries(CATEGORY_GROUPS).map(([group, options]) => (
                                        <optgroup key={group} label={group}>
                                            {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Material Group</label>
                                <select
                                    suppressHydrationWarning
                                    name="fabric"
                                    value={formData.fabric}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {Object.entries(FABRIC_GROUPS).map(([group, options]) => (
                                        <optgroup key={group} label={group}>
                                            {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Silhouette / Fit</label>
                                <select
                                    suppressHydrationWarning
                                    name="fit"
                                    value={formData.fit}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {FITS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Base Color</label>
                                <select
                                    suppressHydrationWarning
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {COLORS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Material Weight / Warmth</label>
                            <div className="grid grid-cols-3 gap-3">
                                {WARMTH_LEVELS.map(w => (
                                    <button
                                        suppressHydrationWarning
                                        key={w}
                                        type="button"
                                        onClick={() => setFormData((prev: any) => ({ ...prev, warmth_level: w }))}
                                        className={`py-4 rounded-xl text-[11px] font-bold uppercase border transition-all ${formData.warmth_level === w
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-lg shadow-amber-500/10'
                                            : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-100 dark:border-gray-700 hover:border-amber-300'
                                            }`}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Seasonality */}
                <section>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Verified Seasonality</label>
                    <div className="flex flex-wrap gap-2.5">
                        {SEASONS.map(s => (
                            <button
                                suppressHydrationWarning
                                key={s}
                                type="button"
                                onClick={() => handleCheckboxChange('season', s)}
                                className={`px-5 py-3 text-[11px] font-bold rounded-xl border transition-all ${formData.season.includes(s)
                                    ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black'
                                    : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400'
                                    }`}
                            >
                                {s.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Comprehensive Occasions */}
                <section className="space-y-8 border-t border-gray-100 dark:border-gray-800 pt-10">
                    <label className="block text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Verified Target Occasions (AI Anchors)</label>
                    <div className="space-y-10">
                        {Object.entries(OCCASION_GROUPS).map(([group, options]) => (
                            <div key={group} className="space-y-4">
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{group}</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {options.map(o => (
                                        <button
                                            suppressHydrationWarning
                                            key={o}
                                            type="button"
                                            onClick={() => handleCheckboxChange('occasion', o)}
                                            className={`px-5 py-2.5 text-[11px] font-bold rounded-xl border transition-all ${formData.occasion.includes(o)
                                                ? 'bg-amber-500 text-white border-amber-600 shadow-md'
                                                : 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800'
                                                }`}
                                        >
                                            {o.replace('-', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Assets */}
                <section className="border-t border-gray-100 dark:border-gray-800 pt-10">
                    <label className="block text-lg font-bold text-gray-900 dark:text-white mb-6">Asset Governance ({existingImages.length + newFiles.length}/5)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-6">
                        {existingImages.map((img: any) => (
                            <div key={img.path} className="relative aspect-square bg-gray-50 dark:bg-gray-800 rounded-2xl group overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                                <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-300 p-4 text-center break-all font-medium">
                                    {img.filename}
                                </div>
                                <button
                                    suppressHydrationWarning
                                    type="button"
                                    onClick={() => handleRemoveExistingImage(img.path)}
                                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                                <div className="absolute bottom-0 left-0 bg-black/60 text-white text-[8px] font-bold px-3 py-1 uppercase">{img.role}</div>
                            </div>
                        ))}
                        {newFiles.map((f, i) => (
                            <div key={i} className="aspect-square bg-amber-50 dark:bg-amber-500/5 border-2 border-dashed border-amber-300 rounded-2xl flex flex-col items-center justify-center p-3">
                                <span className="text-xl mb-1">🆕</span>
                                <span className="text-[9px] font-bold text-amber-600 uppercase text-center line-clamp-2">{f.name}</span>
                            </div>
                        ))}
                        {(existingImages.length + newFiles.length) < 5 && (
                            <button
                                suppressHydrationWarning
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-amber-500 hover:bg-white rounded-2xl flex flex-col items-center justify-center text-gray-300 transition-all group"
                            >
                                <span className="text-3xl group-hover:scale-125 transition-transform">+</span>
                                <span className="text-[9px] font-bold mt-2 uppercase">Add Slot</span>
                            </button>
                        )}
                    </div>
                    <input
                        suppressHydrationWarning
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                        onChange={handleFileChange}
                        accept="image/*"
                    />
                </section>

                {error && <div className="p-5 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl">⚠️ {error}</div>}
                {success && <div className="p-5 bg-green-50 border border-green-100 text-green-600 text-xs font-bold rounded-xl">✅ Sync complete. Redirecting...</div>}

                <footer className="flex flex-col sm:flex-row gap-4 pt-10">
                    <button
                        suppressHydrationWarning
                        type="submit"
                        disabled={submitting}
                        className="flex-1 py-5 bg-gray-900 dark:bg-white dark:text-gray-900 text-white font-bold text-sm uppercase tracking-widest rounded-2xl hover:bg-black transition-all shadow-xl shadow-gray-200"
                    >
                        {submitting ? 'COMMITTING CHANGES...' : 'COMMIT DATABASE OVERWRITE'}
                    </button>
                    <button
                        suppressHydrationWarning
                        type="button"
                        onClick={() => router.back()}
                        className="px-10 py-5 bg-white dark:bg-gray-800 text-gray-500 font-bold text-sm uppercase rounded-2xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 transition-all"
                    >
                        CANCEL
                    </button>
                </footer>
            </form>
        </div>
    );
}
