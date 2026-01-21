import { NextResponse } from 'next/server';
import { authorizeApp } from '@/lib/auth/authorizeApp';

export async function GET(request: Request) {
    try {
        const { authorized, payload, errorResponse } = await authorizeApp(request, []);

        const cookiesHeader = request.headers.get("cookie");

        return NextResponse.json({
            success: true,
            authorized,
            payload,
            cookiesHeader: cookiesHeader ? cookiesHeader.substring(0, 50) + "..." : "null"
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message });
    }
}

