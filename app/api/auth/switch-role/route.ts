import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import AuditLog from "@/lib/mongodb/models/AuditLog";
import { createAccessToken, verifyAccessToken } from "@/lib/auth/token";
import { setAuthCookies } from "@/lib/auth/cookies";
import { Permissions } from "@/app/config/permissions";

// Allowed target roles
const ALLOWED_ROLES = ["CUSTOMER", "SELLER", "ADMIN", "CUSTOMER_CARE"] as const;
type AllowedRole = typeof ALLOWED_ROLES[number];

export async function POST(request: Request) {
    try {
        await connectDB();

        // 1. Authentication Check
        const authHeader = request.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Missing Authorization header" }, { status: 401 });
        }
        const token = authHeader.split(" ")[1];
        const payload = verifyAccessToken(token) as any;

        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // 2. Validate Target Role
        const { role: targetRole } = await request.json();
        if (!targetRole || !ALLOWED_ROLES.includes(targetRole as AllowedRole)) {
            return NextResponse.json({ error: "Invalid target role" }, { status: 400 });
        }

        // 3. Permission Check (Can this user switch roles?)
        const userPermissions = (Permissions as any)[payload.intelligenceLevel]?.[payload.role] ?? [];
        const canSwitch = userPermissions.includes("role:switch") || payload.role === "ADMIN";

        if (!canSwitch) {
            await AuditLog.create({
                action: "UNAUTHORIZED_ROLE_SWITCH",
                performedBy: payload.userId,
                details: { attemptedRole: targetRole },
                ip: request.headers.get("x-forwarded-for") || "unknown",
                userAgent: request.headers.get("user-agent") || "unknown",
            });
            return NextResponse.json({ error: "Forbidden: You are not authorized to switch roles" }, { status: 403 });
        }

        // 4. Update User Role and Roles Array – but do NOT elevate beyond stored roles
        const user = await User.findById(payload.userId);
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const existingRoles: string[] = user.roles && user.roles.length > 0 ? [...user.roles] : [user.role || "CUSTOMER"];

        // Only allow switching to a role the user already has
        if (!existingRoles.includes(targetRole)) {
            return NextResponse.json({ error: "Forbidden: You do not have this role assigned" }, { status: 403 });
        }

        user.roles = existingRoles;
        user.role = targetRole as any;
        user.markModified("roles");
        user.markModified("role");
        await user.save();

        // 5. Issue a new access token that reflects the updated primary role
        const newAccess = createAccessToken(user);

        const response = NextResponse.json({
            success: true,
            message: `Role switched to ${targetRole}`,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                roles: user.roles,
                intelligenceLevel: user.intelligenceLevel,
            },
        });

        // Update auth cookies
        setAuthCookies(response, newAccess);

        // 6. Audit Log
        await AuditLog.create({
            action: "ROLE_SWITCH",
            performedBy: user._id,
            details: { from: payload.role, to: targetRole },
            ip: request.headers.get("x-forwarded-for") || "unknown",
            userAgent: request.headers.get("user-agent") || "unknown",
        });

        return response;
    } catch (error: any) {
        console.error("Role switch error:", error);
        return NextResponse.json({ error: "Server error", message: error.message }, { status: 500 });
    }
}
