import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import { authorizeApp } from '@/lib/auth/authorizeApp';

export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        // Base query for customers: Only active, approved, and not deleted
        const query: any = {
            isActive: true,
            isApproved: true,
            isVisible: true,
            deletedAt: null,
        };

        // If category is provided and not 'All'
        if (category && category !== 'All') {
            query.category = category;
        }

        // If search is provided
        if (search) {
            query.$text = { $search: search };
        }

        // Check if admin is requesting (to see everything) - Optional Auth
        const authHeader = request.headers.get("authorization");
        const cookies = request.headers.get("cookie");
        const hasToken = authHeader || (cookies && cookies.includes("accessToken="));

        if (hasToken) {
            const { authorized, payload } = await authorizeApp(request, ["admin:read"]);
            if (authorized && (payload?.role === 'ADMIN' || payload?.roles?.includes('ADMIN'))) {
                // Admin can see everything, let's remove strict filters
                delete query.isActive;
                delete query.isApproved;
                delete query.isVisible;
                delete query.deletedAt;

                // But they might still want to filter by category/search
                if (category && category !== 'All') query.category = category;
                if (search) query.$text = { $search: search };
            }
        }

        const products = await Product.find(query)
            .populate('seller', 'name email roles')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            products,
        });
    } catch (error: any) {
        console.error('Fetch products error:', error);
        return NextResponse.json({
            success: false,
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

