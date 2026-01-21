import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import Order from '@/lib/mongodb/models/Order';
import { authorizeApp } from '@/lib/auth/authorizeApp';

export async function GET(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["seller:read"]);
        if (!authorized) return errorResponse!;

        await connectDB();

        // Fix: Fetch Seller profile using User ID from payload
        const sellerProfile = await (await import('@/lib/mongodb/models/Seller')).default.findOne({ user: payload!.userId });
        if (!sellerProfile) {
            return NextResponse.json({ success: false, error: "Seller profile not found" }, { status: 404 });
        }
        const sellerId = sellerProfile._id;

        const [
            totalProducts,
            activeOrders,
            pendingOrders,
            totalRevenue,
            recentOrders
        ] = await Promise.all([
            Product.countDocuments({ seller: sellerId, deletedAt: null }),
            Order.countDocuments({ "items.seller": sellerId, status: { $in: ['confirmed', 'processing', 'shipped'] }, deletedAt: null }),
            Order.countDocuments({ "items.seller": sellerId, status: 'pending', deletedAt: null }),
            Order.aggregate([
                { $match: { "items.seller": sellerId, paymentStatus: 'completed', deletedAt: null } },
                { $group: { _id: null, total: { $sum: "$totalAmount" } } }
            ]),
            Order.find({ "items.seller": sellerId, deletedAt: null })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name')
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalProducts,
                activeOrders,
                pendingOrders,
                totalRevenue: totalRevenue[0]?.total || 0,
                // NEW: Wallet Balance
                walletBalance: sellerProfile.walletBalance || 0
            },
            recentOrders: recentOrders.map(o => ({
                id: o._id,
                customer: (o.user as any)?.name || 'Unknown',
                amount: o.totalAmount,
                status: o.status
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

