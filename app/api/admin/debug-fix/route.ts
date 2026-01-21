import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import mongoose from 'mongoose';

export async function GET(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, ["admin:read", "admin:write"]);
        if (!authorized) return errorResponse!;

        const mongoose = await connectDB();
        if (!mongoose.connection.db) throw new Error("DB not ready");
        const db = mongoose.connection.db;

        const report = {
            foundInProducts: 0,
            movedToPending: 0,
            errors: [] as string[],
            details: [] as string[]
        };

        // 1. Find all products in 'products' collection that should be in 'pending-product'
        const misplaced = await db.collection('products').find({
            status: 'PENDING_APPROVAL'
        }).toArray();

        report.foundInProducts = misplaced.length;

        for (const p of misplaced) {
            try {
                // Move to 'pending-product'
                await db.collection('pending-product').replaceOne(
                    { _id: p._id },
                    { ...p, isApproved: false },
                    { upsert: true }
                );

                // Delete from 'products'
                await db.collection('products').deleteOne({ _id: p._id });

                report.movedToPending++;
                report.details.push(`Moved: ${p.name} (${p._id})`);
            } catch (err: any) {
                report.errors.push(`Failed moving ${p._id}: ${err.message}`);
            }
        }

        return NextResponse.json({
            success: true,
            message: `Diagnostic complete. Moved ${report.movedToPending} products to stating area.`,
            report
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

