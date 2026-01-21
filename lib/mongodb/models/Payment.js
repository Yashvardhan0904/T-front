import mongoose from "mongoose";

/**
 * Payment Schema
 * 
 * Tracks payment transactions for orders.
 * One payment record per order.
 * 
 * Status Flow:
 * PENDING → COMPLETED (payment successful)
 * PENDING → FAILED (payment failed)
 * COMPLETED → REFUNDED (if order cancelled/returned)
 */
const PaymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
        index: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: [true, "Payment amount is required"],
        min: [0, "Amount cannot be negative"],
    },
    // Payment method selected by user
    method: {
        type: String,
        enum: ["COD", "UPI", "CARD", "NETBANKING", "WALLET"],
        required: [true, "Payment method is required"],
    },
    status: {
        type: String,
        enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
        default: "PENDING",
        index: true,
    },
    // External payment gateway reference
    transactionId: {
        type: String,
        sparse: true,
    },
    // Gateway-specific data (razorpay order id, etc.)
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
    },
    // Timestamps for tracking payment timeline
    paidAt: {
        type: Date,
    },
    refundedAt: {
        type: Date,
    },
}, { timestamps: true });

// Compound index for user payment history
PaymentSchema.index({ user: 1, createdAt: -1 });

const Payment = mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
