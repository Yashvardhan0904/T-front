'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Admin Layout - Protects all admin routes
 * Redirects non-admin users to /not-authorized
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth() as { user: any; loading: boolean };
    const router = useRouter();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                // Not logged in - redirect to login
                router.push('/login');
            } else if (user.role?.toUpperCase() !== 'ADMIN') {
                // Logged in but not admin - redirect to not-authorized
                router.push('/not-authorized');
            }
        }
    }, [user, loading, router]);

    // Show loading state while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600 font-medium">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Don't render admin content for non-admin users
    if (!user || user.role?.toUpperCase() !== 'ADMIN') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
            {children}
        </div>
    );
}
