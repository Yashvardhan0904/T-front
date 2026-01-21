const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing from environment variables");
    process.exit(1);
}

const ProductSchema = new mongoose.Schema({}, { strict: false });
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function clear() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to ' + MONGODB_URI);

        console.log('🚨 DELETING ALL PRODUCTS...');
        const result = await Product.deleteMany({});

        console.log(`✅ Deleted ${result.deletedCount} products.`);
        console.log('Database is now empty of products.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error clearing products:', error);
        process.exit(1);
    }
}

clear();
