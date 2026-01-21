import { type Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthContextProvider from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import Sidebar from '@/components/layout/sidebar';
import MainContent from '@/components/shared/MainContent';

const inter = Inter({
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
});

export const metadata: Metadata = {
  title: "Trendora - AI Shopping Assistant",
  description: "Shop smarter with AI-powered recommendations",
  // SEO optimizations
  keywords: ['shopping', 'e-commerce', 'AI', 'products', 'online store'],
  authors: [{ name: 'Trendora' }],
  openGraph: {
    title: 'Trendora - AI Shopping Assistant',
    description: 'Shop smarter with AI-powered recommendations',
    type: 'website',
  },
};

// Web Vitals reporting
export function reportWebVitals(metric: any) {
  if (process.env.NODE_ENV === 'production') {
    // Send to analytics
    console.log(metric);
    // Example: Send to analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(metric) });
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-100 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased`}>
        <AuthContextProvider>
          <ToastProvider>
            <div className="flex min-h-screen overflow-y-auto">
              <Sidebar />
              <MainContent>{children}</MainContent>
            </div>
          </ToastProvider>
        </AuthContextProvider>
      </body>
    </html>
  );
}
