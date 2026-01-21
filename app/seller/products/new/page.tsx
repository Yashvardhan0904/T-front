import ProductUploadForm from '@/components/forms/ProductUploadForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Add New Product | Trendora Seller Hub',
    description: 'Upload new products to your store listing.',
};

export default function NewProductPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Product Staging
                    </h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Fill in the details below to stage your product for ML verification and publishing.
                    </p>
                </div>

                <ProductUploadForm />
            </div>
        </div>
    );
}
