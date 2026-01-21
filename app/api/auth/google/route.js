import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Generate PKCE code verifier and challenge
 * OAuth 2.1 compliant - S256 method
 */
function generatePKCE() {
    const verifier = crypto.randomBytes(32).toString('base64url');
    const challenge = crypto
        .createHash('sha256')
        .update(verifier)
        .digest('base64url');
    return { verifier, challenge };
}

export async function GET() {
    // Generate CSRF protection state parameter
    const state = crypto.randomBytes(32).toString('hex');

    // Generate PKCE for authorization code protection
    const { verifier, challenge } = generatePKCE();

    const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");

    googleAuthUrl.searchParams.set("client_id", process.env.GOOGLE_CLIENT_ID);
    googleAuthUrl.searchParams.set("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
    googleAuthUrl.searchParams.set("response_type", "code");
    googleAuthUrl.searchParams.set("scope", "email profile");
    googleAuthUrl.searchParams.set("access_type", "offline");
    googleAuthUrl.searchParams.set("prompt", "consent");

    // OAuth 2.1 security parameters
    googleAuthUrl.searchParams.set("state", state);
    googleAuthUrl.searchParams.set("code_challenge", challenge);
    googleAuthUrl.searchParams.set("code_challenge_method", "S256");

    // Create response with state/verifier in secure HttpOnly cookies
    const response = NextResponse.redirect(googleAuthUrl.toString());

    const isProduction = process.env.NODE_ENV === "production";
    const cookieOptions = {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 10, // 10 minutes - enough time to complete OAuth flow
        path: "/",
    };

    // Store state and PKCE verifier in cookies (survives cross-device/port scenarios)
    response.cookies.set("oauth_state", state, cookieOptions);
    response.cookies.set("oauth_verifier", verifier, cookieOptions);

    return response;
}
