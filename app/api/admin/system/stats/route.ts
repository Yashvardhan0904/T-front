import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import User from '@/lib/mongodb/models/User';
import Product from '@/lib/mongodb/models/Product';
import Order from '@/lib/mongodb/models/Order';
import Seller from '@/lib/mongodb/models/Seller';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import path from 'path';
import fs from 'fs';

function logAdminDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'admin-sellers-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[ADMIN-STATS] [${timestamp}] ${message}\n`);
    } catch (e) {
        // ignore
    }
}

export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = await authorizeApp(request, ["admin:read"]);
        if (!authorized) return errorResponse!;

        await connectDB();

        logAdminDebug('🔍 [StatsAPI] DB Connected for stats');

        const [
            totalUsers,
            totalProducts,
            totalOrders,
            totalSellers,
            pendingApprovals,
            pendingSellers,
            recentRevenue
        ] = await Promise.all([
            User.countDocuments({ deletedAt: null }),
            Product.countDocuments({ deletedAt: null, isApproved: true }), // Active products
            Order.countDocuments({ deletedAt: null }),
            Seller.countDocuments({ deletedAt: null }),
            Product.countDocuments({ isApproved: false, deletedAt: null }),
            Seller.countDocuments({ status: 'PENDING', deletedAt: null }),
            Order.aggregate([
                { $match: { paymentStatus: 'completed', deletedAt: null } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ])
        ]);

        logAdminDebug(`📊 [StatsAPI] Users: ${totalUsers}, Products: ${totalProducts}, Sellers: ${totalSellers}`);

        return NextResponse.json({
            success: true,
            stats: {
                totalUsers,
                totalProducts,
                totalOrders,
                totalSellers,
                pendingApprovals,
                pendingSellers,
                totalRevenue: recentRevenue[0]?.total || 0,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

