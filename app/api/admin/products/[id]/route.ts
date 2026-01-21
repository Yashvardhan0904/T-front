import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb'; // Sync with the common connection
import { authorizeApp } from '@/lib/auth/authorizeApp';
import Product from '@/lib/mongodb/models/Product';
import LocalDiskStorageProvider from '@/lib/storage/LocalDiskStorageProvider';
import mongoose from 'mongoose';

const storage = new LocalDiskStorageProvider();

/**
 * PATCH /api/admin/products/[id]
 * Allows admins to fully edit product metadata and manage images.
 */
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();

        // 1. Authorization Check (Admin Only)
        const { authorized, payload } = await authorizeApp(request, ['admin:write']);
        if (!authorized || !payload) {
            return NextResponse.json({ success: false, message: 'Unauthorized: Admin access required' }, { status: 403 });
        }

        // 2. Parse FormData
        const formData = await request.formData();
        const productDataRaw = formData.get('productData') as string;
        const imagesToDeleteRaw = formData.get('imagesToDelete') as string; // JSON array of paths
        const newImages = formData.getAll('newImages') as File[];

        if (!productDataRaw) {
            return NextResponse.json({ success: false, message: 'Missing product data' }, { status: 400 });
        }

        const updatedMetadata = JSON.parse(productDataRaw);
        const imagesToDelete = imagesToDeleteRaw ? JSON.parse(imagesToDeleteRaw) : [];

        // 3. Find Product
        const product = await Product.findById(id);
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        // 4. Handle Image Deletions
        if (imagesToDelete.length > 0) {
            for (const pathToDelete of imagesToDelete) {
                // Delete from filesystem
                await storage.delete(pathToDelete);
                // Remove from DB array
                product.images = product.images.filter((img: any) => img.path !== pathToDelete);
            }
        }

        // 5. Handle New Image Uploads (Enforce Max 5 Total)
        const currentCount = product.images.length;
        const incomingCount = newImages.length;
        if (currentCount + incomingCount > 5) {
            return NextResponse.json({
                success: false,
                message: `Total images cannot exceed 5. Current: ${currentCount}, New: ${incomingCount}`
            }, { status: 400 });
        }

        if (incomingCount > 0) {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            for (const file of newImages) {
                if (!allowedTypes.includes(file.type)) {
                    return NextResponse.json({
                        success: false,
                        message: `Invalid file type: ${file.name}. Only JPG, JPEG, and PNG are allowed.`
                    }, { status: 400 });
                }

                const buffer = Buffer.from(await file.arrayBuffer());
                const destinationPath = `products/${product._id.toString()}`;

                const storageResult = await storage.upload(buffer, destinationPath, file.name);

                product.images.push({
                    path: storageResult.path,
                    filename: storageResult.filename,
                    role: 'detail' // Default to detail for new images added by admin
                });
            }
        }

        // 6. Update Metadata
        // Only update fields that are provided in updatedMetadata
        const fieldsToUpdate = [
            'name', 'brand', 'price', 'description', 'category', 'fabric', 'warmth_level', 'season',
            'fit', 'color', 'occasion', 'status', 'ml'
        ];

        fieldsToUpdate.forEach(field => {
            if (updatedMetadata[field] !== undefined) {
                product[field] = updatedMetadata[field];
            }
        });

        // 7. Save Changes
        await product.save();

        return NextResponse.json({
            success: true,
            message: 'Product updated successfully by admin',
            product
        });

    } catch (error: any) {
        console.error('Admin Product Edit Error:', error);
        return NextResponse.json({
            success: false,
            message: error.message || 'Internal server error'
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/products/[id]
 * Fetch a single product for editing.
 */
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        await connectDB();

        const { authorized } = await authorizeApp(request, ['admin:read']);
        if (!authorized) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const product = await Product.findById(id).populate('seller');
        if (!product) {
            return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            product
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
