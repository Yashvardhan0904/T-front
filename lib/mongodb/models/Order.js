import mongoose from 'mongoose';

/**
 * Order Item Schema (embedded)
 * 
 * Each item in an order tracks:
 * - Product reference and snapshot data
 * - Seller reference for multi-seller orders
 * - Per-item status for seller-level fulfillment
 */
const OrderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    productName: { type: String, required: true },
    productImage: { type: String },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    // priceAtPurchase captures the price specifically at the time of order
    priceAtPurchase: {
        type: Number,
        required: true,
        min: 0,
    },
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Changed from Seller to User for direct role-based lookup
        required: true,
        index: true,
    },
});

const ShippingAddressSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: 'India' },
});

const OrderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        items: {
            type: [OrderItemSchema],
            required: true,
            validate: {
                validator: (items) => items.length > 0,
                message: 'Order must have at least one item',
            },
        },
        subtotal: { type: Number, required: true, min: 0 },
        shippingFee: { type: Number, default: 0, min: 0 },
        tax: { type: Number, default: 0, min: 0 },
        discount: { type: Number, default: 0, min: 0 },
        totalAmount: { type: Number, required: true, min: 0 },
        // High-level order status
        status: {
            type: String,
            enum: ['PLACED', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'],
            default: 'PLACED',
            index: true,
        },
        statusHistory: [{
            status: String,
            timestamp: { type: Date, default: Date.now },
            updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            note: String,
        }],
        shippingAddress: {
            type: ShippingAddressSchema,
            required: true,
        },
        paymentMethod: {
            type: String,
            enum: ['COD', 'UPI', 'CARD', 'NETBANKING', 'WALLET'],
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
            default: 'PENDING',
            index: true,
        },
        trackingNumber: {
            type: String,
            required: true,
            unique: true,
        },
        couponCode: { type: String },
        estimatedDelivery: { type: Date },
        deliveredAt: { type: Date },
        cancelledAt: { type: Date },
        cancellationReason: { type: String },
        deletedAt: { type: Date, default: null, index: true },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true }
);

// Indexes for common queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ 'items.seller': 1, status: 1 });

// Pre-save: Add status to history
OrderSchema.pre('save', function (next) {
    if (this.isModified('status')) {
        this.statusHistory.push({
            status: this.status,
            timestamp: new Date(),
        });
    }
    next();
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);

export default Order;
