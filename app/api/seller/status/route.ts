import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb/mongodb';
import Seller from '@/lib/mongodb/models/Seller';
import { verifyAccessToken } from '@/lib/auth/token';

/**
 * GET /api/seller/status
 * Single source of truth for seller status
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json(
                { isSeller: false, status: null },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token) as { userId: string } | null;
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { isSeller: false, status: null },
                { status: 401 }
            );
        }

        await connectDB();

        // Fetch all potential profiles for this user (Enterprise SHADOWING PROTECTION)
        const sellerProfiles = await Seller.find({ user: decoded.userId });

        if (!sellerProfiles || sellerProfiles.length === 0) {
            return NextResponse.json({
                isSeller: false,
                status: null,
                sellerProfileId: null
            });
        }

        // Priority pick: If any is VERIFIED, that's the one we return
        // Otherwise, pick the first one (likely PENDING or REJECTED)
        const activeProfile = sellerProfiles.find(p => p.status === 'VERIFIED') || sellerProfiles[0];

        return NextResponse.json({
            isSeller: true,
            status: activeProfile.status,
            sellerProfileId: activeProfile._id
        });
    } catch (error: any) {
        console.error('Seller status API error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
