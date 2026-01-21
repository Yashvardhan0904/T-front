import AdminProductEditForm from '@/components/forms/AdminProductEditForm';
import Link from 'next/link';

export const metadata = {
    title: 'Edit Product | Admin Control',
};

export default function AdminEditPage({ params }: { params: { id: string } }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link
                            href="/admin/products"
                            className="text-amber-600 hover:text-amber-700 font-medium flex items-center mb-2"
                        >
                            <span className="mr-2">←</span> Back to Inventory
                        </Link>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Edit Product Logic
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            ID: {params.id}
                        </p>
                    </div>
                </div>

                <AdminProductEditForm productId={params.id} />
            </div>
        </div>
    );
}
