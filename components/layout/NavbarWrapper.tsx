'use client';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';

export default function NavbarWrapper() {
    const pathname = usePathname();

    // Hide navbar on auth pages
    const hideNavbar = pathname?.startsWith('/login') ||
        pathname?.startsWith('/create-account') ||
        pathname?.startsWith('/forget-password') ||
        pathname?.startsWith('/sign-up');

    if (hideNavbar) return null;

    return <Navbar />;
}
