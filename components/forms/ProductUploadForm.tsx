'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Camera, Check, AlertCircle } from 'lucide-react';

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

export default function ProductUploadForm() {
    const router = useRouter();
    const { user } = useAuth() as any;
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        price: '',
        description: '',
        category: 'tshirt',
        fabric: 'cotton',
        warmth_level: 'light',
        season: [] as string[],
        fit: 'regular',
        color: 'black',
        occasion: [] as string[],
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (name: 'season' | 'occasion', value: string) => {
        setFormData(prev => {
            const current = [...prev[name]];
            if (current.includes(value)) {
                return { ...prev, [name]: current.filter(item => item !== value) };
            } else {
                return { ...prev, [name]: [...current, value] };
            }
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            if (files.length > 5) {
                setError('You can only upload a maximum of 5 images.');
                e.target.value = '';
                setSelectedFiles([]);
                return;
            }
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const invalidFiles = files.filter(f => !allowedTypes.includes(f.type));
            if (invalidFiles.length > 0) {
                setError(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}. Only JPG and PNG allowed.`);
                e.target.value = '';
                setSelectedFiles([]);
                return;
            }
            setError(null);
            setSelectedFiles(files);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        if (selectedFiles.length < 1) {
            setError('Please upload at least one product image.');
            setLoading(false);
            return;
        }

        if (formData.season.length === 0) {
            setError('Please select at least one season.');
            setLoading(false);
            return;
        }

        if (formData.occasion.length === 0) {
            setError('Please select at least one occasion.');
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('productData', JSON.stringify({ ...formData, status: 'draft' }));
            selectedFiles.forEach(file => submitData.append('images', file));

            const response = await fetch('/api/seller/products', {
                method: 'POST',
                body: submitData,
            });

            const result = await response.json();

            if (result.success) {
                setSuccess(true);
                setTimeout(() => router.push('/seller/products'), 2000);
            } else {
                setError(result.message || 'Failed to upload product');
            }
        } catch (err: any) {
            setError('An error occurred during upload. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!isMounted) return null;

    if (success) {
        return (
            <div className="max-w-2xl mx-auto mt-10 p-12 bg-white dark:bg-gray-900 rounded-3xl border border-green-100 dark:border-green-900/30 text-center shadow-lg">
                <div className="flex justify-center mb-4">
                    <Check className="w-12 h-12 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Success!</h2>
                <p className="text-gray-500 dark:text-gray-400">Your product has been staged for review.</p>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-10 bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 mt-8 mb-20">
            <header className="mb-10 text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">New Product Listing</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Provide accurate details for better AI discovery and recommendations.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-12">
                {/* Visual Assets */}
                <section className="bg-gray-50 dark:bg-gray-800/30 p-8 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <label className="block text-sm font-bold text-gray-600 dark:text-gray-400 mb-4 uppercase tracking-wider">Product Images (1-5)</label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full py-16 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white dark:hover:bg-gray-800 transition-all group"
                    >
                        <Camera className="w-10 h-10 mb-4 opacity-40 group-hover:scale-110 transition-transform text-gray-600 dark:text-gray-300" />
                        <span className="text-sm font-bold text-gray-500">Click to upload JPG or PNG images</span>
                        <span className="text-[10px] text-gray-400 mt-1">High resolution recommended</span>
                        <input
                            suppressHydrationWarning
                            type="file"
                            ref={fileInputRef}
                            multiple
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {selectedFiles.length > 0 && (
                        <div className="mt-8 flex flex-wrap gap-4">
                            {selectedFiles.map((f, i) => (
                                <div key={i} className="relative w-24 h-24 bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm">
                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] text-gray-400 p-2 text-center break-all font-medium">{f.name}</div>
                                    <div className="absolute top-0 right-0 bg-gray-900 text-white text-[9px] px-2 py-1 font-bold">#{i + 1}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Primary Info */}
                    <section className="space-y-8">
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Product Title *</label>
                            <input
                                suppressHydrationWarning
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                placeholder="e.g. Classic Oversized Cotton Hoodie"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Brand Name *</label>
                                <input
                                    suppressHydrationWarning
                                    type="text"
                                    name="brand"
                                    required
                                    value={formData.brand}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                    placeholder="e.g. Trendora Retro"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Price (₹) *</label>
                                <input
                                    suppressHydrationWarning
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                                    placeholder="999"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Detailed Description *</label>
                            <textarea
                                suppressHydrationWarning
                                name="description"
                                required
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none h-40 resize-none transition-all"
                                placeholder="Describe the fit, material feel, and unique aesthetics for AI matching..."
                            />
                        </div>
                    </section>

                    {/* Metadata */}
                    <section className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Category</label>
                                <select
                                    suppressHydrationWarning
                                    title="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none cursor-pointer focus:border-amber-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                >
                                    {Object.entries(CATEGORY_GROUPS).map(([group, options]) => (
                                        <optgroup key={group} label={group}>
                                            {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Main Fabric</label>
                                <select
                                    suppressHydrationWarning
                                    title="Fabric"
                                    name="fabric"
                                    value={formData.fabric}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none cursor-pointer focus:border-amber-500 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%20fill%3D%27none%27%20viewBox%3D%270%200%2020%2020%27%3E%3Cpath%20stroke%3D%27%236b7280%27%20stroke-linecap%3D%27round%27%20stroke-linejoin%3D%27round%27%20stroke-width%3D%271.5%27%20d%3D%27m6%208%204%204%204-4%27%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                >
                                    {Object.entries(FABRIC_GROUPS).map(([group, options]) => (
                                        <optgroup key={group} label={group}>
                                            {options.map(opt => <option key={opt} value={opt}>{opt.toUpperCase()}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Warmth</label>
                                <select
                                    suppressHydrationWarning
                                    title="Warmth"
                                    name="warmth_level"
                                    value={formData.warmth_level}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {WARMTH_LEVELS.map(w => <option key={w} value={w}>{w.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Fit</label>
                                <select
                                    suppressHydrationWarning
                                    title="Fit"
                                    name="fit"
                                    value={formData.fit}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {FITS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">Color</label>
                                <select
                                    suppressHydrationWarning
                                    title="Color"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none"
                                >
                                    {COLORS.map(c => <option key={c} value={c}>{c.toUpperCase()}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-1">Seasonal Availability *</label>
                            <div className="flex flex-wrap gap-2">
                                {SEASONS.map(s => (
                                    <button
                                        suppressHydrationWarning
                                        key={s}
                                        type="button"
                                        onClick={() => handleCheckboxChange('season', s)}
                                        className={`px-5 py-3 text-[11px] font-bold rounded-xl border transition-all ${formData.season.includes(s)
                                            ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-black shadow-sm'
                                            : 'bg-white dark:bg-gray-900 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-amber-400 hover:text-amber-500'
                                            }`}
                                    >
                                        {s.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Multiselect - Comprehensive Occasions */}
                <section className="space-y-8 pt-6">
                    <div className="flex items-center gap-4">
                        <label className="block text-[13px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-widest">Target Occasions (Precise AI Identification) *</label>
                        <div className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-800"></div>
                    </div>
                    <div className="space-y-10">
                        {Object.entries(OCCASION_GROUPS).map(([group, options]) => (
                            <div key={group} className="space-y-4">
                                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em]">{group}</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {options.map(o => (
                                        <button
                                            suppressHydrationWarning
                                            key={o}
                                            type="button"
                                            onClick={() => handleCheckboxChange('occasion', o)}
                                            className={`px-5 py-2.5 text-[11px] font-bold rounded-xl border transition-all ${formData.occasion.includes(o)
                                                ? 'bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/20'
                                                : 'bg-gray-50/50 dark:bg-gray-800/50 text-gray-400 border-gray-100 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-800 hover:border-amber-300'
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

                {error && (
                    <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-[11px] font-bold flex items-center gap-3">
                        <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">!</span> {error}
                    </div>
                )}

                <footer className="pt-12">
                    <button
                        suppressHydrationWarning
                        type="submit"
                        disabled={loading}
                        className={`w-full py-5 rounded-2xl text-white font-bold text-lg shadow-xl shadow-amber-500/10 transition-all ${loading ? 'bg-gray-300 cursor-not-allowed' : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.99]'
                            }`}
                    >
                        {loading ? 'Processing Sync...' : 'Staging Product for AI Review'}
                    </button>
                </footer>
            </form>
        </div>
    );
}
