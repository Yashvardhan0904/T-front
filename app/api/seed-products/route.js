import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import Coupon from '@/lib/mongodb/models/Coupon';

const OLLAMA_EMBED_URL = process.env.OLLAMA_EMBED_URL || 'http://localhost:11434/api/embeddings';

async function generateEmbedding(text) {
    try {
        const response = await fetch(OLLAMA_EMBED_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'qwen:4b',
                prompt: text,
            }),
        });
        const data = await response.json();
        return data.embedding || [];
    } catch (error) {
        console.error('Embedding error:', error);
        return [];
    }
}

const sampleProducts = [
    {
        name: 'Nike Air Max 270',
        description: 'The Nike Air Max 270 React delivers superior comfort with Nike React foam and a large Max Air unit. Perfect for running and casual wear.',
        price: 12900,
        category: 'Footwear',
        brand: 'Nike',
        images: ['/products/nike-airmax.jpg'], // Placeholder
        stock: 50,
        rating: 4.8,
        tags: ['sneakers', 'running', 'comfort', 'sport', 'shoes', 'black'],
    },
    {
        name: 'Sony WH-1000XM5 Wireless Headphones',
        description: 'Industry-leading noise canceling headphones with Auto NC Optimizer, 30-hour battery life, and crystal clear hands-free calling.',
        price: 26900,
        category: 'Electronics',
        brand: 'Sony',
        images: ['/products/sony-headphones.jpg'],
        stock: 25,
        rating: 4.9,
        tags: ['headphones', 'music', 'noise-cancelling', 'wireless', 'sony', 'audio'],
    },
    {
        name: 'Apple MacBook Air M2',
        description: 'Supercharged by M2 chip. 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD storage. Backlit Magic Keyboard and Touch ID.',
        price: 99900,
        category: 'Electronics',
        brand: 'Apple',
        images: ['/products/macbook-air.jpg'],
        stock: 15,
        rating: 4.9,
        tags: ['laptop', 'computer', 'apple', 'macbook', 'work', 'premium'],
    },
    {
        name: 'Levi\'s Men\'s 511 Slim Fit Jeans',
        description: 'Modern slim-fit jeans with room to move. Constructed with stretch denim for all-day comfort. Sits below waist.',
        price: 2999,
        category: 'Clothing',
        brand: 'Levi\'s',
        images: ['/products/levis-jeans.jpg'],
        stock: 100,
        rating: 4.5,
        tags: ['jeans', 'denim', 'pants', 'clothing', 'fashion', 'casual'],
    },
    {
        name: 'Dyson V15 Detect Vacuum',
        description: 'Most powerful, intelligent cordless vacuum. Laser reveals microscopic dust. LCD screen displays scientific proof of a deep clean.',
        price: 55900,
        category: 'Home',
        brand: 'Dyson',
        images: ['/products/dyson-vacuum.jpg'],
        stock: 10,
        rating: 4.7,
        tags: ['home', 'cleaning', 'vacuum', 'appliance', 'smart'],
    },
    {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'AI-powered smartphone with 200MP camera, S Pen, and long-lasting battery. Titanium frame and Gorilla Glass Armor.',
        price: 129999,
        category: 'Electronics',
        brand: 'Samsung',
        images: ['/products/samsung-s24.jpg'],
        stock: 30,
        rating: 4.8,
        tags: ['phone', 'mobile', 'android', 'samsung', 'camera', '5g'],
    },
    {
        name: 'Adidas Ultraboost Light',
        description: 'Lightest Ultraboost ever. Responsive BOOST middleware for endless energy. Primeknit+ upper for adaptive fit.',
        price: 15999,
        category: 'Footwear',
        brand: 'Adidas',
        images: ['/products/adidas-ultraboost.jpg'],
        stock: 40,
        rating: 4.6,
        tags: ['shoes', 'running', 'sport', 'adidas', 'sneakers', 'white'],
    },
];

const sampleCoupons = [
    {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchaseAmount: 1000,
        maxDiscount: 500,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        usageLimit: 10000,
        description: '10% off for new users',
    },
    {
        code: 'SAVE500',
        discountType: 'fixed',
        discountValue: 500,
        minPurchaseAmount: 5000,
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        usageLimit: 500,
        description: 'Flat ₹500 off on orders above ₹5000',
    },
    {
        code: 'SUMMER25',
        discountType: 'percentage',
        discountValue: 25,
        minPurchaseAmount: 2000,
        maxDiscount: 2000,
        expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        usageLimit: 200,
        description: 'Summer sale: 25% off',
    },
];

export async function POST() {
    try {
        await connectDB();

        // 1. Clear existing products and coupons (optional, maybe safe to keep)
        // await Product.deleteMany({});
        // await Coupon.deleteMany({});

        // 2. Insert Coupons
        for (const couponData of sampleCoupons) {
            await Coupon.findOneAndUpdate(
                { code: couponData.code },
                couponData,
                { upsert: true, new: true }
            );
        }

        // 3. Get an Admin or User to act as the default seller
        const User = (await import('@/lib/mongodb/models/User')).default;
        const defaultSeller = await User.findOne({ roles: 'ADMIN' }) || await User.findOne({});

        if (!defaultSeller) {
            console.warn('⚠️ No user found to assign as seller. Please create a user first.');
        }

        // 4. Insert Products with Embeddings
        let createdCount = 0;

        for (const productData of sampleProducts) {
            // Check if product exists
            const exists = await Product.findOne({ name: productData.name });
            if (exists) continue;

            // Generate embedding using Ollama
            const textForEmbedding = `${productData.name} ${productData.description} ${productData.category} ${productData.brand} ${productData.tags.join(' ')}`;
            const embedding = await generateEmbedding(textForEmbedding);

            await Product.create({
                ...productData,
                embeddings: embedding,
                seller: defaultSeller?._id, // Assign default seller
                isApproved: true,
                isActive: true,
                isVisible: true,
                status: 'ACTIVE',
            });
            createdCount++;
        }

        return NextResponse.json({
            success: true,
            message: `Seeded ${createdCount} new products and ${sampleCoupons.length} coupons`,
        });
    } catch (error) {
        console.error('Seed Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
