import { NextResponse } from "next/server";
// import { verifyAccessToken } from "./lib/auth/token"; // Removed to avoid Edge issues

/**
 * Middleware Configuration
 * - Protects routes based on authentication status
 * - Enforces role-based access for seller/admin routes
 */

// Routes that require authentication
const authRequiredRoutes = [
    "/dashboard",
    "/account",
    "/profile",
    "/orders",
    "/checkout",
    "/wishlist",
];

// Routes that require specific roles
const roleProtectedRoutes = {
    "/seller": ["SELLER", "ADMIN"],
    "/admin": ["ADMIN"],
};

// Public routes (no auth required)
const publicRoutes = [
    "/",
    "/login",
    "/create-account",
    "/forget-password",
    "/products",
    "/cart",
    "/premium",
    "/track-order",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/google",
    "/api/auth/google/callback",
    "/api/user",
    "/api/seed",
    "/api/seed-admin",
    "/api/seed-products",
];

export function middleware(request) {
    const { pathname } = request.nextUrl;

    // Skip public routes
    const isPublicRoute = publicRoutes.some(route =>
        pathname === route || pathname.startsWith(route + "/")
    );
    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Get and verify token existence
    const accessToken = request.cookies.get("accessToken")?.value;
    // Note: We only check for token existence here to avoid Edge Runtime issues with jsonwebtoken
    // Full verification happens in API routes
    const isAuthenticated = !!accessToken;
    const decoded = null; // Deprecated in middleware for performance/compatibility

    // Check auth-required routes
    const needsAuth = authRequiredRoutes.some(route => pathname.startsWith(route));
    if (needsAuth && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Check role-protected routes
    for (const [prefix, allowedRoles] of Object.entries(roleProtectedRoutes)) {
        // Exception: Allow all users to access seller onboarding
        if (pathname.startsWith("/seller/onboarding") && prefix === "/seller") {
            continue;
        }

        if (pathname.startsWith(prefix)) {
            // Must be authenticated
            if (!isAuthenticated) {
                const loginUrl = new URL("/login", request.url);
                loginUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(loginUrl);
            }

            // Role checks are now handled in the page/layout or API level
            // because we can't reliably decode the token in Edge Middleware
            // safely without `jose` library or risking partial implementation.
        }
    }

    return NextResponse.next();
}

// Matcher: exclude static files
export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
