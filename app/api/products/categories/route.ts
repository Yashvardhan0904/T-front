import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';

export async function GET() {
    try {
        await connectDB();
        const categories = await Product.distinct('category', {
            isActive: true,
            isApproved: true,
            deletedAt: null
        });

        return NextResponse.json({
            success: true,
            categories: ['All', ...categories],
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
