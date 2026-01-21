import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import Order from "@/lib/mongodb/models/Order";
import Product from "@/lib/mongodb/models/Product";
import { verifyAccessToken } from "@/lib/auth/token";
import { createOrderSchema } from "@/lib/validators";
import { createOrderPayload, getEstimatedDelivery } from "@/lib/services/order";
import { authorizeApp } from "@/lib/auth/authorizeApp";

interface DecodedToken {
    userId: string;
    [key: string]: any;
}

import mongoose from "mongoose";
import { triggerUpdate } from "@/lib/pusher";

import Cart from "@/lib/mongodb/models/Cart";

export async function POST(request: Request) {
    let session;
    try {
        await connectDB();

        // 1. Authentication & Authorization
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["order:create"]);
        if (!authorized) return errorResponse!;
        const decoded = payload!;

        // 2. Fetch User's Cart (Server-side Source of Truth)
        const cart = await Cart.findOne({ user: decoded.userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
        }

        // 3. Start Transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 4. Validate Stock & Prepare Order Items
        const validatedItems = [];
        let subtotal = 0;

        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.status !== 'ACTIVE') {
                throw new Error(`Product ${product?.name || 'unknown'} is no longer available`);
            }

            // ATOMIC CONDITIONAL UPDATE: Enforce stock availability at DB level
            // This prevents double-selling even under heavy concurrent traffic.
            const updateResult = await Product.updateOne(
                {
                    _id: product._id,
                    stock: { $gte: item.quantity },
                    status: 'ACTIVE'
                },
                {
                    $inc: { stock: -item.quantity },
                    // Automatically update status if stock hits zero
                    $set: {
                        ...(product.stock - item.quantity === 0 ? { status: 'OUT_OF_STOCK' } : {})
                    }
                }
            ).session(session);

            if (updateResult.modifiedCount === 0) {
                throw new Error(`Insufficient stock for ${product.name}. Please adjust your cart.`);
            }

            const priceAtPurchase = product.price;
            subtotal += priceAtPurchase * item.quantity;

            validatedItems.push({
                product: product._id,
                productName: product.name,
                productImage: product.images?.[0] || '',
                quantity: item.quantity,
                priceAtPurchase,
                seller: product.seller,
            });
        }

        // 5. Calculate Totals
        const shippingFee = subtotal > 500 ? 0 : 50;
        const tax = Math.round(subtotal * 0.18);
        const totalAmount = subtotal + shippingFee + tax;

        // 6. Parse Shipping & Payment from Request
        const body = await request.json();
        const { shippingAddress, paymentMethod } = body;

        // 7. Create Order & Clear Cart
        const trackingNumber = `TRK${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        const [order] = await Order.create([{
            user: decoded.userId,
            items: validatedItems,
            subtotal,
            shippingFee,
            tax,
            totalAmount,
            status: 'PLACED',
            statusHistory: [{
                status: 'PLACED',
                timestamp: new Date(),
                updatedBy: decoded.userId,
                note: 'Order placed by customer'
            }],
            shippingAddress,
            paymentMethod,
            paymentStatus: 'PENDING',
            trackingNumber,
            estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }], { session });

        // Clear server-side cart
        cart.items = [];
        await cart.save({ session });

        // Commit Transaction
        await session.commitTransaction();

        // 8. Real-time Notifications
        try {
            await triggerUpdate(`user-${decoded.userId}`, 'order-placed', { orderId: order._id });
            const sellerIds = [...new Set(validatedItems.map(i => i.seller.toString()))];
            for (const sellerId of sellerIds) {
                await triggerUpdate(`seller-${sellerId}`, 'order-received', { orderId: order._id });
            }
        } catch (pusherErr) {
            console.error("Pusher update failed:", pusherErr);
        }

        return NextResponse.json({
            success: true,
            message: "Order placed successfully",
            orderId: order._id,
            trackingNumber,
        }, { status: 201 });

    } catch (error: any) {
        if (session) await session.abortTransaction();
        console.error("Order creation failed:", error);
        return NextResponse.json(
            { success: false, message: error.message || "Internal server error" },
            { status: 500 }
        );
    } finally {
        if (session) session.endSession();
    }
}

export async function GET(request: Request) {
    try {
        // 1. Authentication & Authorization
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["order:read"]);
        if (!authorized) return errorResponse!;
        const decoded = payload!;

        await connectDB();

        const orders = await Order.find({ user: decoded.userId })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json({
            success: true,
            orders,
        });

    } catch (error: any) {
        console.error("Failed to fetch orders:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

