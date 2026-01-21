import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: [true, 'Coupon code is required'],
            unique: true,
            uppercase: true,
            trim: true,
            index: true,
        },
        discountType: {
            type: String,
            enum: ['percentage', 'fixed'],
            required: [true, 'Discount type is required'],
        },
        discountValue: {
            type: Number,
            required: [true, 'Discount value is required'],
            min: [0, 'Discount value cannot be negative'],
        },
        minPurchaseAmount: {
            type: Number,
            default: 0,
            min: [0, 'Minimum purchase amount cannot be negative'],
        },
        maxDiscount: {
            type: Number,
            min: [0, 'Maximum discount cannot be negative'],
        },
        expiryDate: {
            type: Date,
            required: [true, 'Expiry date is required'],
            index: true,
        },
        usageLimit: {
            type: Number,
            default: 1000,
            min: [1, 'Usage limit must be at least 1'],
        },
        usedCount: {
            type: Number,
            default: 0,
            min: [0, 'Used count cannot be negative'],
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        description: {
            type: String,
            required: [true, 'Coupon description is required'],
        },
    },
    {
        timestamps: true,
    }
);

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);

export default Coupon;
