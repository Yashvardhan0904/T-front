import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import fs from 'fs';
import path from 'path';

function logToFile(message: string) {
    const logPath = path.join(process.cwd(), 'product-debug.log');
    const timestamp = new Date().toISOString();
    fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
}

// GET: Fetch ALL products (both main and pending) in one unified list for Admin
export async function GET(req: Request) {
    try {
        logToFile("🔵 Admin Product List API called");
        const { authorized, errorResponse, payload } = await authorizeApp(req, ["admin:read"]);
        if (!authorized) {
            logToFile(`❌ Unauthorized access attempt: ${payload?.role}`);
            return errorResponse!;
        }

        const mongoose = await connectDB();
        logToFile(`✅ DB Connected. Name: ${mongoose.connection.name}, Host: ${mongoose.connection.host}`);

        // Force check the actual collections in the DB
        if (mongoose.connection.db) {
            const collections = await mongoose.connection.db.listCollections().toArray();
            const collectionNames = collections.map((c: any) => c.name);
            logToFile(`📂 Actual Collections in DB: ${collectionNames.join(', ')}`);
        } else {
            logToFile("⚠️ mongoose.connection.db is undefined!");
        }

        const PendingProduct = (Product as any).getPendingModel();

        // USE RAW DATABASE DRIVER FOR MAXIMUM RELIABILITY
        if (!mongoose.connection.db) {
            throw new Error("Database connection not ready");
        }

        const db = mongoose.connection.db;
        logToFile("💎 Fetching RAW data from DB...");

        // 1. Fetch RAW arrays from collections
        const rawProducts = await db.collection('products').find({}).toArray();
        const rawPending = await db.collection('pending-product').find({}).toArray();

        logToFile(`📦 Raw: products(${rawProducts.length}), pending(${rawPending.length})`);

        // 2. Helper to fetch seller from ANY collection
        const resolveSeller = async (userId: any) => {
            if (!userId) return null;
            const uId = mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : userId;

            // Try 'customer' first
            let user = await db.collection('customer').findOne({ _id: uId as any });
            let source = 'customer';

            // Try 'users' second
            if (!user) {
                user = await db.collection('users').findOne({ _id: uId as any });
                source = 'users';
            }

            if (!user) return null;

            return {
                _id: user._id.toString(),
                firstName: user.firstName || user.name?.split(' ')[0] || 'User',
                lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
                email: user.email,
                recoveredFrom: source
            };
        };

        // 3. Process every product manually
        const processProducts = async (list: any[], source: string) => {
            return Promise.all(list.map(async (p: any) => {
                const seller = await resolveSeller(p.seller);

                return {
                    ...p,
                    _id: p._id.toString(), // FORCED STRING
                    id: p._id.toString(),  // FORCED STRING Fallback
                    seller: seller,
                    source: source,
                    isStaged: source === 'pending'
                };
            }));
        };

        const processedMain = await processProducts(rawProducts, 'main');
        const processedPending = await processProducts(rawPending, 'pending');

        const unifiedList = [...processedMain, ...processedPending];

        // 4. Sort by Created At (Newest First)
        unifiedList.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        logToFile(`✅ FINAL: Returning ${unifiedList.length} products to frontend`);

        return NextResponse.json({
            success: true,
            products: unifiedList
        });
    } catch (error: any) {
        logToFile(`🔥 BARE METAL ERROR: ${error.message}`);
        console.error(error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

