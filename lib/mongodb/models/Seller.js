import mongoose from "mongoose";

/**
 * Seller Schema
 * 
 * Stores seller-specific business information separately from user account.
 * A user becomes a seller by completing onboarding, which creates this profile.
 * 
 * Status Flow:
 * PENDING → VERIFIED (by admin) → Active selling
 * PENDING → REJECTED (by admin) → Cannot sell
 * VERIFIED → SUSPENDED (by admin) → Temporarily blocked
 */
const SellerSchema = new mongoose.Schema({
    // Link to user account - one seller profile per user
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    // Store display name shown to customers
    storeName: {
        type: String,
        required: [true, "Store name is required"],
        trim: true,
        index: true,
    },
    storeDescription: {
        type: String,
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    storeLogo: {
        type: String,
        default: null,
    },
    // Admin-controlled status for seller approval workflow
    status: {
        type: String,
        enum: ["PENDING", "VERIFIED", "REJECTED", "SUSPENDED", "RESUBMITTED"],
        default: "PENDING",
        index: true,
    },
    // Bank details for payouts (consider encrypting in production)
    bankDetails: {
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true },
        bankName: { type: String, trim: true },
        ifscCode: { type: String, trim: true, uppercase: true },
    },
    // Business/warehouse address
    businessAddress: {
        addressLine1: String,
        addressLine2: String,
        city: String,
        state: String,
        postalCode: String,
        country: { type: String, default: "India" },
    },
    // Aggregated metrics (updated via triggers or periodic jobs)
    metrics: {
        totalProducts: { type: Number, default: 0 },
        totalOrders: { type: Number, default: 0 },
        totalRevenue: { type: Number, default: 0 },
        averageRating: { type: Number, default: 0, min: 0, max: 5 },
        reviewCount: { type: Number, default: 0 },
    },
    // Contact info for customer support
    contactEmail: {
        type: String,
        lowercase: true,
        trim: true,
    },
    contactPhone: {
        type: String,
        trim: true,
    },
    // GDPR & Soft Delete
    deletedAt: {
        type: Date,
        default: null,
        index: true,
    },
    // Visibility & Status Flags
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    isVisible: {
        type: Boolean,
        default: true,
        index: true,
    },
    isApproved: {
        type: Boolean,
        default: false,
        index: true,
    },
    // Wallet & Billing
    walletBalance: {
        type: Number,
        default: 0,
        min: [0, "Wallet balance cannot be negative"],
        // Stored in Rupees (Float or Integer handling depending on requirements, simple float for now)
    },
    billingStatus: {
        type: String,
        enum: ["ACTIVE", "FROZEN"],
        default: "ACTIVE"
    },
}, { timestamps: true });

// Compound indexes for common queries
SellerSchema.index({ status: 1, storeName: 1 });

const Seller = mongoose.models.Seller || mongoose.model("Seller", SellerSchema, "sellers");

export default Seller;
