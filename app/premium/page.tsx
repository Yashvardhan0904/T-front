'use client';

import Link from 'next/link';

/**
 * Premium Page
 * Subscription/membership features
 */
export default function PremiumPage() {
    const plans = [
        {
            name: 'Basic',
            price: 0,
            period: 'Free',
            features: [
                'Access to all products',
                'Standard shipping',
                'Basic support',
            ],
            current: true,
        },
        {
            name: 'Premium',
            price: 299,
            period: '/month',
            features: [
                'Free shipping on all orders',
                'Early access to sales',
                'Priority customer support',
                'Exclusive member discounts',
                '5% cashback on purchases',
            ],
            recommended: true,
        },
        {
            name: 'Premium Plus',
            price: 999,
            period: '/year',
            features: [
                'All Premium benefits',
                'Free returns',
                'Personal shopping assistant',
                '10% cashback on purchases',
                'Exclusive VIP events',
            ],
        },
    ];

    return (
        <div className="min-h-screen p-4 lg:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">Trendora Premium</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
                        Unlock exclusive benefits and save more on every purchase with our premium membership plans.
                    </p>
                </div>

                {/* Plans */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative rounded-xl border p-6 ${plan.recommended
                                    ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-300 dark:border-amber-700'
                                    : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            {plan.recommended && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                    Recommended
                                </div>
                            )}

                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{plan.name}</h3>

                            <div className="flex items-baseline gap-1 mb-4">
                                {plan.price === 0 ? (
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">Free</span>
                                ) : (
                                    <>
                                        <span className="text-3xl font-bold text-gray-900 dark:text-white">₹{plan.price}</span>
                                        <span className="text-gray-500">{plan.period}</span>
                                    </>
                                )}
                            </div>

                            <ul className="space-y-3 mb-6">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="text-green-500">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <button
                                disabled={plan.current}
                                className={`w-full py-2.5 rounded-lg font-medium transition-colors ${plan.current
                                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
                                        : plan.recommended
                                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                            : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900'
                                    }`}
                            >
                                {plan.current ? 'Current Plan' : 'Get Started'}
                            </button>
                        </div>
                    ))}
                </div>

                {/* FAQ */}
                <div className="mt-12">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">Frequently Asked Questions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { q: 'Can I cancel anytime?', a: 'Yes, you can cancel your premium subscription at any time. No questions asked.' },
                            { q: 'When do benefits start?', a: 'Benefits start immediately after successful payment.' },
                            { q: 'Is there a free trial?', a: 'We offer a 7-day free trial for Premium plans.' },
                            { q: 'How does cashback work?', a: 'Cashback is credited to your wallet within 7 days of delivery.' },
                        ].map((faq) => (
                            <div key={faq.q} className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-4">
                                <p className="font-medium text-gray-900 dark:text-white mb-1">{faq.q}</p>
                                <p className="text-sm text-gray-500">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
