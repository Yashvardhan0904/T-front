import jwt from "jsonwebtoken";

// Environment variables for JWT secrets and expiry times
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const ACCESS_EXPIRES = "7d"; // Reasonable expiry for single-token setup

// Validate that secret is configured
if (!ACCESS_SECRET) {
    throw new Error("JWT_ACCESS_SECRET must be configured in environment variables");
}

/**
 * Create an access token
 * @param {Object} user - User object with id, email, name
 * @returns {string} Signed JWT token
 */
export function createAccessToken(user) {
    const payload = {
        userId: user._id || user.id,
        email: user.email,
        name: user.name,
        role: user.role, // Kept for backward compatibility
        roles: user.roles || [user.role], // Use roles array
        sellerProfileId: user.sellerProfileId || null,
        intelligenceLevel: user.intelligenceLevel,
    };

    return jwt.sign(payload, ACCESS_SECRET, {
        expiresIn: ACCESS_EXPIRES,
        issuer: "your-app-name",
        audience: "your-app-users",
    });
}

/**
 * Verify and decode an access token
 * @param {string} token - JWT token to verify
 * @returns {Object|null} Decoded payload or null if invalid
 */
export function verifyAccessToken(token) {
    try {
        const decoded = jwt.verify(token, ACCESS_SECRET, {
            issuer: "your-app-name",
            audience: "your-app-users",
        });
        return decoded;
    } catch (error) {
        console.error("Access token verification failed:", error.message);
        return null;
    }
}
