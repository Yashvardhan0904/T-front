import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RoleSwitcher from '@/components/shared/RoleSwitcher';

export default function UserMenu() {
    const { user, loading, logout } = useAuth() as any;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const router = useRouter();

    async function handleLogout() {
        await logout();
        setDropdownOpen(false);
        router.push('/login');
    }

    if (loading) {
        return (
            <div className="px-4 py-2 text-gray-400">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <Link
                href="/login"
                className="px-4 py-2 border-2 border-amber-500 text-amber-600 rounded-lg font-semibold hover:bg-amber-50 transition"
            >
                Login
            </Link>
        );
    }

    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition"
            >
                <span className="hidden sm:inline">{user.name}</span>
                <span className="sm:hidden">{user.name.split(' ')[0]}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {dropdownOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border z-20">
                        <div className="px-4 py-3 border-b">
                            <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                            <Link
                                href="/profile"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Profile
                            </Link>
                            <Link
                                href="/dashboard"
                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                onClick={() => setDropdownOpen(false)}
                            >
                                Dashboard
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                                Logout
                            </button>
                        </div>
                        <RoleSwitcher />
                    </div>
                </>
            )}
        </div>
    );
}
