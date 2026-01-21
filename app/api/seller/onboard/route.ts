import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';
import Seller from '@/lib/mongodb/models/Seller';
import { verifyAccessToken } from '@/lib/auth/token';

/**
 * Seller Onboarding API
 * Creates a new seller profile and updates user role
 */
export async function POST(request: Request) {
    try {
        // Get auth token
        const cookieStore = await cookies();
        const token = cookieStore.get('accessToken')?.value;

        if (!token) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Verify token and get user ID
        const decoded = verifyAccessToken(token) as { userId: string } | null;
        if (!decoded || !decoded.userId) {
            return NextResponse.json(
                { success: false, message: 'Invalid token' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            storeName,
            storeDescription,
            contactEmail,
            contactPhone,
            accountName,
            accountNumber,
            bankName,
            ifscCode,
        } = body;

        // Validate required fields
        if (!storeName || !contactEmail || !contactPhone || !accountName || !accountNumber || !bankName || !ifscCode) {
            return NextResponse.json(
                { success: false, message: 'Missing required fields' },
                { status: 400 }
            );
        }

        await connectDB();

        let sellerRecord;

        // Check if seller profile already exists for this user
        const existingSeller = await Seller.findOne({ user: decoded.userId });

        if (existingSeller) {
            // If the application was REJECTED, we allow the user to overwrite it (Re-apply)
            if (existingSeller.status === 'REJECTED') {
                console.log(`🔄 User ${decoded.userId} is re-applying after rejection.`);

                // Update existing profile with new details
                existingSeller.storeName = storeName;
                existingSeller.storeDescription = storeDescription || '';
                existingSeller.contactEmail = contactEmail;
                existingSeller.contactPhone = contactPhone;
                existingSeller.bankDetails = {
                    accountName,
                    accountNumber,
                    bankName,
                    ifscCode: ifscCode.toUpperCase(),
                };
                existingSeller.status = 'RESUBMITTED';
                existingSeller.isApproved = false;
                existingSeller.isActive = false;

                // Track resubmission count if needed or just update timestamps
                existingSeller.updatedAt = new Date();

                sellerRecord = await existingSeller.save();
            } else {
                // Otherwise, block duplicate
                return NextResponse.json(
                    { success: false, message: 'Seller profile already exists', status: existingSeller.status },
                    { status: 409 } // Conflict
                );
            }
        } else {
            // Create new seller profile
            sellerRecord = await Seller.create({
                user: decoded.userId,
                storeName,
                storeDescription: storeDescription || '',
                contactEmail,
                contactPhone,
                bankDetails: {
                    accountName,
                    accountNumber,
                    bankName,
                    ifscCode: ifscCode.toUpperCase(),
                },
                status: 'PENDING',
            });
        }

        // DEFERRED: Role assignment (SELLER) should ONLY happen in the Admin Approval API
        // We only link the profile ID here for reference
        await User.updateOne(
            { _id: decoded.userId },
            {
                $set: { sellerProfileId: sellerRecord._id }
            }
        );

        console.log(`✅ Seller profile created/updated for user ${decoded.userId}`);

        // Fetch updated user for token generation
        const updatedUser = await User.findById(decoded.userId);

        // Generate new tokens with updated role
        const { createAccessToken } = await import('@/lib/auth/token');
        const { setAuthCookies } = await import('@/lib/auth/cookies');

        const accessToken = createAccessToken(updatedUser);

        const response = NextResponse.json({
            success: true,
            message: 'Seller profile created successfully',
            sellerId: sellerRecord?._id,
        });

        // Set updated cookies
        setAuthCookies(response, accessToken);

        return response;
    } catch (error) {
        console.error('Seller onboarding error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}
