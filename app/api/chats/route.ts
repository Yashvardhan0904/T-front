import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import ChatSession from '@/lib/mongodb/models/ChatSession';

// In development, clear the model cache to allow schema changes to take effect
if (process.env.NODE_ENV === "development") {
    const mongoose = require('mongoose');
    delete mongoose.models.ChatSession;
}
import Message from '@/lib/mongodb/models/Message';
import fs from 'fs';
import path from 'path';

function logApiDebug(message: string) {
    try {
        const logPath = path.join(process.cwd(), 'product-debug.log');
        const timestamp = new Date().toISOString();
        fs.appendFileSync(logPath, `[API/CHATS] [${timestamp}] ${message}\n`);
    } catch (e) { }
}

export async function GET(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);
        const guestId = request.headers.get('x-user-id');

        if (!authorized && !guestId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const email = payload?.email?.toLowerCase();
        const userId = payload?.userId || guestId || 'unknown';

        logApiDebug(`Fetching sessions for: email=${email}, userId=${userId}`);

        // Query by email if available, otherwise by userId
        const query: any = { isDeleted: false };
        if (email) {
            query.$or = [{ userEmail: email }, { userId: userId }];
        } else {
            query.userId = userId;
        }

        const sessions = await ChatSession.find(query)
            .sort({ lastMessageAt: -1 })
            .limit(50);

        logApiDebug(`Found ${sessions.length} sessions for ${email}`);
        return NextResponse.json({ success: true, sessions, currentEmail: email });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);

        if (!authorized || !payload?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await request.json();
        const session = await ChatSession.create({
            userEmail: payload.email.toLowerCase(),
            userId: payload.userId,
            title: title || 'New Conversation'
        });

        return NextResponse.json({ success: true, session });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);

        if (!authorized || !payload?.email) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const chatId = url.searchParams.get('chatId');

        if (!chatId) {
            return NextResponse.json({ success: false, error: 'Chat ID required' }, { status: 400 });
        }

        // Soft delete
        const result = await ChatSession.findOneAndUpdate(
            { _id: chatId, userEmail: payload.email },
            { isDeleted: true },
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ success: false, error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Chat deleted correctly' });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

