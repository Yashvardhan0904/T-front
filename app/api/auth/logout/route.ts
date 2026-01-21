import { NextResponse } from 'next/server';
import { clearAuthCookies } from "@/lib/auth/cookies";

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: 'Logged out successfully' },
            { status: 200 }
        );

        // Clear auth cookies
        clearAuthCookies(response);

        return response;
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : 'An unknown error occurred' },
            { status: 500 }
        );
    }
}
