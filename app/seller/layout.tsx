import AuthContextProvider from "@/context/AuthContext";
import SellerSidebar from "@/components/layout/SellerSidebar";

export const metadata = {
    title: "Seller Hub - Trendora",
    description: "Manage your store, products, and orders",
};

/**
 * Seller Layout
 * Wraps all /seller/* pages with seller-specific sidebar navigation
 */
export default function SellerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-950">
            <SellerSidebar />
            <main className="flex-1 lg:ml-64 p-4 sm:p-6 sm:pl-6 pl-16 transition-all">
                {children}
            </main>
        </div>
    );
}
