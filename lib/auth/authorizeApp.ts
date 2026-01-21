import { NextResponse } from "next/server";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { Permissions } from "@/app/config/permissions";

interface JWTPayload {
    userId: string;
    email: string;
    name: string;
    role: string;
    roles: string[];
    intelligenceLevel: string;
}

export async function authorizeApp(request: Request, requiredPermissions: string[]) {
    try {
        const authHeader = request.headers.get("authorization");
        let token = "";

        if (authHeader && authHeader.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
            console.log("🔑 Found token in Authorization header");
        } else {
            const cookiesHeader = request.headers.get("cookie");
            if (cookiesHeader) {
                console.log(`🍪 Raw cookies header: ${cookiesHeader.substring(0, 30)}...`);
                // More robust cookie parsing for various formats
                const cookieArray = cookiesHeader.split(';');
                const foundKeys: string[] = [];
                for (let cookie of cookieArray) {
                    const [key, ...valueParts] = cookie.trim().split('=');
                    const cleanKey = key.trim();
                    foundKeys.push(cleanKey);
                    if (cleanKey === 'accessToken') {
                        token = valueParts.join('=').trim();
                        console.log("✅ Found accessToken in cookies");
                    }
                }
                if (!token) {
                    console.log(`❌ accessToken not found in cookies. Found keys: [${foundKeys.join(', ')}]`);
                }
            } else {
                console.log("🍪 No cookies header found in request");
            }
        }

        if (!token) {
            console.error("❌ Missing token");
            return {
                authorized: false,
                errorResponse: NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 })
            };
        }

        // Verify token with explicit error handling for expired vs invalid
        let payload: JWTPayload;

        try {
            payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as unknown as JWTPayload;
        } catch (verifyError) {
            // Handle token expired specifically
            if (verifyError instanceof TokenExpiredError) {
                console.log("⏰ Token expired");
                const response = NextResponse.json(
                    { error: "Session expired", code: "TOKEN_EXPIRED" },
                    { status: 401 }
                );
                // Add header so client can recognize this specific case
                response.headers.set("X-Token-Expired", "true");
                return { authorized: false, errorResponse: response };
            }

            // Handle other JWT errors (invalid signature, malformed, etc.)
            if (verifyError instanceof JsonWebTokenError) {
                console.error(`❌ Invalid token: ${verifyError.message}`);
                return {
                    authorized: false,
                    errorResponse: NextResponse.json(
                        { error: "Invalid token" },
                        { status: 401 }
                    )
                };
            }

            // Re-throw unknown errors
            throw verifyError;
        }

        console.log(`✅ Token verified. User: ${payload.userId}, Role: ${payload.role}, Intel: ${payload.intelligenceLevel}`);

        // Resolve effective permissions
        const p: any = Permissions;
        const userRoles = payload.roles || [payload.role];
        const intel = payload.intelligenceLevel || 'unsophisticated';

        let effective: string[] = [];
        userRoles.forEach(role => {
            const permEntry = p[intel]?.[role];
            if (permEntry) {
                effective = [...new Set([...effective, ...permEntry])];
            }
        });

        if (userRoles.includes("ADMIN") && intel === "sophisticated") {
            effective.push("*");
        }

        const hasAll = requiredPermissions.every(
            (perm) => effective.includes(perm) || effective.includes("*")
        );

        if (!hasAll) {
            console.error("❌ Insufficient permissions");
            return {
                authorized: false,
                errorResponse: NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 })
            };
        }

        return { authorized: true, payload };
    } catch (error: any) {
        console.error(`🔥 Auth Error: ${error.message}`);
        return {
            authorized: false,
            errorResponse: NextResponse.json({ error: "Unauthorized: Invalid or expired token" }, { status: 401 })
        };
    }
}
