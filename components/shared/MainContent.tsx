'use client';

import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/sidebar-store';
import { useAuth } from '@/context/AuthContext';

/**
 * MainContent Wrapper
 * Adjusts left margin based on sidebar visibility
 * - On home page: always has margin (sidebar always visible)
 * - On other pages: margin depends on sidebar open/closed state
 */
export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isOpen = useSidebarStore((s) => s.isOpen);
    const { user, loading } = useAuth() as any;

    const isHomePage = pathname === '/';
    const isDashboardRoute = pathname.startsWith('/seller') || pathname.startsWith('/admin');

    // Sidebar is visible for everyone now, so guests also need margins on desktop
    const shouldHaveMargin = !isDashboardRoute && (isHomePage ? isOpen : isOpen);
    // Actually simpler: if it's open, it needs margin on LG screens.
    // On Home page, isOpen is forced to true in Sidebar component.

    return (
        <main
            className={`flex-1 min-h-screen overflow-y-auto transition-all ${shouldHaveMargin ? 'lg:ml-64' : 'lg:ml-0'}`}
        >
            {children}
        </main>
    );
}
