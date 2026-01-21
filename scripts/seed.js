const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');

// 1. ORIGINAL DATA (Restoring...)
const originalProducts = [
    { name: 'Sony WH-1000XM5 Wireless Headphones', description: 'Industry-leading noise canceling with Auto NC Optimizer, 30-hour battery life.', price: 26900, category: 'Electronics', brand: 'Sony', stock: 25, images: [], tags: ["electronics", "audio", "headphones", "wireless"], fit: "regular", season: "all-season", color: "black", fabric: "plastic" },
    { name: 'Apple MacBook Air M2', description: 'Supercharged by M2 chip. 13.6" Liquid Retina display, 8GB RAM, 256GB SSD.', price: 99900, category: 'Electronics', brand: 'Apple', stock: 15, images: [], tags: ["electronics", "laptop", "m2", "apple"], fit: "regular", season: "all-season", color: "silver", fabric: "aluminum" },
    { name: 'Nike Air Max 270', description: 'Nike Air Max 270 delivers superior comfort with React foam and Max Air unit.', price: 12900, category: 'Footwear', brand: 'Nike', stock: 50, images: [], tags: ["footwear", "sneakers", "running", "sport"], fit: "regular", season: "all-season", color: "white", fabric: "synthetic" },
    { name: 'Samsung Galaxy S24 Ultra', description: 'AI-powered smartphone with 200MP camera, S Pen, and long-lasting battery.', price: 129999, category: 'Electronics', brand: 'Samsung', stock: 30, images: [], tags: ["electronics", "phone", "android", "ai"], fit: "regular", season: "all-season", color: "black", fabric: "glass" },
    { name: "Levi's 511 Slim Fit Jeans", description: 'Modern slim-fit jeans with stretch denim for all-day comfort.', price: 2999, category: 'Clothing', brand: "Levi's", stock: 100, images: [], tags: ["clothing", "jeans", "denim", "casual"], fit: "slim", season: "all-season", color: "blue", fabric: "denim" },
    { name: 'Adidas Ultraboost Light', description: 'Lightest Ultraboost ever. Responsive BOOST middleware for endless energy.', price: 15999, category: 'Footwear', brand: 'Adidas', stock: 40, images: [], tags: ["footwear", "running", "shoes", "sport"], fit: "regular", season: "all-season", color: "white", fabric: "knit" },
    { name: 'Dyson V15 Detect Vacuum', description: 'Most powerful cordless vacuum. Laser reveals microscopic dust.', price: 55900, category: 'Home', brand: 'Dyson', stock: 10, images: [], tags: ["home", "cleaning", "vacuum", "appliance"], fit: "regular", season: "all-season", color: "gold", fabric: "plastic" },
];

