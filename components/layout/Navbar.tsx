'use client';
import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import UserMenu from './UserMenu';
import { useAuth } from '@/context/AuthContext';
import { Shield, LayoutDashboard, Menu, X, Sparkles } from 'lucide-react';

export default function Navbar() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();
    const { user, isAdmin, isSeller, isSophisticated } = useAuth() as any;

    const links = [
        { href: '/', label: 'Home' },
        { href: '/chat', label: 'Chat' },
        { href: '/products', label: 'Products' },
        { href: '/cart', label: 'Cart' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                            Trendora
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive(link.href)
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Admin Panel Link */}
                        {(isAdmin || (isSophisticated && user?.role === 'ADMIN')) && (
                            <Link
                                href="/admin"
                                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 flex items-center"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Admin Panel
                            </Link>
                        )}

                        {/* Seller Dashboard Link */}
                        {(isSeller && !isAdmin) && (
                            <Link
                                href="/seller/dashboard"
                                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 flex items-center"
                            >
                                <LayoutDashboard className="w-4 h-4 mr-2" />
                                Seller Panel
                            </Link>
                        )}

                        <UserMenu />
                        <Link
                            href="/shop-ai"
                            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition transform hover:scale-105 flex items-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Shop with AI
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="text-gray-700 hover:text-gray-900 focus:outline-none"
                        >
                            {mobileOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.href)
                                    ? 'bg-gray-100 text-gray-900'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Admin Panel Link - Mobile */}
                        {(isAdmin || (isSophisticated && user?.role === 'ADMIN')) && (
                            <Link
                                href="/admin"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-semibold text-center flex items-center justify-center gap-2"
                            >
                                <Shield className="w-4 h-4" /> Admin Panel
                            </Link>
                        )}

                        {/* Seller Dashboard Link - Mobile */}
                        {(isSeller && !isAdmin) && (
                            <Link
                                href="/seller/dashboard"
                                onClick={() => setMobileOpen(false)}
                                className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold text-center flex items-center justify-center gap-2"
                            >
                                <LayoutDashboard className="w-4 h-4" /> Seller Panel
                            </Link>
                        )}

                        <div className="px-3 py-2">
                            <UserMenu />
                        </div>
                        <Link
                            href="/shop-ai"
                            onClick={() => setMobileOpen(false)}
                            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-center flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" /> Shop with AI
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
}
