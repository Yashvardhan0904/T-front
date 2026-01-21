'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { useSidebarStore } from '@/store/sidebar-store';
import { useCartStore } from '@/store/cart-store';
import { useAuth } from '@/context/AuthContext';
import {
    Home,
    MessageSquare,
    ShoppingBag,
    ShoppingCart,
    Package,
    User,
    Brain,
    Heart,
    Flame,
    MapPin,
    Star,
    Store,
    LayoutDashboard,
    Shield,
    Sun,
    Moon,
    LogOut,
    LogIn,
    Menu,
    X,
    Plus
} from 'lucide-react';

// User sidebar links - shown to regular users
const userLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/chat', label: 'Chats', icon: MessageSquare },
    { href: '/products', label: 'Shop', icon: ShoppingBag },
    { href: '/cart', label: 'Cart', icon: ShoppingCart, showBadge: true },
    { href: '/orders', label: 'Orders', icon: Package },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/profile/ai-memory', label: 'AI DNA', icon: Brain },
    { href: '/wishlist', label: 'Wishlist', icon: Heart },
    { href: '/products?trending=true', label: 'Trending', icon: Flame },
    { href: '/track-order', label: 'Track Order', icon: MapPin },
    { href: '/premium', label: 'Premium', icon: Star },
];

// Seller-specific link for users who aren't sellers yet
const becomeSellerLink = { href: '/seller/onboarding', label: 'Become Seller', icon: Store };

// Link for existing sellers to access dashboard
const sellerDashboardLink = { href: '/seller/dashboard', label: 'Seller Dashboard', icon: LayoutDashboard };

