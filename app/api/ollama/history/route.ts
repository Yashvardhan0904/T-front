import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import Message from '@/lib/mongodb/models/Message';

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

        const url = new URL(request.url);
        const chatId = url.searchParams.get('chatId');

        if (!chatId) {
            return NextResponse.json({ success: false, error: 'chatId required' }, { status: 400 });
        }

        const mongoose = require('mongoose');
        const query: any = {
            chatSessionId: new mongoose.Types.ObjectId(chatId)
        };

        if (email) {
            // Logged in: check either email or userId (for continuity)
            query.$or = [{ userEmail: email }, { userId: userId }];
        } else {
            // Guest: check userId
            query.userId = userId;
        }

        const messages = await Message.find(query).sort({ createdAt: 1 });

        return NextResponse.json({
            success: true,
            messages
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

