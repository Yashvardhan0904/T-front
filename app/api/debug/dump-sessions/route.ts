import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import ChatSession from '@/lib/mongodb/models/ChatSession';
import User from '@/lib/mongodb/models/User';

export async function GET() {
    try {
        await connectDB();

        const sessions = await ChatSession.find({}).limit(100).lean();
        const users = await User.find({}).limit(50).lean();

        return NextResponse.json({
            success: true,
            sessionEmails: [...new Set(sessions.map((s: any) => s.userEmail))],
            allSessions: sessions.map((s: any) => ({
                id: s._id,
                email: s.userEmail,
                title: s.title,
                isDeleted: s.isDeleted
            })),
            userEmailsInDb: users.map((u: any) => u.email)
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}