// 2. NEW AI DATA (Enriching...)
const seedProducts = [
    // --- HOODIES (Testing Fit & Texture) ---
    {
        name: "Classic Boxy Oversized Hoodie",
        price: 2499,
        description: "Heavyweight cotton fleece with a dropped shoulder design for that perfect streetwear vibe.",
        category: "Hoodies",
        brand: "StreetLogs",
        stock: 50,
        images: ["https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80&w=500"],
        tags: ["streetwear", "heavyweight", "casual", "winter", "minimal"],
        fit: "oversized",
        season: "winter",
        color: "black",
        fabric: "cotton"
    },
    {
        name: "Essential Slim Fit Zip-Up",
        price: 1899,
        description: "Athletic cut zip-up hoodie, perfect for layering or gym sessions.",
        category: "Hoodies",
        brand: "GymShark",
        stock: 30,
        images: ["https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?auto=format&fit=crop&q=80&w=500"],
        tags: ["gym", "athletic", "layering", "activewear"],
        fit: "slim",
        season: "all-season",
        color: "grey",
        fabric: "polyester"
    },

    // --- JEANS (Testing Avoidance Memory) ---
    {
        name: "Vintage 90s Baggy Jeans",
        price: 3200,
        description: "Authentic wide-leg denim washed for a vintage look.",
        category: "Jeans",
        brand: "Levi's",
        stock: 25,
        images: ["https://images.unsplash.com/photo-1582552938357-32b906df40cb?auto=format&fit=crop&q=80&w=500"],
        tags: ["vintage", "streetwear", "casual", "90s"],
        fit: "loose",
        season: "all-season",
        color: "blue",
        fabric: "denim"
    },
    {
        name: "Skinny Flex Denim",
        price: 2100,
        description: "Form-fitting jeans with high stretch content.",
        category: "Jeans",
        brand: "H&M",
        stock: 100,
        images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=500"],
        tags: ["casual", "stretch", "modern"],
        fit: "skinny",
        season: "all-season",
        color: "black",
        fabric: "denim"
    },

    // --- DRESSES (Testing Occasion/Category Boost) ---
    {
        name: "Midnight Velvet Party Dress",
        price: 4500,
        description: "Elegant velvet slip dress, perfect for evening cocktails and parties.",
        category: "Dresses",
        brand: "Zara",
        stock: 15,
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=500"],
        tags: ["party", "evening", "elegant", "formal"],
        fit: "regular",
        season: "winter",
        color: "black",
        fabric: "velvet"
    },
    {
        name: "Floral Summer Sundress",
        price: 1500,
        description: "Light and airy cotton dress for beach days and brunch.",
        category: "Dresses",
        brand: "H&M",
        stock: 40,
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=500"],
        tags: ["summer", "casual", "beach", "daytime"],
        fit: "loose",
        season: "summer",
        color: "floral",
        fabric: "cotton"
    },

    // --- SNEAKERS (Testing Brand/Use Case) ---
    {
        name: "Air Jordan 1 High 'Chicago'",
        price: 18000,
        description: "The classic silhouette that started it all.",
        category: "Footwear",
        brand: "Jordan",
        stock: 5,
        images: ["https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&q=80&w=500"],
        tags: ["sneakerhead", "streetwear", "basketball", "classic"],
        fit: "regular",
        season: "all-season",
        color: "red",
        fabric: "leather"
    },
    {
        name: "Ultraboost DNA Running Shoes",
        price: 14000,
        description: "High-performance running shoes with energy return.",
        category: "Footwear",
        brand: "Adidas",
        stock: 20,
        images: ["https://images.unsplash.com/photo-1587563871167-1ee9c731aef4?auto=format&fit=crop&q=80&w=500"],
        tags: ["running", "gym", "athletic", "comfort"],
        fit: "regular",
        season: "all-season",
        color: "black",
        fabric: "knit"
    },

    // --- RESTORED (From User Selection) ---
    {
        name: "Restored Product (Please Edit)",
        price: 9999, // Placeholder
        description: "Restored from orphan image. Please update details in dashboard.",
        category: "Uncategorized",
        brand: "Generic",
        stock: 1,
        images: ["/uploads/products/6963aee48527187918e8cfee/Screenshot 2026-01-11 193419.png"],
        tags: ["restored"],
        fit: "regular",
        season: "all-season",
        color: "unknown",
        fabric: "unknown"
    }
];

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing from environment variables");
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    brand: { type: String, required: true },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }, // Add Seller Ref
    // AI Fields
    tags: [String],
    fit: String,
    season: [String], // Changed to array
    color: String,
    fabric: String
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "seller" },
}, { timestamps: true });

const SellerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    storeName: { type: String, required: true },
    status: { type: String, default: "VERIFIED" },
}, { timestamps: true });


const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Seller = mongoose.models.Seller || mongoose.model('Seller', SellerSchema);

async function seed() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to ' + MONGODB_URI);

        // 1. Create/Find System User
        let systemUser = await User.findOne({ email: 'admin@trendora.com' });
        if (!systemUser) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            systemUser = await User.create({
                name: 'Trendora Admin',
                email: 'admin@trendora.com',
                password: hashedPassword,
                role: 'seller'
            });
            console.log('Created System User');
        }

        // 2. Create/Find System Seller
        let systemSeller = await Seller.findOne({ user: systemUser._id });
        if (!systemSeller) {
            systemSeller = await Seller.create({
                user: systemUser._id,
                storeName: 'Trendora Official',
                status: 'VERIFIED'
            });
            console.log('Created System Seller');
        }

        // 3. Prepare All Products
        const allProducts = [...originalProducts, ...seedProducts].map(p => ({
            ...p,
            seller: systemSeller._id, // Assign to System Seller
            season: Array.isArray(p.season) ? p.season : [p.season] // Ensure array
        }));

        console.log(`Enterprise Sync: Processing ${allProducts.length} items...`);

        let created = 0;
        let updated = 0;

        for (const p of allProducts) {
            const result = await Product.findOneAndUpdate(
                { name: p.name, brand: p.brand }, // Match by name and brand
                { $set: p },
                { upsert: true, new: true, setDefaultsOnInsert: true, rawResult: true }
            );

            if (result.lastErrorObject.updatedExisting) {
                updated++;
            } else {
                created++;
            }
        }

        console.log(`✅ Sync Complete: ${created} New, ${updated} Updated.`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding error:', error);
        process.exit(1);
    }
}

seed();
