'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    Package,
    ClipboardList,
    BarChart,
    Settings,
    Plus,
    Home,
    Sun,
    Moon,
    LogOut,
    Menu,
    X
} from 'lucide-react';

// Seller sidebar navigation links
const sellerLinks = [
    { href: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/seller/products', label: 'Products', icon: Package },
    { href: '/seller/products/new', label: 'Add Product', icon: Plus },
    { href: '/seller/orders', label: 'Orders', icon: ClipboardList },
    { href: '/seller/analytics', label: 'Analytics', icon: BarChart },
    { href: '/seller/settings', label: 'Settings', icon: Settings },
];

export default function SellerSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout, isVerifiedSeller, isPendingSeller, isRejectedSeller } = useAuth() as any;
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [isOpen, setIsOpen] = useState(false); // Default closed on mobile/init

    useEffect(() => {
        setMounted(true);
        const dark = localStorage.getItem('theme') === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
    }, []);

    const toggleDarkMode = () => {
        const newDark = !isDark;
        setIsDark(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
        document.documentElement.classList.toggle('dark', newDark);
    };

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    if (!mounted || !user) return null;

    return (
        <>
            {/* Toggle Button when collapsed or on mobile */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-50 w-12 h-12 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95"
                    aria-label="Open seller menu"
                >
                    <Menu className="w-6 h-6" />
                </button>
            )}

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 h-full z-50
                    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                    transition-transform duration-300 ease-in-out w-64
                    ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${isOpen ? 'shadow-2xl lg:shadow-none' : ''}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <Link href="/seller/dashboard" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
                            <div>
                                <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Trendora</span>
                                <span className="block text-xs text-amber-600 dark:text-amber-400 font-medium">Seller Hub</span>
                                <span className="block text-[10px] text-gray-400 truncate max-w-[120px]">{user?.email}</span>
                            </div>
                        </Link>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            aria-label="Close menu"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-3 overflow-y-auto custom-scrollbar">
                        <div className="space-y-1">
                            {isVerifiedSeller ? (
                                sellerLinks.map((link) => {
                                    const isActive = pathname === link.href || pathname.startsWith(link.href + '/');
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`
                                                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                                ${isActive
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                                                }
                                            `}
                                        >
                                            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                            <span>{link.label}</span>
                                        </Link>
                                    );
                                })
                            ) : (isPendingSeller || isRejectedSeller) ? (
                                <div className="px-3 py-4 text-sm text-gray-500 italic">
                                    {isPendingSeller ? 'Application Pending Verification' : 'Application Rejected'}
                                </div>
                            ) : null}

                            {/* Back to Store */}
                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800">
                                <Link
                                    href="/"
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
                                >
                                    <Home className="w-4 h-4" />
                                    <span>Back to Store</span>
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/* Bottom Section */}
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
