// app/middleware/authorize.ts
import { NextApiRequest, NextApiResponse, NextApiHandler } from "next";
import { Permissions } from "@/app/config/permissions";
import AuditLog from "@/lib/mongodb/models/AuditLog"; // ensure AuditLog model exists
import { verifyAccessToken } from "@/lib/auth/token";

interface JWTPayload {
    userId: string;
    role: string;
    roles?: string[];
    intelligenceLevel: string;
}

/**
 * Legacy authorize helper for old Next.js API routes.
 * Uses the same JWT verification logic as the rest of the app
 * via `verifyAccessToken` to avoid config drift.
 */
export const authorize = (requiredPermissions: string[]) => {
    return (handler: NextApiHandler) => async (req: NextApiRequest, res: NextApiResponse) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith("Bearer ")) {
                throw new Error("Missing Authorization header");
            }

            const token = authHeader.split(" ")[1];
            const decoded = verifyAccessToken(token) as JWTPayload | null;
            if (!decoded) {
                throw new Error("Invalid token");
            }

            const roles = decoded.roles && decoded.roles.length > 0 ? decoded.roles : [decoded.role];

            // Resolve effective permissions from map for all roles
            const p: any = Permissions;
            const effective = Array.from(
                new Set(
                    roles.flatMap((role) => p[decoded.intelligenceLevel]?.[role] || [])
                )
            );

            // Sophisticated admin gets wildcard
            if (roles.includes("ADMIN") && decoded.intelligenceLevel === "sophisticated") {
                effective.push("*");
            }

            const hasAll = requiredPermissions.every(
                (perm) => effective.includes(perm) || effective.includes("*")
            );

            if (!hasAll) {
                await AuditLog.create({
                    action: "UNAUTHORIZED_ACCESS",
                    performedBy: decoded.userId,
                    details: {
                        endpoint: req.url,
                        required: requiredPermissions,
                        effective,
                    },
                    ip: req.headers["x-forwarded-for"]?.toString() ?? req.socket.remoteAddress ?? "",
                    userAgent: req.headers["user-agent"] ?? "",
                });
                return res.status(403).json({ error: "Forbidden" });
            }

            // Attach user info to request for downstream handlers
            (req as any).user = decoded;
            return handler(req, res);
        } catch (err) {
            console.error("Authorization error:", err);
            return res.status(401).json({ error: "Invalid token" });
        }
    };
};
