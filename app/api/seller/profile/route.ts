import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb/mongodb';
import Seller from '@/lib/mongodb/models/Seller';
import { verifyAccessToken } from '@/lib/auth/token';

/**
 * /api/seller/profile
 * GET: Fetch current user's seller profile
 * PATCH: Update seller profile details
 */

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyAccessToken(token) as { userId: string } | null;
        if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });

        await connectDB();
        const seller = await Seller.findOne({ user: decoded.userId });

        if (!seller) {
            return NextResponse.json({ success: false, message: 'Seller profile not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, seller });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

        const decoded = verifyAccessToken(token) as { userId: string } | null;
        if (!decoded) return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { storeName, storeDescription, contactEmail, contactPhone, bankDetails } = body;

        await connectDB();
        const seller = await Seller.findOne({ user: decoded.userId });

        if (!seller) {
            return NextResponse.json({ success: false, message: 'Seller profile not found' }, { status: 404 });
        }

        // Update fields if provided
        if (storeName) seller.storeName = storeName;
        if (storeDescription !== undefined) seller.storeDescription = storeDescription;
        if (contactEmail) seller.contactEmail = contactEmail;
        if (contactPhone) seller.contactPhone = contactPhone;
        if (bankDetails) {
            seller.bankDetails = {
                ...seller.bankDetails,
                ...bankDetails
            };
        }

        await seller.save();

        return NextResponse.json({ success: true, message: 'Profile updated successfully', seller });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
