import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Order from '@/lib/mongodb/models/Order';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import AuditLog from '@/lib/mongodb/models/AuditLog';

// GET: Fetch all orders (Admin only)
export async function GET(request: Request) {
    try {
        const { authorized, errorResponse } = await authorizeApp(request, ["admin:read"]);
        if (!authorized) return errorResponse!;

        await connectDB();
        const orders = await Order.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            orders,
        });
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}

// PATCH: Transaction Override / Order Update (Admin only)
export async function PATCH(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["admin:write"]);
        if (!authorized) return errorResponse!;

        const { orderId, status, paymentStatus, note } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        await connectDB();
        const order = await Order.findById(orderId);
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const oldStatus = order.status;
        const oldPaymentStatus = order.paymentStatus;

        // Apply overrides
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;

        await order.save();

        // Audit the override
        await AuditLog.create({
            action: "TRANSACTION_OVERRIDE",
            performedBy: payload!.userId,
            targetId: order._id,
            details: {
                fromStatus: oldStatus,
                toStatus: status,
                fromPayment: oldPaymentStatus,
                toPayment: paymentStatus,
                note: note || "Manual admin override"
            },
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
        });

        return NextResponse.json({
            success: true,
            message: "Order updated successfully (Override recorded)",
            order
        });
    } catch (error: any) {
        console.error("Override failed:", error);
        return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
    }
}

