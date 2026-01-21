'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
    const { user, loading: authLoading, isAuthenticated } = useAuth() as any;
    const router = useRouter();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push('/login?redirect=/profile');
        }
    }, [authLoading, isAuthenticated, router]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-amber-500"></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect via useEffect
    }

    return (
        <div className="min-h-screen p-6 lg:p-8">
            <div className="max-w-lg mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">My Profile</h1>

                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm p-6">
                    {/* Avatar */}
                    <div className="flex items-center gap-4 pb-6 mb-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="w-16 h-16 rounded-full bg-amber-500 flex items-center justify-center text-white text-xl font-bold">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div>
                            <h2 className="font-semibold text-gray-900 dark:text-white">{user?.name || 'User'}</h2>
                            <p className="text-sm text-gray-500">{user?.email || 'email@example.com'}</p>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wide">Name</label>
                            <div className="mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white text-sm">
                                {user?.name || 'Not set'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wide">Email</label>
                            <div className="mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white text-sm">
                                {user?.email || 'Not set'}
                            </div>
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 uppercase tracking-wide">Role</label>
                            <div className="mt-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-800 rounded-lg text-gray-900 dark:text-white text-sm capitalize">
                                {user?.role || 'User'}
                            </div>
                        </div>
                    </div>

                    <button className="mt-6 w-full py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-500 hover:border-amber-300 hover:text-amber-600 transition-colors">
                        Edit Profile
                    </button>
                </div>
            </div>
        </div>
    );
}
