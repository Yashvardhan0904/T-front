import mongoose from "mongoose";

/**
 * Product Schema
 * 
 * Stores product details, metadata for AI/ML training, and image references.
 * Unified with the original Product.js marketplace schema.
 */
const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Product name is required"],
        trim: true,
        index: true,
    },
    brand: {
        type: String,
        required: [true, "Product brand is required"],
        trim: true,
        index: true,
    },
    price: {
        type: Number,
        required: [true, "Product price is required"],
        min: 0,
        index: true,
    },
    description: {
        type: String,
        required: [true, "Product description is required"],
        trim: true,
    },
    category: {
        type: String,
        enum: [
            // Tops
            "tshirt", "shirt", "polo", "hoodie", "sweatshirt", "tank-top", "blouse", "crop-top", "tunic",
            // Bottoms
            "jeans", "trousers", "chinos", "shorts", "skirt", "leggings", "joggers", "track-pants",
            // Outerwear
            "jacket", "coat", "blazer", "puffer", "trench-coat", "cardigan", "sweater", "vest",
            // Ethnic
            "kurta", "saree", "sherwani", "lehenga", "dhoti",
            // Active & Inner
            "activewear", "sports-bra", "swimwear", "boxers", "briefs", "robe", "nightsuit",
            // Accessories
            "scarf", "shawl", "tie", "belt", "socks", "accessories",
            // Lifestyle & Other
            "footwear", "sneakers", "boots", "sandals", "electronics", "home", "other"
        ],
        required: true,
        index: true,
    },
    fabric: {
        type: String,
        enum: [
            // Natural
            "cotton", "wool", "silk", "linen", "hemp", "jute", "cashmere", "mohair", "angora", "alpaca",
            // Synthetic
            "polyester", "nylon", "spandex", "acrylic", "polypropylene",
            // Semi-Synthetic
            "rayon", "viscose", "modal", "tencel", "acetate", "cupro",
            // Specialized/Blends
            "leather", "suede", "velvet", "denim", "canvas", "chiffon", "satin", "fleece", "organza",
            "tweed", "flannel", "corduroy", "jersey", "pique", "poplin", "mesh", "lace", "tulle",
            "blend", "other"
        ],
        required: true,
    },
    warmth_level: {
        type: String,
        enum: ["light", "medium", "heavy"],
        required: true,
    },
    season: [{
        type: String,
        enum: ["summer", "winter", "all-season", "spring", "autumn", "monsoon", "pre-fall"],
        required: true,
    }],
    fit: {
        type: String,
        enum: ["slim", "regular", "oversized"],
        required: true,
    },
    color: {
        type: String,
        enum: ["black", "white", "red", "blue", "green", "yellow", "grey", "navy", "beige", "brown", "pink", "purple", "orange", "olive", "maroon", "gold", "silver", "multi"],
        required: true,
        index: true,
    },
    occasion: {
        type: [String],
        enum: [
            // Basic
            "casual", "office", "formal", "party", "lounge",
            // Sports & Performance
            "gym", "yoga", "running", "hiking", "swimming", "cycling", "tennis", "basketball", "cricket", "football", "activewear",
            // GenZ & Aesthetic
            "streetwear", "y2k", "athleisure", "gorpcore", "minimalist", "boho", "preppy", "vintage",
            // Events & Social
            "brunch", "date-night", "festival", "concert", "clubbing", "wedding", "festive", "cocktail", "evening-wear",
            // Lifestyle
            "work-from-home", "vacation", "travel", "beachwear", "interview", "graduation"
        ],
        required: true,
        validate: [(val: string[]) => val.length > 0, 'At least one occasion is required']
    },

    // Flexible Tags for broad search matching
    tags: {
        type: [String],
        default: [],
        index: true
    },

    // Marketplace Fields (From Product.js)
    stock: {
        type: Number,
        required: [true, "Stock quantity is required"],
        min: 0,
        default: 0,
    },
    sizes: {
        type: [String],
        default: [],
    },
    variants: {
        type: [{
            sku: String,
            size: String,
            color: String,
            stock: Number,
            priceAdjustment: Number
        }],
        default: [],
    },
    discount: {
        percentage: { type: Number, min: 0, max: 100, default: 0 },
        validUntil: { type: Date }
    },

    // Array of image references
    images: [
        {
            path: { type: String, required: true },
            filename: { type: String, required: true },
            role: { type: String, enum: ["front", "side", "detail"], default: "front" }
        }
    ],

    status: {
        type: String,
        enum: ["draft", "active", "inactive", "out_of_stock", "pending_approval"],
        default: "draft",
        lowercase: true,
        index: true,
    },

    // AI/ML Metadata
    ml: {
        verified: { type: Boolean, default: false },
        auto_tags: { type: [String], default: [] },
        quality_score: { type: Number, default: null, min: 0, max: 100 },
        embeddings: { type: [Number], default: undefined }
    },

    // Visibility & Lifecycle Flags
    isActive: { type: Boolean, default: true, index: true },
    isVisible: { type: Boolean, default: true, index: true },
    isApproved: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null, index: true }, // Soft delete support

    // Metrics
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, min: 0, default: 0 },
    likeCount: { type: Number, min: 0, default: 0 },


    // Reference to the seller
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Seller",
        required: true,
        index: true,
    },

    created_at: {
        type: Date,
        default: Date.now,
        index: true,
    }
}, { timestamps: true });

// Text indices for search
ProductSchema.index({ name: "text", description: "text", brand: "text" });

// Development cleanup to ensure schema changes apply immediately
if (process.env.NODE_ENV === "development") {
    delete mongoose.models.Product;
    delete mongoose.models.PendingProduct;
}

const Product = mongoose.models.Product || mongoose.model("Product", ProductSchema, "products");

// Static helper to get the Pending Product model (compatible with staging workflow if needed)
(Product as any).getPendingModel = function () {
    return mongoose.models.PendingProduct || mongoose.model("PendingProduct", ProductSchema, "pending-product");
};

export default Product;
