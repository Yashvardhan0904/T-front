import mongoose from "mongoose";

/**
 * Address Schema
 * 
 * Reusable saved addresses for checkout.
 * Users can have multiple addresses with one marked as default.
 * 
 * WHY separate model:
 * - Addresses can be reused across multiple orders
 * - Users can manage addresses independently of orders
 * - Enables quick checkout with saved addresses
 */
const AddressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    // Label for easy identification (Home, Office, etc.)
    label: {
        type: String,
        default: "Home",
        trim: true,
    },
    // One address can be marked as default for quick checkout
    isDefault: {
        type: Boolean,
        default: false,
    },
    // Recipient details
    fullName: {
        type: String,
        required: [true, "Full name is required"],
        trim: true,
    },
    phone: {
        type: String,
        required: [true, "Phone number is required"],
        trim: true,
    },
    // Full address
    addressLine1: {
        type: String,
        required: [true, "Address line 1 is required"],
        trim: true,
    },
    addressLine2: {
        type: String,
        trim: true,
    },
    city: {
        type: String,
        required: [true, "City is required"],
        trim: true,
    },
    state: {
        type: String,
        required: [true, "State is required"],
        trim: true,
    },
    postalCode: {
        type: String,
        required: [true, "Postal code is required"],
        trim: true,
    },
    country: {
        type: String,
        default: "India",
        trim: true,
    },
}, { timestamps: true });

// Ensure only one default address per user
AddressSchema.pre('save', async function () {
    if (this.isDefault) {
        await this.constructor.updateMany(
            { user: this.user, _id: { $ne: this._id } },
            { isDefault: false }
        );
    }
});

const Address = mongoose.models.Address || mongoose.model("Address", AddressSchema);

export default Address;
