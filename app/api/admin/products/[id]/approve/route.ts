import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Product from '@/lib/mongodb/models/Product';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import AuditLog from '@/lib/mongodb/models/AuditLog';
import { triggerUpdate } from '@/lib/pusher';
import fs from 'fs';
import path from 'path';

function logApproveDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'product-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[APPROVE] [${timestamp}] ${message}\n`);
    } catch (e) {
        // ignore
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    let productId = "";
    try {
        const resolvedParams = await params;
        productId = resolvedParams.id;
        logApproveDebug(`🔵 Approve Triggered for ID: ${productId}`);

        const { authorized, payload, errorResponse } = await authorizeApp(request, ["admin:write"]);
        if (!authorized) {
            logApproveDebug(`❌ Unauthorized: ${payload?.role}`);
            return errorResponse!;
        }

        const { action } = await request.json(); // 'approve', 'reject', 'suspend', 'restore'
        logApproveDebug(`📝 Action: ${action}, User: ${payload?.userId}`);

        const mongoose = await connectDB();
        if (!mongoose.connection.db) throw new Error("DB not connected");
        const db = mongoose.connection.db;

        const uId = mongoose.Types.ObjectId.isValid(productId) ? new mongoose.Types.ObjectId(productId) : productId;

        // 1. Try to find the product in the staging collection first
        let product = await db.collection('pending-product').findOne({ _id: uId as any });
        let isStaged = !!product;
        logApproveDebug(`🔎 Search Raw Pending Result: ${product ? 'FOUND' : 'NULL'}`);

        // 2. If not in staging, check the main collection
        if (!product) {
            product = await db.collection('products').findOne({ _id: uId as any });
            logApproveDebug(`🔎 Search Raw Main Result: ${product ? 'FOUND' : 'NULL'}`);
        }

        if (!product) {
            logApproveDebug(`❌ Product not found in any collection for ID: ${productId}`);
            const isValidId = mongoose.Types.ObjectId.isValid(productId);
            logApproveDebug(`❓ Is Valid ObjectId? ${isValidId}`);
            return NextResponse.json({ error: "Product not found in any collection" }, { status: 404 });
        }

        const oldStatus = product.status;
        let newStatus = oldStatus;

        if (action === 'approve') {
            if (isStaged) {
                // 1. Move from pending to main
                const productData = { ...product };
                delete (productData as any)._id; // Let it be the same or new? 
                // We'll keep the same _id but need to handle the unique index in products

                const finalDoc = {
                    ...productData,
                    _id: uId,
                    isApproved: true,
                    status: 'ACTIVE',
                    isVisible: true,
                    isActive: true,
                    updatedAt: new Date()
                };

                // Create in main collection
                await db.collection('products').replaceOne({ _id: uId as any }, finalDoc as any, { upsert: true });

                // Delete from staging
                await db.collection('pending-product').deleteOne({ _id: uId as any });

                product = finalDoc as any;
                newStatus = 'ACTIVE';
            } else {
                // Just an update to an existing main product
                await db.collection('products').updateOne(
                    { _id: uId as any },
                    { $set: { isApproved: true, status: 'ACTIVE', updatedAt: new Date() } }
                );
                newStatus = 'ACTIVE';
            }
        } else if (action === 'reject') {
            const targetCol = isStaged ? 'pending-product' : 'products';
            await db.collection(targetCol).updateOne(
                { _id: uId as any },
                { $set: { isApproved: false, status: 'INACTIVE', updatedAt: new Date() } }
            );
            newStatus = 'REJECTED';
        } else if (action === 'suspend') {
            await db.collection('products').updateOne(
                { _id: uId as any },
                { $set: { isActive: false, status: 'INACTIVE', updatedAt: new Date() } }
            );
            newStatus = 'SUSPENDED';
        } else if (action === 'restore') {
            await db.collection('products').updateOne(
                { _id: uId as any },
                { $set: { isActive: true, isApproved: true, status: 'ACTIVE', updatedAt: new Date() } }
            );
            newStatus = 'ACTIVE';
        }

        // Audit the action
        await AuditLog.create({
            action: `PRODUCT_${action.toUpperCase()}`,
            performedBy: payload!.userId,
            targetId: productId,
            details: { from: oldStatus, to: newStatus, migratedFromStaging: isStaged && action === 'approve' },
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
        });

        // Notify Seller and Customers in real-time
        await triggerUpdate('products', 'updated', {
            productId: productId,
            status: newStatus,
            isApproved: action === 'approve'
        });

        return NextResponse.json({
            success: true,
            message: isStaged && action === 'approve' ? "Product approved and moved to main collection" : `Product ${action}d successfully`,
            product
        });
    } catch (error: any) {
        return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
    }
}
