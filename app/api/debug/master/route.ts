import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import { authorizeApp } from '@/lib/auth/authorizeApp';
import ChatSession from '@/lib/mongodb/models/ChatSession';
import Message from '@/lib/mongodb/models/Message';
import User from '@/lib/mongodb/models/User';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);

        // Let's see ALL sessions and message counts
        const allSessions = await ChatSession.find({}).sort({ createdAt: -1 }).limit(10).lean();
        const sessionDetails = await Promise.all(allSessions.map(async (s: any) => {
            const msgCount = await Message.countDocuments({ chatSessionId: s._id });
            return {
                id: s._id,
                email: s.userEmail,
                title: s.title,
                isDeleted: !!s.isDeleted,
                messageCount: msgCount,
                createdAt: s.createdAt
            };
        }));

        const recentMessages = await Message.find({}).sort({ createdAt: -1 }).limit(5).lean();

        return NextResponse.json({
            success: true,
            auth: {
                authorized,
                email: payload?.email,
                userId: payload?.userId,
                rawPayload: payload
            },
            sessions: sessionDetails,
            recentMessages: recentMessages.map((m: any) => ({
                id: m._id,
                sessionId: m.chatSessionId,
                email: m.userEmail,
                role: m.role,
                content: m.content.substring(0, 30) + '...'
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}

