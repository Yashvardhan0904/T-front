import { serialize } from "cookie";

/**
 * Set authentication cookies (access token only)
 * Used after successful login or registration
 * @param {Object} res - Next.js response object (from NextResponse)
 * @param {string} accessToken - JWT access token
 */
export function setAuthCookies(res, accessToken) {
    const isProduction = process.env.NODE_ENV === "production";

    // Set Access Token Cookie
    res.cookies.set({
        name: "accessToken",
        value: accessToken,
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days (matching token expiry)
        path: "/",
    });
}

/**
 * Clear authentication cookies
 * Used during logout
 * @param {Object} res - Next.js response object (from NextResponse)
 */
export function clearAuthCookies(res) {
    const isProduction = process.env.NODE_ENV === "production";

    // Clear Access Token
    res.cookies.set({
        name: "accessToken",
        value: "",
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 0,
        expires: new Date(0), // UNIX epoch
        path: "/",
    });
}

/**
 * Extract access token from request cookies
 * @param {Object} req - Next.js request object
 * @returns {string|null} Access token or null if not found
 */
export function getTokenFromCookies(req) {
    const cookieHeader = req.headers.get("cookie");

    if (!cookieHeader) return null;

    // Parse cookies manually
    const cookies = cookieHeader.split(";").reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split("=");
        acc[key] = value;
        return acc;
    }, {});

    return cookies.accessToken || null;
}
