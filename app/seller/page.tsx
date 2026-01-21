import { redirect } from 'next/navigation';

// Redirect /seller to /seller/dashboard
export default function SellerPage() {
    redirect('/seller/dashboard');
}
