import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';
import Product from '@/lib/mongodb/models/Product';
import { authorizeApp } from '@/lib/auth/authorizeApp';

/**
 * POST /api/products/like
 * Toggle like on a product (add/remove from user's likedProducts, increment/decrement product.likeCount)
 */
export async function POST(request: Request) {
    try {
        await connectDB();

        const { productId } = await request.json();
        if (!productId) {
            return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 });
        }

        const { authorized, payload } = await authorizeApp(request, []);
        if (!authorized || !payload?.userId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const userId = payload.userId;

        // Check if product exists
        const product = await Product.findById(productId);
        if (!product) {
            return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
        }

        // Check if user has already liked this product
        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const alreadyLiked = user.likedProducts?.some((id: any) => id.toString() === productId);

        if (alreadyLiked) {
            // Unlike: Remove from user.likedProducts, decrement product.likeCount
            await User.findByIdAndUpdate(userId, { $pull: { likedProducts: productId } });
            await Product.findByIdAndUpdate(productId, { $inc: { likeCount: -1 } });

            return NextResponse.json({
                success: true,
                liked: false,
                likeCount: Math.max(0, (product.likeCount || 1) - 1)
            });
        } else {
            // Like: Add to user.likedProducts, increment product.likeCount
            await User.findByIdAndUpdate(userId, { $addToSet: { likedProducts: productId } });
            await Product.findByIdAndUpdate(productId, { $inc: { likeCount: 1 } });

            return NextResponse.json({
                success: true,
                liked: true,
                likeCount: (product.likeCount || 0) + 1
            });
        }
    } catch (error: any) {
        console.error('[Like API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

/**
 * GET /api/products/like?productId=xxx
 * Check if current user has liked a specific product
 */
export async function GET(request: Request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');

        if (!productId) {
            return NextResponse.json({ success: false, error: 'productId is required' }, { status: 400 });
        }

        const { authorized, payload } = await authorizeApp(request, []);
        if (!authorized || !payload?.userId) {
            // For non-logged-in users, just return the product's likeCount
            const product = await Product.findById(productId).select('likeCount');
            return NextResponse.json({
                success: true,
                liked: false,
                likeCount: product?.likeCount || 0
            });
        }

        const userId = payload.userId;
        const user = await User.findById(userId).select('likedProducts');
        const product = await Product.findById(productId).select('likeCount');

        const liked = user?.likedProducts?.some((id: any) => id.toString() === productId) || false;

        return NextResponse.json({
            success: true,
            liked,
            likeCount: product?.likeCount || 0
        });
    } catch (error: any) {
        console.error('[Like API] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
