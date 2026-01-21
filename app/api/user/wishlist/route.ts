import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/token';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(token) as any;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
        }

        await connectDB();

        // Add to wishlist using $addToSet to prevent duplicates
        await User.findByIdAndUpdate(decoded.userId, {
            $addToSet: { wishlist: productId }
        });

        return NextResponse.json({ success: true, message: 'Added to wishlist' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { productId } = await request.json();

        if (!productId) {
            return NextResponse.json({ success: false, message: 'Product ID required' }, { status: 400 });
        }

        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const decoded = verifyAccessToken(token) as any;
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
        }

        await connectDB();

        await User.findByIdAndUpdate(decoded.userId, {
            $pull: { wishlist: productId }
        });

        return NextResponse.json({ success: true, message: 'Removed from wishlist' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
