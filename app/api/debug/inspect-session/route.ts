import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import ChatSession from '@/lib/mongodb/models/ChatSession';
import Message from '@/lib/mongodb/models/Message';
import { authorizeApp } from '@/lib/auth/authorizeApp';

export async function GET(request: Request) {
    try {
        await connectDB();
        const { authorized, payload } = await authorizeApp(request, []);

        const url = new URL(request.url);
        const chatId = url.searchParams.get('chatId');

        const allMessages = await Message.find({}).sort({ createdAt: -1 }).limit(20).lean();
        const session = chatId ? await ChatSession.findById(chatId).lean() : null;

        return NextResponse.json({
            success: true,
            currentUser: payload?.email,
            requestedChatId: chatId,
            sessionSample: session ? { id: session._id, email: session.userEmail, title: session.title } : "Not found",
            allMessagesCount: await Message.countDocuments({}),
            sampleOfAllMessages: allMessages.map((m: any) => ({
                id: m._id,
                role: m.role,
                content: m.content ? m.content.substring(0, 30) : '',
                storedSessionId: m.chatSessionId,
                storedEmail: m.userEmail,
                createdAt: m.createdAt
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}

