'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/context/AuthContext';
import { Address } from '@/types';

/**
 * Checkout Page
 * Amazon-like checkout with step wizard
 * Steps: Address → Order Summary → Payment → Confirm
 */
export default function CheckoutPage() {
    const router = useRouter();
    const { user } = useAuth() as any;
    const cartItems = useCartStore((s) => s.items);
    const cartTotal = useCartStore((s) => s.total());
    const clearCart = useCartStore((s) => s.clearCart);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Step data
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: 'Home',
        fullName: user?.name || '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
    });

    // Mock saved addresses - replace with API
    const [savedAddresses] = useState<Address[]>([
        {
            id: '1',
            label: 'Home',
            fullName: 'John Doe',
            phone: '+91 9876543210',
            addressLine1: '123 Main Street',
            addressLine2: 'Apartment 4B',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
            isDefault: true,
        },
        {
            id: '2',
            label: 'Office',
            fullName: 'John Doe',
            phone: '+91 9876543211',
            addressLine1: 'Tech Park, Tower A',
            addressLine2: 'Floor 5',
            city: 'Bangalore',
            state: 'Karnataka',
            postalCode: '560001',
            country: 'India',
            isDefault: false,
        },
    ]);

    useEffect(() => {
        // Select default address
        const defaultAddr = savedAddresses.find(a => a.isDefault);
        if (defaultAddr) setSelectedAddress(defaultAddr);
    }, []);

    // Redirect if cart is empty
    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="text-center">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h1>
                    <p className="text-gray-500 mb-6">Add some products before checkout</p>
                    <button
                        onClick={() => router.push('/products')}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium"
                    >
                        Browse Products
                    </button>
                </div>
            </div>
        );
    }

    // Price calculations
    const subtotal = cartTotal;
    const shipping = subtotal > 500 ? 0 : 50;
    const tax = Math.round(subtotal * 0.18);
    const total = subtotal + shipping + tax;

    const handleAddAddress = () => {
        const addr: Address = {
            id: Date.now().toString(),
            ...newAddress,
            isDefault: savedAddresses.length === 0,
        };
        setSelectedAddress(addr);
        setShowAddressForm(false);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddress) {
            setError('Please select a delivery address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const orderData = {
                shippingAddress: selectedAddress,
                paymentMethod,
            };

            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await response.json();

            if (data.success || response.ok) {
                clearCart();
                router.push(`/checkout/success/${data.orderId || data.trackingNumber}`);
            } else {
                setError(data.message || 'Failed to place order');
            }
        } catch (err) {
            console.error(err);
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Checkout</h1>

                {/* Progress Steps */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 mb-6">
                    <div className="flex items-center justify-between">
                        {['Address', 'Order Summary', 'Payment', 'Confirm'].map((label, i) => (
                            <div key={label} className="flex items-center">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step > i + 1 ? 'bg-green-500 text-white' :
                                        step === i + 1 ? 'bg-amber-500 text-white' :
                                            'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                        }`}>
                                        {step > i + 1 ? '✓' : i + 1}
                                    </div>
                                    <span className={`text-xs mt-1 ${step === i + 1 ? 'text-amber-600 font-medium' : 'text-gray-500'}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < 3 && (
                                    <div className={`w-16 lg:w-24 h-1 mx-2 ${step > i + 1 ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg text-red-700 dark:text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Step 1: Address */}
                        {step === 1 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Delivery Address</h2>

                                <div className="space-y-3">
                                    {savedAddresses.map((addr) => (
                                        <div
                                            key={addr.id}
                                            onClick={() => setSelectedAddress(addr)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${selectedAddress?.id === addr.id
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-gray-900 dark:text-white">{addr.fullName}</span>
                                                        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                                                            {addr.label}
                                                        </span>
                                                        {addr.isDefault && (
                                                            <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/20 text-amber-600 rounded">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        {addr.city}, {addr.state} - {addr.postalCode}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">{addr.phone}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedAddress?.id === addr.id
                                                    ? 'border-amber-500 bg-amber-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {selectedAddress?.id === addr.id && <span className="text-white text-xs">✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add New Address */}
                                {!showAddressForm ? (
                                    <button
                                        onClick={() => setShowAddressForm(true)}
                                        className="mt-4 w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 transition-colors"
                                    >
                                        + Add New Address
                                    </button>
                                ) : (
                                    <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                                        <div className="grid grid-cols-2 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Full Name"
                                                value={newAddress.fullName}
                                                onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="Phone"
                                                value={newAddress.phone}
                                                onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Address Line 1"
                                            value={newAddress.addressLine1}
                                            onChange={(e) => setNewAddress({ ...newAddress, addressLine1: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Address Line 2 (Optional)"
                                            value={newAddress.addressLine2}
                                            onChange={(e) => setNewAddress({ ...newAddress, addressLine2: e.target.value })}
                                            className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                        />
                                        <div className="grid grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="State"
                                                value={newAddress.state}
                                                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                            <input
                                                type="text"
                                                placeholder="Postal Code"
                                                value={newAddress.postalCode}
                                                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                                                className="px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm"
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowAddressForm(false)}
                                                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddAddress}
                                                className="px-4 py-2 text-sm bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                                            >
                                                Use This Address
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep(2)}
                                    disabled={!selectedAddress}
                                    className="mt-6 w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-lg font-medium"
                                >
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* Step 2: Order Summary */}
                        {step === 2 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>

                                {/* Selected Address */}
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm text-gray-500">Delivering to:</span>
                                        <button onClick={() => setStep(1)} className="text-sm text-amber-600 hover:underline">Change</button>
                                    </div>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedAddress?.fullName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedAddress?.addressLine1}, {selectedAddress?.city}, {selectedAddress?.state} - {selectedAddress?.postalCode}
                                    </p>
                                </div>

                                {/* Items */}
                                <div className="space-y-3 mb-4">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                                                <span className="text-2xl">📦</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-medium text-gray-900 dark:text-white text-sm">{item.name}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="font-semibold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(3)} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">
                                        Continue to Payment
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Payment */}
                        {step === 3 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payment Method</h2>

                                <div className="space-y-3">
                                    {[
                                        { id: 'COD', name: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
                                        { id: 'UPI', name: 'UPI', icon: '📱', desc: 'Google Pay, PhonePe, Paytm' },
                                        { id: 'CARD', name: 'Credit/Debit Card', icon: '💳', desc: 'Visa, Mastercard, Rupay' },
                                        { id: 'NETBANKING', name: 'Net Banking', icon: '🏦', desc: 'All major banks' },
                                    ].map((method) => (
                                        <div
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === method.id
                                                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/10'
                                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="text-2xl">{method.icon}</span>
                                                <div className="flex-1">
                                                    <p className="font-medium text-gray-900 dark:text-white">{method.name}</p>
                                                    <p className="text-sm text-gray-500">{method.desc}</p>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === method.id
                                                    ? 'border-amber-500 bg-amber-500'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {paymentMethod === method.id && <span className="text-white text-xs">✓</span>}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setStep(2)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        Back
                                    </button>
                                    <button onClick={() => setStep(4)} className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium">
                                        Review Order
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Confirm */}
                        {step === 4 && (
                            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Order</h2>

                                {/* Address Summary */}
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Delivery Address</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedAddress?.fullName}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {selectedAddress?.addressLine1}, {selectedAddress?.city} - {selectedAddress?.postalCode}
                                    </p>
                                </div>

                                {/* Payment Summary */}
                                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4">
                                    <p className="text-xs text-gray-500 uppercase mb-1">Payment Method</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{paymentMethod}</p>
                                </div>

                                {/* Terms */}
                                <p className="text-xs text-gray-500 mb-4">
                                    By placing this order, you agree to our Terms of Service and Privacy Policy.
                                </p>

                                <div className="flex gap-3">
                                    <button onClick={() => setStep(3)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={loading}
                                        className="flex-1 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg font-medium"
                                    >
                                        {loading ? 'Placing Order...' : `Place Order • ₹${total.toLocaleString()}`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 sticky top-4">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Details</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal ({cartItems.length} items)</span>
                                    <span className="text-gray-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Shipping</span>
                                    <span className={shipping === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'}>
                                        {shipping === 0 ? 'FREE' : `₹${shipping}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Tax (18% GST)</span>
                                    <span className="text-gray-900 dark:text-white">₹{tax.toLocaleString()}</span>
                                </div>
                                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between">
                                    <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                                    <span className="font-bold text-lg text-gray-900 dark:text-white">₹{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {shipping === 0 && (
                                <div className="mt-4 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                                    <span className="text-sm text-green-600 dark:text-green-400">🎉 You saved ₹50 on shipping!</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
