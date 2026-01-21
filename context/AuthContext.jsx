'use client';

import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { useWishlistStore } from '@/store/wishlist-store';
import { useCartStore } from '@/store/cart-store';

// Create the Auth Context
const AuthContext = createContext(undefined);

// Auth utility removal: refresh logic no longer needed in access-only strategy

async function authFetchInternal(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        credentials: 'include',
    });

    // Check if token expired (via header or status from authorizeApp)
    if (response.status === 401) {
        // Clear local user state - session is definitively over in access-only model
        if (typeof window !== 'undefined') {
            localStorage.removeItem('user');
        }
        throw new Error('Session expired');
    }

    return response;
}

/**
 * AuthContextProvider - Manages authentication state globally
 * OPTIMIZED: Single fetch on mount, automatic token refresh
 */
export default function AuthContextProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sellerStatus, setSellerStatus] = useState(null); // 'PENDING', 'VERIFIED', 'REJECTED' or null
    const [isSellerProfileLoaded, setIsSellerProfileLoaded] = useState(false);

    // Single fetch on mount - verify session and restore user
    useEffect(() => {
        const initAuth = async () => {
            // First, try to restore from localStorage for instant UI
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    localStorage.removeItem('user');
                }
            }

            // Then verify session is still valid (in background)
            try {
                const response = await fetch('/api/user/me', {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        // Update with fresh data from server
                        setUser(data.user);
                        localStorage.setItem('user', JSON.stringify(data.user));

                        // Sync Wishlist from Server to Client Store
                        if (data.user.wishlist && Array.isArray(data.user.wishlist)) {
                            const serverWishlist = data.user.wishlist.map(item => ({
                                id: item._id || item.id,
                                name: item.name,
                                price: item.price,
                                image: item.images?.[0] || item.image,
                            }));
                            useWishlistStore.setState({ items: serverWishlist });
                        }

                        // Sync Cart from Server
                        useCartStore.getState().fetchCart();
                    }
                } else if (response.status === 401) {
                    // Session definitively expired, clear local state
                    setUser(null);
                    localStorage.removeItem('user');
                }
            } catch (error) {
                // Network error - keep local state, don't clear
                console.error('Failed to verify session:', error);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []); // Empty deps - only run once on mount

    /**
     * Login - Updates user state and persists to localStorage
     */
    const login = useCallback((userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    }, []);

    /**
     * Fetch seller status from API
     */
    const fetchSellerStatus = useCallback(async () => {
        try {
            const res = await fetch('/api/seller/status');
            if (res.ok) {
                const data = await res.json();
                setSellerStatus(data.isSeller ? data.status : null);
            } else {
                setSellerStatus(null);
            }
        } catch (error) {
            console.error('[DEBUG] Failed to fetch seller status:', error);
        } finally {
            setIsSellerProfileLoaded(true);
        }
    }, []);

    // Fetch seller status on mount if user exists, or when user changes
    useEffect(() => {
        if (user) {
            fetchSellerStatus();
        } else {
            setSellerStatus(null);
            setIsSellerProfileLoaded(false);
        }
    }, [user, fetchSellerStatus]);

    /**
     * Logout - Clears user state, localStorage, and server cookies
     */
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API call failed:', error);
        } finally {
            setUser(null);
            setSellerStatus(null);
            localStorage.removeItem('user');
        }
    }, []);

    /**
     * Update user - Partial updates (e.g., after becoming a seller)
     */
    const updateUser = useCallback((updates) => {
        setUser(prev => {
            const updated = { ...prev, ...updates };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    }, []);

    /**
     * Authenticated fetch - wraps fetch with automatic token refresh
     * Use this for all authenticated API calls
     */
    const authFetch = useCallback(async (url, options = {}) => {
        try {
            return await authFetchInternal(url, options);
        } catch (error) {
            // If session expired during fetch, clear user state
            if (error.message === 'Session expired') {
                setUser(null);
                setSellerStatus(null);
                localStorage.removeItem('user');
            }
            throw error;
        }
    }, []);

    // Computed role properties (Enterprise AGGREGATION)
    const userRoles = user?.roles || (user?.role ? [user.role] : ['CUSTOMER']);
    const intelligenceLevel = user?.intelligenceLevel || 'unsophisticated';

    // Check if user HAS any of these roles
    const isSeller = userRoles.some(r => r.toUpperCase() === 'SELLER') || !!sellerStatus;
    const isVerifiedSeller = sellerStatus === 'VERIFIED';
    const isPendingSeller = sellerStatus === 'PENDING';
    const isRejectedSeller = sellerStatus === 'REJECTED';
    const isAdmin = userRoles.some(r => r.toUpperCase() === 'ADMIN');
    const isCustomerCare = userRoles.some(r => r.toUpperCase() === 'CUSTOMER_CARE');

    // For single-role compatibility, expose primary role
    const role = isAdmin ? 'ADMIN' : (isSeller ? 'SELLER' : userRoles[0] || 'CUSTOMER');
    const isSophisticated = intelligenceLevel === 'sophisticated';

    const value = {
        user,
        loading,
        sellerStatus,
        fetchSellerStatus,
        isSellerProfileLoaded,
        login,
        logout,
        updateUser,
        authFetch, // Exposed for authenticated API calls
        isAuthenticated: !!user,
        role,
        intelligenceLevel,
        isSeller,
        isVerifiedSeller,
        isPendingSeller,
        isRejectedSeller,
        isAdmin,
        isCustomerCare,
        isSophisticated,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * useAuth Hook - Access auth context
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContextProvider');
    }
    return context;
};