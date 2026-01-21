import { NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/token';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';
import '@/lib/mongodb/models/Product'; // Register Product model for populate
import '@/lib/mongodb/models/Address'; // Register Address model for populate
import { cookies } from 'next/headers';

// Type definition for the decoded JWT payload
interface DecodedToken {
    userId: string;
    email: string;
    name: string;
    iat?: number;
    exp?: number;
    iss?: string;
    aud?: string;
}

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        console.log(`🔍 GET /api/user/me - accessToken: ${token ? "✅ present" : "❌ missing"}`);

        if (!token) {
            console.error("❌ No accessToken found");
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            );
        }

        const decoded = verifyAccessToken(token) as DecodedToken | null;
        console.log(`🔍 Token verification: ${decoded ? "✅ success" : "❌ failed"}`);

        if (!decoded) {
            console.error("❌ Invalid token");
            return NextResponse.json(
                { success: false, error: 'Invalid token' },
                { status: 401 }
            );
        }

        await connectDB();
        let user = await User.findById(decoded.userId)
            .select('-password')
            .populate('wishlist')
            .populate('addresses')
            .lean() as any;

        // DUAL AWARENESS: If not found in 'customer', check legacy 'users'
        if (!user) {
            console.log(`🔍 User ID ${decoded.userId} not found in 'customer', checking legacy 'users'...`);
            const mongooseInstance = await connectDB();
            if (mongooseInstance.connection.db) {
                user = await mongooseInstance.connection.db.collection('users').findOne({
                    _id: typeof decoded.userId === 'string' ? new mongooseInstance.Types.ObjectId(decoded.userId) : decoded.userId
                }) as any;

                if (user) {
                    console.log(`🚀 Found active session for ${user.email} in legacy 'users' collection.`);
                    // We don't migrate here to keep GET requests idempotent/safe,
                    // migration happens on the next Login or we can just leave it.
                }
            }
        }

        if (!user) {
            console.error(`❌ User not found in either collection: ${decoded.userId}`);
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        console.log(`✅ User found: ${user.email}, Role: ${user.role}`);

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id,
                id: user._id, // Providing both for compatibility
                name: user.name,
                email: user.email,
                avatar: user.avatar,
                role: user.role || (user.roles && user.roles.length > 0 ? user.roles[0] : "CUSTOMER"),
                roles: user.roles || ["CUSTOMER"],
                wishlist: user.wishlist,
                addresses: user.addresses,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
