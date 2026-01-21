import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb.jsx'; // Using the .jsx one as found in lib
import { authorizeApp } from '@/lib/auth/authorizeApp';
import Product from '@/lib/mongodb/models/Product';
import Seller from '@/lib/mongodb/models/Seller';
import LocalDiskStorageProvider from '@/lib/storage/LocalDiskStorageProvider';
import mongoose from 'mongoose';

// Initialization
const storage = new LocalDiskStorageProvider();

/**
 * POST /api/seller/products
 * Creates a new product with images.
 */
export async function POST(request: Request) {
    try {
        await connectDB();

        // 1. Authorization Check
        const { authorized, payload } = await authorizeApp(request, ['addProduct']);
        if (!authorized || !payload) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const productDataRaw = formData.get('productData') as string;

        if (!productDataRaw) {
            return NextResponse.json({ success: false, message: 'Missing product data' }, { status: 400 });
        }

        const productData = JSON.parse(productDataRaw);
        const imageFiles = formData.getAll('images') as File[];

        // 3. Validation - Image Count (1 to 5)
        if (imageFiles.length < 1 || imageFiles.length > 5) {
            return NextResponse.json({
                success: false,
                message: `Image count must be between 1 and 5. Received ${imageFiles.length}.`
            }, { status: 400 });
        }

        // 4. Validation - File Types & Duplicates
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const seenFilenames = new Set();

        for (const file of imageFiles) {
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({
                    success: false,
                    message: `Invalid file type: ${file.name}. Only JPG, JPEG, and PNG are allowed.`
                }, { status: 400 });
            }
            if (seenFilenames.has(file.name)) {
                return NextResponse.json({
                    success: false,
                    message: `Duplicate image detected: ${file.name}`
                }, { status: 400 });
            }
            seenFilenames.add(file.name);
        }

        // 5. Fetch Seller Profile
        const seller = await Seller.findOne({ user: payload.userId });
        if (!seller) {
            return NextResponse.json({
                success: false,
                message: 'Seller profile not found. Please complete onboarding first.'
            }, { status: 403 });
        }

        // 6. Create Product (Initial save to get ID for folder naming)
        // Safety: ensure images is not polluted by incoming data to avoid cast errors
        const { images, ...cleanProductData } = productData;

        // 6. Synchronous Flow: Validate -> Generate -> Charge -> Save

        // A. Validate Funds (First Check)
        const { billingService } = await import('@/lib/services/billing');
        await billingService.checkFunds(seller._id);

        // B. Store Images (Necessary to get image paths for the product)
        // We do this early, but if later steps fail, these are orphaned files (acceptable trade-off for now vs complex cleanup)
        // Ideally we would delete them in catch block
        const newProductId = new mongoose.Types.ObjectId();
        const storedImages = [];
        for (let i = 0; i < imageFiles.length; i++) {
            const file = imageFiles[i];
            const buffer = Buffer.from(await file.arrayBuffer());
            const destinationPath = `products/${newProductId.toString()}`;
            const storageResult = await storage.upload(buffer, destinationPath, file.name);
            storedImages.push({
                path: storageResult.path,
                filename: storageResult.filename,
                role: i === 0 ? 'front' : (i === 1 ? 'side' : 'detail')
            });
        }

        // C. Generate Embedding (Strict Request)
        const { generateEmbedding } = await import('@/lib/ai/openai');

        const textToEmbed = [
            cleanProductData.name,
            cleanProductData.description,
            cleanProductData.category,
            cleanProductData.brand,
            cleanProductData.color,
            cleanProductData.fabric,
            cleanProductData.occasion?.join(' '),
            cleanProductData.tags?.join(' ')
        ].filter(Boolean).join(' ');

        let embedding: number[] = [];
        try {
            embedding = await generateEmbedding(textToEmbed);
            if (!embedding || embedding.length === 0) {
                throw new Error("Failed to generate embedding vector");
            }
        } catch (embedError: any) {
            console.error("Embedding Generation Failed:", embedError);
            return NextResponse.json({
                success: false,
                message: `Product Creation Failed: Could not generate AI embedding. ${embedError.message}`
            }, { status: 500 }); // Strict fail
        }

        // D. Charge Seller & Create Product (Atomic)
        // We use the billing service to handle the transaction which includes charging AND logically confirming we can proceed
        // However, since we need to save the product WITH the embedding, we integrate the logic here.

        let savedProduct;
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            // 1. Charge Logic (Deduct Balance & Log Ledger)
            // We use the service but pass the session to make it atomic with product save
            // NOTE: We need to expose a method in billingService that accepts a session or move logic here.
            // For now, we'll use the existing checkFunds + manual logic here to ensure atomicity with Product save
            // OR refactor billingService to accept session. 
            // Let's refactor billingService.chargeForEmbedding to be more flexible or just do it inline for this critical path.

            // Re-fetch seller inside session for lock
            const sellerDoc = await Seller.findById(seller._id).session(session);
            if (!sellerDoc) throw new Error("Seller not found");

            const isAdmin = sellerDoc.storeName === "Trendora";
            const cost = isAdmin ? 0 : 5.00; // Hardcoded from requirements: ₹5.00

            if (!isAdmin) {
                if (sellerDoc.walletBalance < cost) {
                    throw new Error(`Insufficient funds. Required: ₹${cost}, Balance: ₹${sellerDoc.walletBalance}`);
                }
                sellerDoc.walletBalance -= cost;
                await sellerDoc.save({ session });

                // Ledger Entry
                const { default: BillingLedger } = await import('@/lib/mongodb/models/BillingLedger');
                await BillingLedger.create([{
                    sellerId: sellerDoc._id,
                    type: 'DEBIT',
                    amount: cost,
                    currency: 'INR',
                    reason: 'EMBEDDING_CHARGE',
                    referenceId: newProductId.toString(),
                    balanceAfter: sellerDoc.walletBalance,
                    metadata: { productName: cleanProductData.name }
                }], { session });
            }

            // 2. Save Product with Embedding
            const productToSave = new Product({
                _id: newProductId,
                ...cleanProductData,
                seller: seller._id,
                images: storedImages,
                status: 'draft',
                ml: {
                    verified: true,
                    auto_tags: [],
                    quality_score: null,
                    embeddings: embedding // Saved WITH product
                }
            });

            await productToSave.save({ session });
            savedProduct = productToSave;

            // 3. Log Embedding Transaction
            const { default: EmbeddingTransaction } = await import('@/lib/mongodb/models/EmbeddingTransaction');
            await EmbeddingTransaction.create([{
                transactionId: `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                sellerId: sellerDoc._id,
                productId: newProductId,
                productName: cleanProductData.name,
                modelUsed: 'text-embedding-3-small',
                status: 'SUCCESS',
                costPerEmbedding: cost,
                totalCost: cost,
                performedBy: isAdmin ? 'ADMIN' : 'SELLER'
            }], { session });

            await session.commitTransaction();

        } catch (txnError) {
            await session.abortTransaction();
            throw txnError;
        } finally {
            session.endSession();
        }

        return NextResponse.json({
            success: true,
            message: 'Product created successfully',
            product: savedProduct
        }, { status: 201 });

    } catch (error: any) {
        console.error('Product Upload Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

