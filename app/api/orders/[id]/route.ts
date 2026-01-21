import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import Order from "@/lib/mongodb/models/Order";
import { authorizeApp } from '@/lib/auth/authorizeApp';
import { triggerUpdate } from "@/lib/pusher";

// GET: Fetch order details and live tracking history
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await connectDB();

        const { authorized, payload, errorResponse } = await authorizeApp(request, ["admin:read", "customer:read"]);
        if (!authorized) return errorResponse!;

        const order = await Order.findById(id).lean();

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        // Visibility Rules
        const isOwner = order.user.toString() === payload!.userId;
        const isAdmin = payload!.role === 'ADMIN';
        const isSellerInvolved = order.items.some((item: any) => item.seller.toString() === payload!.userId);

        if (!isOwner && !isAdmin && !isSellerInvolved) {
            return NextResponse.json({ success: false, message: "Unauthorized access to this order" }, { status: 403 });
        }

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PATCH: Update order status (Seller/Admin only)
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { status, note } = await request.json();

        await connectDB();

        const { authorized, payload, errorResponse } = await authorizeApp(request, ["admin:write", "seller:write"]);
        if (!authorized) return errorResponse!;

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
        }

        const isAdmin = payload!.role === 'ADMIN';
        const isSellerInvolved = order.items.some((item: any) => item.seller.toString() === payload!.userId);

        if (!isAdmin && !isSellerInvolved) {
            return NextResponse.json({ success: false, message: "Unauthorized to update this order" }, { status: 403 });
        }

        // Validate Status Flow (Optional but recommended)
        // For now, allow Seller/Admin to update as requested

        order.status = status;
        order.statusHistory.push({
            status,
            timestamp: new Date(),
            updatedBy: payload!.userId,
            note: note || `Status updated to ${status}`
        });

        if (status === 'DELIVERED') {
            order.deliveredAt = new Date();
            order.paymentStatus = 'PAID';
        } else if (status === 'CANCELLED') {
            order.cancelledAt = new Date();
        }

        await order.save();

        // Notify user of status change
        await triggerUpdate(`user-${order.user}`, 'order-status-changed', {
            orderId: order._id,
            status,
            note
        });

        return NextResponse.json({ success: true, order });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
