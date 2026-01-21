import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import Seller from '@/lib/mongodb/models/Seller';
import User from '@/lib/mongodb/models/User';

// Force model registration
const _Seller = Seller;
const _User = User;

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> } // Correct type for Next.js 15+ App Router params
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }

        await connectDB();

        const product = await Product.findById(id)
            .populate({
                path: 'seller',
                select: 'storeName status isVerified logo',
                model: 'Seller'
            });

        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Return clean data
        return NextResponse.json({
            success: true,
            product
        });

    } catch (error: any) {
        console.error('Fetch Single Product Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
