'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

/**
 * Seller Onboarding Page
 * Multi-step form for users to become sellers
 */
export default function SellerOnboardingPage() {
    const router = useRouter();
    const {
        user,
        updateUser,
        isVerifiedSeller,
        isPendingSeller,
        isRejectedSeller,
        fetchSellerStatus,
        isSellerProfileLoaded,
        loading: authLoading
    } = useAuth() as any;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [checkingStatus, setCheckingStatus] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Store Info
        storeName: '',
        storeDescription: '',
        // Step 2: Contact
        contactEmail: user?.email || '',
        contactPhone: '',
        // Step 3: Bank Details
        accountName: '',
        accountNumber: '',
        bankName: '',
        ifscCode: '',
    });

    // Auto-poll for status updates when pending approval
    // MUST be before any early returns to satisfy React hooks rules
    useEffect(() => {
        if (isPendingSeller) {
            const interval = setInterval(async () => {
                await fetchSellerStatus();
            }, 10000); // Check every 10 seconds
            return () => clearInterval(interval);
        }
    }, [isPendingSeller, fetchSellerStatus]);

    // Redirect verified sellers to dashboard
    useEffect(() => {
        if (isVerifiedSeller) {
            router.push('/seller/dashboard');
        }
    }, [isVerifiedSeller, router]);

    const handleCheckStatus = async () => {
        setCheckingStatus(true);
        await fetchSellerStatus();
        setCheckingStatus(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleNext = () => {
        setStep(step + 1);
    };

    const handleBack = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/seller/onboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (data.success) {
                // Enterprise update: fetch status from DB to ensure sync
                await fetchSellerStatus();
                router.push('/seller/onboarding'); // Redirect to self to show "Pending" screen
            } else if (response.status === 409) {
                // Profile already exists, sync status and let state machine handle redirect
                await fetchSellerStatus();
            } else {
                setError(data.message || 'Failed to complete onboarding');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (authLoading || (user && !isSellerProfileLoaded)) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    // Not logged in
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
                    <p className="text-gray-500 mb-4">You need to be logged in to become a seller.</p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    // Verified seller - redirect handled by useEffect above
    if (isVerifiedSeller) {
        return null;
    }

    if (isPendingSeller) {

        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center">
                    <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        ⏳
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Under Review</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Thank you for applying to be a seller at Trendora! Our team is currently reviewing your business details. You will receive an email once your shop is verified.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">
                        Status auto-checks every 10 seconds
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleCheckStatus}
                            disabled={checkingStatus}
                            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            {checkingStatus ? 'Checking...' : '🔄 Check Status Now'}
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                        >
                            Return to Shop
                        </button>
                    </div>
                </div>
            </div>
        );
    }


    // For REJECTED status, show rejection screen with an option to edit
    if (isRejectedSeller && step === 1 && !formData.storeName) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-950">
                <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm text-center">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
                        ❌
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Application Rejected</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        We regret to inform you that your seller application has been rejected at this time. This may be due to incomplete documentation or business model misalignment.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => {
                                // Just start the form steps
                                setStep(1);
                                // Initialize form with some values from state or let user re-type
                                setFormData({
                                    ...formData,
                                    storeName: user?.storeName || '',
                                });
                            }}
                            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold transition-all shadow-lg shadow-amber-500/20"
                        >
                            Modify & Re-apply
                        </button>
                        <button
                            onClick={() => router.push('/')}
                            className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold transition-all"
                        >
                            Go Home
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100 dark:bg-gray-950">
            <div className="w-full max-w-lg">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Become a Seller</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Complete your seller profile in 3 easy steps</p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-2 mb-8">
                    {[1, 2, 3].map((num) => (
                        <div key={num} className="flex items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= num
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                {num}
                            </div>
                            {num < 3 && (
                                <div className={`w-12 h-1 ${step > num ? 'bg-amber-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                    {/* Step 1: Store Info */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Store Information</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Name *</label>
                                <input
                                    type="text"
                                    name="storeName"
                                    value={formData.storeName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Your store name"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Store Description</label>
                                <textarea
                                    name="storeDescription"
                                    value={formData.storeDescription}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Tell customers about your store..."
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                                />
                            </div>
                            <button
                                onClick={handleNext}
                                disabled={!formData.storeName}
                                className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                            >
                                Continue
                            </button>
                        </div>
                    )}

                    {/* Step 2: Contact */}
                    {step === 2 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Contact Information</h2>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact Email *</label>
                                <input
                                    type="email"
                                    name="contactEmail"
                                    value={formData.contactEmail}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    value={formData.contactPhone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+91 XXXXXXXXXX"
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={!formData.contactEmail || !formData.contactPhone}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                                >
                                    Continue
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Bank Details */}
                    {step === 3 && (
                        <div className="space-y-5">
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Bank Details</h2>
                            <p className="text-sm text-gray-500">For receiving payouts from your sales</p>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Holder Name *</label>
                                <input
                                    type="text"
                                    name="accountName"
                                    value={formData.accountName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Number *</label>
                                    <input
                                        type="text"
                                        name="accountNumber"
                                        value={formData.accountNumber}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IFSC Code *</label>
                                    <input
                                        type="text"
                                        name="ifscCode"
                                        value={formData.ifscCode}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank Name *</label>
                                <input
                                    type="text"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleBack}
                                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading || !formData.accountName || !formData.accountNumber || !formData.bankName || !formData.ifscCode}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                                >
                                    {loading ? 'Creating...' : 'Complete Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
