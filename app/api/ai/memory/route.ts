import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import UserMemory from '@/lib/mongodb/models/UserMemory';
import AIContext from '@/lib/mongodb/models/AIContext';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);

        // Even if unauthorized, we might have a chatUserId in query
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        const email = payload?.email;

        if (!email && !userId) {
            return NextResponse.json({ success: false, error: 'Identity required' }, { status: 401 });
        }

        // 1. Fetch Memory (Style DNA)
        const memory = await UserMemory.findOne({
            $or: [
                { userEmail: email },
                { userId: userId }
            ]
        });

        // 2. Fetch Context (Recent History/Intents)
        const context = await AIContext.find({
            $or: [
                { userEmail: email },
                { userId: userId }
            ]
        }).sort({ createdAt: -1 }).limit(20);

        return NextResponse.json({
            success: true,
            memory,
            context: context.map(c => ({
                id: c._id,
                conversationHistory: c.conversationHistory || [],
                intentHistory: c.intentHistory || [],
                entities: c.entities,
                createdAt: c.createdAt
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);
        const url = new URL(request.url);
        const type = url.searchParams.get('type'); // 'memory' or 'context'
        const itemId = url.searchParams.get('id');
        const email = payload?.email;

        if (!authorized || !email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        if (type === 'context') {
            if (itemId) {
                await AIContext.deleteOne({ _id: itemId, userEmail: email });
            } else {
                await AIContext.deleteMany({ userEmail: email });
            }
        } else if (type === 'memory') {
            // Partial reset or specific field reset could go here
            // For now, full memory reset if no field specified
            await UserMemory.deleteOne({ userEmail: email });
        }

        return NextResponse.json({ success: true, message: 'Deleted successfully' });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);
        const email = payload?.email;

        if (!authorized || !email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const updates = await request.json();

        const memory = await UserMemory.findOneAndUpdate(
            { userEmail: email },
            {
                $set: {
                    ...updates,
                    userEmail: email,
                    userId: payload.userId || 'GENERIC_USER'
                }
            },
            { new: true, upsert: true }
        );

        return NextResponse.json({ success: true, memory });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

