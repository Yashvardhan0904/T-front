import mongoose from "mongoose";

/**
 * Cart Schema
 * 
 * Server-side cart persistence to complement client-side Zustand store.
 * 
 * WHY server-side cart:
 * - Syncs across devices
 * - Survives browser storage clear
 * - Required for features like "save for later"
 * - Enables cart abandonment emails
 */


const CartItemSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        variantId: {
            type: String, // size-color identifier
            required: true
        },
        size: { type: String },  // Persist for UI display
        color: { type: String }, // Persist for UI display
        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 50
        },
        priceAtAddTime: {
            type: Number,
            required: true
        }
    },
    { _id: false }
);

const CartSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
            index: true
        },
        items: {
            type: [CartItemSchema],
            default: []
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false
    }
);

// Prevent Mongoose OverwriteModelError in development
if (process.env.NODE_ENV === 'development' && mongoose.models.Cart) {
    delete mongoose.models.Cart;
}

const Cart = mongoose.models.Cart || mongoose.model("Cart", CartSchema);

export default Cart;
