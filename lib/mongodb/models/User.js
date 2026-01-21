import mongoose from "mongoose";

/**
 * User Schema
 * 
 * Core user model supporting multiple authentication providers and roles.
 * 
 * Roles:
 * - USER: Regular customer, can browse and purchase
 * - SELLER: Can list products, manage orders for their products
 * - ADMIN: Full access, can manage users, sellers, and all products
 */
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name is required"],
        trim: true,
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
        type: String,
        // Password is NOT required - Google users won't have one
        required: false,
        minlength: [6, "Password must be at least 6 characters"],
    },
    provider: {
        type: String,
        enum: ["credentials", "google"],
        default: "credentials",
    },
    providerId: {
        type: String,
        default: null,
    },
    avatar: {
        type: String,
        default: null,
    },
    // Token version for mass revocation (increment to invalidate all sessions)
    tokenVersion: {
        type: Number,
        default: 0,
    },
    // Roles array determines access levels throughout the app
    roles: {
        type: [String],
        enum: ["USER", "CUSTOMER", "SELLER", "ADMIN", "CUSTOMER_CARE"],
        default: ["CUSTOMER"],
    },
    // Intelligence level determines sophistication
    intelligenceLevel: {
        type: String,
        enum: ["unsophisticated", "sophisticated"],
        default: "unsophisticated",
    },
    // Reference to seller profile when role includes SELLER
    sellerProfileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        default: null,
    },
    // Saved addresses for checkout
    addresses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
    }],
    // Products the user wants to buy later
    wishlist: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],
    // Products the user has liked (real likes)
    likedProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
    }],

    // Embedded cart (kept for backward compatibility, server-side Cart model also exists)
    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
            },
            quantity: {
                type: Number,
                default: 1,
                min: [1, "Quantity must be at least 1"],
            },
            addedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
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
    isSuspended: {
        type: Boolean,
        default: false,
        index: true,
    },
});

// Validate password for credentials-based users
UserSchema.pre('save', function () {
    if (this.provider === 'credentials' && !this.password) {
        throw new Error('Password is required for credentials-based authentication');
    }
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ roles: 1 });

// In development, clear the model cache to allow schema changes to take effect
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.User;
}

UserSchema.virtual('role').get(function () {
    return (this.roles && this.roles.length > 0) ? this.roles[0] : "CUSTOMER";
});
UserSchema.set('toObject', { virtuals: true });
UserSchema.set('toJSON', { virtuals: true });
const User = mongoose.models.User || mongoose.model("User", UserSchema, "customer");

export default User;
