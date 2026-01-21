import Link from 'next/link';

export default function NotAuthorized() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4">
            <div className="max-w-md w-full text-center">
                {/* Icon */}
                <div className="mb-8">
                    <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                </div>

                {/* Content */}
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Access Denied
                </h1>
                <p className="text-gray-600 mb-2">
                    You do not have permission to access this page.
                </p>
                <p className="text-gray-500 text-sm mb-8">
                    This area is restricted to administrators only.
                </p>

                {/* Action Button */}
                <Link
                    href="/"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                    <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                    </svg>
                    Return to Home
                </Link>

                {/* Additional Info */}
                <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Need admin access?</span>
                        <br />
                        Contact your system administrator for assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}
