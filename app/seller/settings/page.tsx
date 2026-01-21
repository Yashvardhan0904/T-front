'use client';

import { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useAuth } from '@/context/AuthContext';

const fetcher = (url: string) => fetch(url).then(res => res.json());

/**
 * Seller Settings Page
 * Store settings, bank details, and profile management
 */
export default function SellerSettingsPage() {
    const { user } = useAuth() as any;
    const { data: profileData, error: profileError, isLoading } = useSWR('/api/seller/profile', fetcher);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('store');

    const [storeFormData, setStoreFormData] = useState({
        storeName: '',
        description: '',
        contactEmail: '',
        contactPhone: '',
    });

    const [bankFormData, setBankFormData] = useState({
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
    });

    // Initialize form with real data when loaded
    useEffect(() => {
        if (profileData?.success && profileData.seller) {
            const seller = profileData.seller;
            setStoreFormData({
                storeName: seller.storeName || '',
                description: seller.storeDescription || '',
                contactEmail: seller.contactEmail || '',
                contactPhone: seller.contactPhone || '',
            });
            setBankFormData({
                accountName: seller.bankDetails?.accountName || '',
                accountNumber: seller.bankDetails?.accountNumber || '',
                bankName: seller.bankDetails?.bankName || '',
                ifscCode: seller.bankDetails?.ifscCode || '',
            });
        }
    }, [profileData]);

    if (isLoading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>;
    if (profileError || (profileData && !profileData.success)) return <div className="text-center py-20 text-red-500 font-medium">Failed to load seller profile.</div>;

    const handleStoreSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/seller/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    storeName: storeFormData.storeName,
                    storeDescription: storeFormData.description,
                    contactEmail: storeFormData.contactEmail,
                    contactPhone: storeFormData.contactPhone,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Store settings updated successfully!');
                mutate('/api/seller/profile');
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    const handleBankSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        try {
            const res = await fetch('/api/seller/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bankDetails: {
                        accountName: bankFormData.accountName,
                        accountNumber: bankFormData.accountNumber,
                        bankName: bankFormData.bankName,
                        ifscCode: bankFormData.ifscCode,
                    }
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMessage('Bank details updated successfully!');
                mutate('/api/seller/profile');
            } else {
                throw new Error(data.message);
            }
        } catch (error: any) {
            setMessage(`Error: ${error.message}`);
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(''), 5000);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your store settings</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-3 border rounded-lg text-sm ${message.startsWith('Error')
                    ? 'bg-red-100 border-red-300 text-red-700'
                    : 'bg-green-100 border-green-300 text-green-700'}`}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
                <button
                    onClick={() => setActiveTab('store')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'store'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Store Info
                </button>
                <button
                    onClick={() => setActiveTab('bank')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === 'bank'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    Bank Details
                </button>
            </div>

            {/* Store Settings Tab */}
            {activeTab === 'store' && (
                <form onSubmit={handleStoreSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name</label>
                        <input
                            type="text"
                            value={storeFormData.storeName}
                            onChange={(e) => setStoreFormData({ ...storeFormData, storeName: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                        <textarea
                            value={storeFormData.description}
                            onChange={(e) => setStoreFormData({ ...storeFormData, description: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email</label>
                            <input
                                type="email"
                                value={storeFormData.contactEmail}
                                onChange={(e) => setStoreFormData({ ...storeFormData, contactEmail: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Phone</label>
                            <input
                                type="tel"
                                value={storeFormData.contactPhone}
                                onChange={(e) => setStoreFormData({ ...storeFormData, contactPhone: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </form>
            )}

            {/* Bank Details Tab */}
            {activeTab === 'bank' && (
                <form onSubmit={handleBankSubmit} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 space-y-5">
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg text-yellow-700 dark:text-yellow-400 text-sm">
                        ⚠️ Bank details are used for payouts. Please ensure accuracy.
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name</label>
                        <input
                            type="text"
                            value={bankFormData.accountName}
                            onChange={(e) => setBankFormData({ ...bankFormData, accountName: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number</label>
                            <input
                                type="text"
                                value={bankFormData.accountNumber}
                                onChange={(e) => setBankFormData({ ...bankFormData, accountNumber: e.target.value })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code</label>
                            <input
                                type="text"
                                value={bankFormData.ifscCode}
                                onChange={(e) => setBankFormData({ ...bankFormData, ifscCode: e.target.value.toUpperCase() })}
                                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name</label>
                        <input
                            type="text"
                            value={bankFormData.bankName}
                            onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                    >
                        {loading ? 'Saving...' : 'Update Bank Details'}
                    </button>
                </form>
            )}
        </div>
    );
}
