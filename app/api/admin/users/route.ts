import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/token';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';

export async function GET(request: Request) {
    try {
        // Get access token from cookies
        const cookiesHeader = request.headers.get('cookie') || '';
        const tokenMatch = cookiesHeader.match(/accessToken=([^;]+)/);

        if (!tokenMatch) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const token = tokenMatch[1];
        const decoded = verifyAccessToken(token) as { userId?: string; roles?: string[]; role?: string } | null;

        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        const currentUser = await User.findById(decoded.userId);

        // Check if user is admin (supports new roles array + virtual role)
        const roles: string[] = currentUser?.roles || [];
        const primaryRole = currentUser?.role || (roles[0] ?? null);
        const isAdmin = primaryRole === 'ADMIN' || roles.includes('ADMIN');

        if (!currentUser || !isAdmin) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        // Fetch all users (excluding passwords and refresh token arrays)
        const users = await User.find({})
            .select('-password')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            users,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
