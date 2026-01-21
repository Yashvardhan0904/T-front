import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb/mongodb';
import Message from '@/lib/mongodb/models/Message';
import ChatSession from '@/lib/mongodb/models/ChatSession';
import { authorizeApp } from '@/lib/auth/authorizeApp';
const TRENDORA_SERVER_URL = process.env.TRENDORA_SERVER_URL || 'http://127.0.0.1:8000';

// --- Helpers ---

async function saveMessage(chatSessionId: string, userEmail: string | null, userId: string, content: string, role: string, tool?: string, toolResult?: any, intent?: any) {
    try {
        await Message.create({
            chatSessionId,
            userEmail: userEmail ? userEmail.toLowerCase() : 'guest',
            userId,
            content,
            role,
            model: 'trendora-v1',
            toolUsed: tool,
            toolResult,
            intent
        });
        await ChatSession.findByIdAndUpdate(chatSessionId, { lastMessageAt: new Date() });
    } catch (e) { console.error('DB Save Error', e); }
}

// Map Python Intent to Frontend Intent
function mapPythonIntent(intent: string): any {
    const isSearch = ["PRODUCT_SEARCH", "PRODUCT_CATEGORY", "PRODUCT_BROWSE", "ADD_TO_CART", "ADD_TO_WISHLIST"].includes(intent);
    return {
        primary_action: isSearch ? 'product_search' : 'general_chat',
        certainty: 1.0,
        category: null,
        use_case: null,
        fit: null,
        budget: null
    };
}

// --- Main Handler ---

export async function POST(request: Request) {
    try {
        await connectDB();
        const { message, userId, chatId, history = [] } = await request.json();
        if (!message) return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });

        const { authorized, payload } = await authorizeApp(request, []);
        const userEmail = payload?.email || null;
        const chatUserId = payload?.userId || userId || `guest-${Date.now()}`;

        // 0. Ensure ChatSession exists
        let currentChatId = (chatId && chatId !== 'null' && chatId !== 'undefined') ? chatId : null;
        if (!currentChatId) {
            const session = await ChatSession.create({
                userEmail,
                userId: chatUserId,
                title: message.substring(0, 50) + '...'
            });
            currentChatId = session._id.toString();
        }

        // 1. Save User Message
        await saveMessage(currentChatId, userEmail, chatUserId, message, 'user');

        // 2. Delegate to Trendora Server (FastAPI)
        console.log(`[Proxy] Routing to Trendora Server: ${TRENDORA_SERVER_URL}/api/chat`);

        const payload_to_python = {
            message: message,
            userId: chatUserId,
            userEmail: userEmail,
            chatId: currentChatId,
            useIntelligentSearch: true // Force enable new fashion AI system
        };
        console.log('[Proxy] Sending to Trendora:', JSON.stringify(payload_to_python, null, 2));

        const pythonResponse = await fetch(`${TRENDORA_SERVER_URL}/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload_to_python)
        });

        if (!pythonResponse.ok) {
            const errorText = await pythonResponse.text();
            console.error(`[Proxy] Trendora Error (${pythonResponse.status}):`, errorText);
            throw new Error(`Trendora Server Error: ${pythonResponse.status} - ${errorText}`);
        }

        const data = await pythonResponse.json();
        const { response, intent, products = [], outfits = [], metadata = {} } = data;

        // 3. Prepare for Frontend
        const toolUsed = (products.length > 0 || outfits.length > 0) ? 'antigravity_run' : undefined;
        // Map outfits to topPicks format for legacy frontend compatibility, 
        // but we'll update frontend to handle outfits properly.
        const toolResult = {
            topPicks: products,
            outfits: outfits,
            metadata: metadata
        };
        const frontendIntent = mapPythonIntent(intent);

        // 4. Save Assistant Message
        await saveMessage(currentChatId, userEmail, chatUserId, response, 'assistant', toolUsed, toolResult, frontendIntent);

        return NextResponse.json({
            success: true,
            response,
            chatId: currentChatId,
            toolUsed,
            toolResult,
            intent: frontendIntent,
            outfits,
            metadata
        });


    } catch (error: any) {
        console.error('[API Proxy] Error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function GET(request: Request) {
    return NextResponse.json({ success: false, error: 'Deprecated. Use /api/chats or /api/ollama/history' }, { status: 410 });
}