import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import User from '@/lib/mongodb/models/User';
import Seller from '@/lib/mongodb/models/Seller';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

function logAdminDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'admin-sellers-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[ADMIN-SELLERS] [${timestamp}] ${message}\n`);
    } catch (e) {
        // ignore
    }
}

/**
 * GET /api/admin/sellers
 * List all seller profiles for admin management
 */
export async function GET(request: Request) {
    try {
        await connectDB();

        logAdminDebug(`🔍 Connection state: ${mongoose.connection.readyState}, Collection: ${Seller.collection.name}`);

        // Use the common authorizeApp helper
        const { authorized, payload } = await authorizeApp(request, ['admin:read']);

        if (!authorized || (payload?.role !== 'ADMIN' && !payload?.roles?.includes('ADMIN'))) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        const sellers = await Seller.find({})
            .populate('user', 'name email roles')
            .sort({ createdAt: -1 });

        logAdminDebug(`📦 Found ${sellers.length} sellers via Mongoose.`);

        if (sellers.length === 0) {
            const rawSellers = await mongoose.connection.db?.collection('sellers').find({}).toArray();
            logAdminDebug(`🕵️ Raw DB check for 'sellers' collection: found ${rawSellers?.length || 0} docs`);
        }

        return NextResponse.json({
            success: true,
            sellers
        });
    } catch (error: any) {
        logAdminDebug(`❌ Admin Fetch Sellers Error: ${error.message}`);
        console.error('Admin Fetch Sellers Error:', error);
        return NextResponse.json(
            { success: false, message: 'Internal server error' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/sellers
 * Approve or Reject a seller application
 */
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { sellerId, status } = body;

        if (!sellerId || !status || !['VERIFIED', 'REJECTED', 'SUSPENDED', 'RESUBMITTED', 'PENDING'].includes(status)) {
            return NextResponse.json(
                { success: false, message: 'Invalid request data' },
                { status: 400 }
            );
        }

        await connectDB();

        const { authorized, payload } = await authorizeApp(request, ['admin:write']);
        if (!authorized || (payload?.role !== 'ADMIN' && !payload?.roles?.includes('ADMIN'))) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized - Admin access required' },
                { status: 403 }
            );
        }

        // Find seller directly (no transaction needed for Atlas Free Tier)
        const seller = await Seller.findById(sellerId);

        if (!seller) {
            return NextResponse.json(
                { success: false, message: 'Seller profile not found' },
                { status: 404 }
            );
        }

        // Update seller status
        seller.status = status;

        // Sync isApproved flag based on status
        if (status === 'VERIFIED') {
            seller.isApproved = true;
            seller.isActive = true;
        } else if (status === 'REJECTED' || status === 'SUSPENDED') {
            seller.isApproved = false;
            seller.isActive = false;
        }

        await seller.save();
        logAdminDebug(`✅ Seller ${sellerId} status updated to ${status}`);

        // If verified, add SELLER role to user
        if (status === 'VERIFIED') {
            await User.findByIdAndUpdate(seller.user, {
                $addToSet: { roles: 'SELLER' }
            });
            logAdminDebug(`✅ Added SELLER role to user ${seller.user}`);
        }

        return NextResponse.json({
            success: true,
            message: `Seller status updated to ${status}`,
            seller
        });
    } catch (error: any) {
        console.error('Admin Update Seller Error:', error);
        logAdminDebug(`❌ Error updating seller: ${error.message}`);
        return NextResponse.json(
            { success: false, message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

