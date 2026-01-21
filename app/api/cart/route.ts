import { NextResponse } from "next/server";
// Enterprise Cart API - Atomic Operations Enabled
import { connectDB } from "@/lib/mongodb/mongodb";
import Cart from "@/lib/mongodb/models/Cart";
import Product from "@/lib/mongodb/models/Product";
import { authorizeApp } from "@/lib/auth/authorizeApp";

// GET: Fetch the user's persistent cart
export async function GET(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["cart:read"]);
        if (!authorized) return errorResponse!;

        await connectDB();
        let cart = await Cart.findOne({ user: payload!.userId }).populate({
            path: 'items.productId',
            select: 'name price images stock status'
        });

        if (cart) {
            // Filter out items where productId is null/undefined (deleted products)
            cart.items = cart.items.filter((item: any) => item.productId);
        } else {
            cart = await Cart.create({ user: payload!.userId, items: [] });
        }

        return NextResponse.json({ success: true, cart });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// POST: Add or update items in the cart (Atomic Operations)
export async function POST(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["cart:update"]);
        if (!authorized) return errorResponse!;

        const body = await request.json();
        const { productId, quantity = 1, action, size, color } = body;
        const userId = payload!.userId;

        await connectDB();
        const mongoose = (await import('mongoose')).default;
        if (productId && !mongoose.Types.ObjectId.isValid(productId)) {
            return NextResponse.json({ success: false, error: "Invalid Product ID" }, { status: 400 });
        }

        // Generate consistent variantId for uniqueness
        const variantId = `${size || 'default'}-${color || 'default'}`.toLowerCase().replace(/\s+/g, '-');

        if (action === 'remove') {
            await Cart.updateOne(
                { user: userId },
                { $pull: { items: { productId, variantId } } }
            );
        } else if (action === 'update_quantity') {
            await Cart.updateOne(
                { user: userId, "items.productId": productId, "items.variantId": variantId },
                { $set: { "items.$.quantity": quantity } }
            );
        } else {
            // Action: Add (or Increment if exists)

            // 1. Try to increment existing item (Atomic)
            const updateResult = await Cart.updateOne(
                { user: userId, "items.productId": productId, "items.variantId": variantId },
                { $inc: { "items.$.quantity": quantity } }
            );

            // 2. If no document matched (nModified: 0), it means item doesn't exist -> Push new item
            if (updateResult.modifiedCount === 0) {
                // Fetch product price for priceAtAddTime
                const product = await Product.findById(productId).select('price');
                if (!product) return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });

                await Cart.updateOne(
                    { user: userId },
                    {
                        $push: {
                            items: {
                                productId,
                                variantId,
                                quantity,
                                priceAtAddTime: product.price,
                                size,  // Persist for UI
                                color  // Persist for UI
                            }
                        }
                    },
                    { upsert: true } // Create cart if doesn't exist
                );
            }
        }

        // Fetch updated cart to return to frontend
        const cart = await Cart.findOne({ user: userId }).populate({
            path: 'items.productId',
            select: 'name price images stock status'
        });

        if (cart) {
            // Filter out items where productId is null/undefined (deleted products)
            cart.items = cart.items.filter((item: any) => item.productId);
        }

        return NextResponse.json({ success: true, cart });
    } catch (error: any) {
        console.error("[Cart API] Atomic Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

// DELETE: Clear the cart
export async function DELETE(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["cart:update"]);
        if (!authorized) return errorResponse!;

        await connectDB();
        await Cart.findOneAndUpdate(
            { user: payload!.userId },
            { $set: { items: [] } }
        );

        return NextResponse.json({ success: true, message: "Cart cleared" });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