// Admin-specific link
const adminPanelLink = { href: '/admin', label: 'Admin Panel', icon: Shield };

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, isMobileOpen, toggle, toggleMobile, closeMobile, setOpen } = useSidebarStore();
    const cartCount = useCartStore((s) => s.itemCount());
    const { user, logout, isSeller, isAdmin, isVerifiedSeller, isPendingSeller, isRejectedSeller } = useAuth() as any;
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Check if we're on the home page
    const isHomePage = pathname === '/';

    // Initialize theme from localStorage
    useEffect(() => {
        setMounted(true);
        const dark = localStorage.getItem('theme') === 'dark';
        setIsDark(dark);
        document.documentElement.classList.toggle('dark', dark);
    }, []);

    // Force sidebar open on home page
    useEffect(() => {
        if (isHomePage && !isOpen) {
            setOpen(true);
        }
    }, [isHomePage, isOpen, setOpen]);

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

    // Don't render until mounted (hydration safety)
    if (!mounted) return null;

    // Sidebar visible for all users now
    // if (!user) return null;

    // Determine if sidebar should be visible
    const isDashboardRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin');
    const sidebarVisible = !isDashboardRoute && (isHomePage || isOpen || isMobileOpen);

    return (
        <>
            {/* Mobile Overlay - shown when mobile menu is open */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Toggle Button - shown when sidebar is collapsed (or always on mobile on Home page) */}
            <button
                onClick={() => {
                    if (window.innerWidth < 1024) {
                        toggleMobile();
                    } else if (!isHomePage) {
                        toggle();
                    }
                }}
                className={`
                    fixed top-4 left-4 z-50 w-10 h-10 
                    bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 
                    rounded-lg flex items-center justify-center 
                    text-gray-600 dark:text-gray-300 shadow-sm 
                    hover:bg-gray-50 dark:hover:bg-gray-800 transition-all active:scale-95
                    ${isOpen ? 'lg:opacity-0 lg:pointer-events-none' : 'lg:opacity-100 lg:pointer-events-auto'}
                    ${isMobileOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'}
                `}
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Sidebar */}
            <aside
                className={`
                    fixed left-0 top-0 h-full z-50
                    bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
                    transition-transform duration-300 ease-in-out
                    w-64
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    ${sidebarVisible && !isMobileOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
                `}
            >
                <div className="flex flex-col h-full">
                    {/* Logo and Close Button */}
                    <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3" onClick={closeMobile}>
                            <Image src="/logo.png" alt="Logo" width={32} height={32} className="rounded-lg" />
                            <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">Trendora</span>
                        </Link>
                        {/* Only show close button on non-home pages */}
                        {!isHomePage && (
                            <button
                                onClick={() => {
                                    if (window.innerWidth < 1024) {
                                        closeMobile();
                                    } else {
                                        toggle();
                                    }
                                }}
                                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 p-3 overflow-y-auto scrollbar-hide">
                        <div className="space-y-1">
                            {userLinks.map((link) => {
                                const isActive = pathname === link.href ||
                                    (link.href !== '/' && pathname.startsWith(link.href.split('?')[0]));
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={closeMobile}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive
                                                ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                                        <span>{link.label}</span>
                                        {link.showBadge && cartCount > 0 && (
                                            <span className="ml-auto px-2 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded-full">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>
                                );
                            })}

                            {/* Role-specific links (Admin/Seller) */}
                            <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                                {isAdmin && (
                                    <Link
                                        href={adminPanelLink.href}
                                        onClick={closeMobile}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${pathname.startsWith('/admin')
                                                ? 'bg-purple-50 dark:bg-purple-900/10 text-purple-600 dark:text-purple-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        <adminPanelLink.icon className="w-4 h-4" />
                                        <span>{adminPanelLink.label}</span>
                                    </Link>
                                )}

                                {isSeller && (
                                    <Link
                                        href={sellerDashboardLink.href}
                                        onClick={closeMobile}
                                        className={`
                                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                            ${pathname.startsWith('/seller')
                                                ? 'bg-amber-50 dark:bg-amber-900/10 text-amber-600 dark:text-amber-400'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200'
                                            }
                                        `}
                                    >
                                        <sellerDashboardLink.icon className="w-4 h-4" />
                                        <span>{sellerDashboardLink.label}</span>
                                    </Link>
                                )}

                                {!isSeller && !isAdmin && (
                                    <Link
                                        href={becomeSellerLink.href}
                                        onClick={closeMobile}
                                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
                                    >
                                        <becomeSellerLink.icon className="w-4 h-4" />
                                        <span>{becomeSellerLink.label}</span>
                                    </Link>
                                )}
                            </div>

                            {/* [NEW] Chat History Section - Shows for ALL users */}
                            <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center justify-between px-3 mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">Your Chats</span>
                                    <Link
                                        href="/chat"
                                        onClick={closeMobile}
                                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold flex items-center gap-1"
                                    >
                                        <Plus className="w-3 h-3" /> NEW
                                    </Link>
                                </div>
                                <Suspense fallback={<div className="px-3 py-2 text-[10px] text-gray-400">Loading...</div>}>
                                    <ChatHistoryList closeMobile={closeMobile} pathname={pathname} />
                                </Suspense>
                            </div>

                        </div>
                    </nav>

                    {/* Bottom Section - Dark Mode & Auth */}
                    <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
                        </button>

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Logout</span>
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                onClick={closeMobile}
                                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
                            >
                                <LogIn className="w-4 h-4" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
}

function ChatHistoryList({ closeMobile, pathname }: { closeMobile: () => void, pathname: string }) {
    const [sessions, setSessions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const searchParams = useSearchParams();
    const chatId = searchParams.get('id');

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                // Get guest ID if not logged in
                let userId = '';
                // Since this is a client component, we use sessionStorage
                if (typeof window !== 'undefined') {
                    userId = sessionStorage.getItem('antigravity_userId') || '';
                }

                const res = await fetch('/api/chats', {
                    headers: {
                        'x-user-id': userId
                    }
                });
                const data = await res.json();
                if (data.success) {
                    setSessions(data.sessions);
                }
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [pathname, chatId]); // Refresh when navigating or when a new chat starts (chatId changes)

    if (loading) {
        return (
            <div className="px-3 py-2 space-y-2 opacity-50">
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-full"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse w-3/4"></div>
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="px-3 py-2 text-[10px] text-gray-400 dark:text-gray-600 italic">
                No recent conversations.
            </div>
        );
    }

    return (
        <div className="space-y-0.5 max-h-[450px] overflow-y-auto px-1 py-1 scrollbar-hide">
            {sessions.map((session) => {
                const sessionId = session._id.toString();
                const href = `/chat?id=${sessionId}`;
                const isActive = chatId === sessionId;
                return (
                    <Link
                        key={sessionId}
                        href={href}
                        onClick={closeMobile}
                        className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-colors group
                            ${isActive
                                ? 'bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 font-medium'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                            }
                        `}
                    >
                        <MessageSquare className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100" />
                        <span className="truncate flex-1">{session.title}</span>
                    </Link>
                );
            })}
        </div>
    );
}
