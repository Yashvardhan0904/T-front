import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import bcrypt from "bcryptjs";
import { createAccessToken } from "@/lib/auth/token";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request) {
    console.log("\n🔵 ========== CREDENTIALS LOGIN ATTEMPT ==========");

    try {
        // Connect to database
        console.log("🔵 Step 1: Connecting to MongoDB...");
        await connectDB();
        console.log("✅ Step 1: Connected to MongoDB");

        // Parse request body
        const { email, password } = await request.json();
        console.log(`🔵 Step 2: Processing login for email: ${email}`);

        // Validate input
        if (!email || !password) {
            console.error("❌ Step 2: Validaton failed - missing email or password");
            return NextResponse.json(
                { success: false, message: "Email and password are required" },
                { status: 400 }
            );
        }

        // Find user by email (currently points to 'customer' collection)
        console.log("🔵 Step 3: Finding user in database...");
        let user = await User.findOne({ email });

        // AUTO-MIGRATION: If not found in 'customer', check legacy 'users'
        if (!user) {
            console.log(`🔍 User ${email} not found in 'customer', checking legacy 'users' collection...`);
            const mongooseInstance = await connectDB();
            if (mongooseInstance.connection.db) {
                const legacyUser = await mongooseInstance.connection.db.collection('users').findOne({ email });

                if (legacyUser) {
                    console.log(`🚀 Found ${email} in legacy collection. Migrating to 'customer'...`);
                    // Inject into 'customer' collection
                    await mongooseInstance.connection.db.collection('customer').insertOne(legacyUser);

                    // Now find it via Mongoose
                    user = await User.findOne({ email });
                    console.log(`✅ Migration complete for ${email}`);
                }
            }
        }

        if (!user) {
            console.error("❌ Step 3: User not found");
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }

        // Verify password
        console.log("🔵 Step 4: Verifying password...");
        if (!user.password && user.provider === 'google') {
            console.error("❌ Step 4: User has Google account but tried password login");
            return NextResponse.json(
                { success: false, message: "Please use Google login for this account" },
                { status: 401 }
            );
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.error("❌ Step 4: Invalid password");
            return NextResponse.json(
                { success: false, message: "Invalid email or password" },
                { status: 401 }
            );
        }
        console.log("✅ Step 4: Password verified");

        // Detect and set roles (Enterprise Identity)
        console.log("🔵 Step 5: resolving roles...");
        const { isAdminEmail } = await import("@/lib/config/adminEmails");

        let roles = user.roles && user.roles.length > 0 ? [...user.roles] : [];
        if (user.role && !roles.includes(user.role)) roles.push(user.role);

        if (isAdminEmail(user.email)) {
            if (!roles.includes("ADMIN")) roles.push("ADMIN");
        } else if (roles.length === 0) {
            roles.push("CUSTOMER");
        }

        // Standardize legacy role string for compatibility
        user.roles = roles;
        user.role = roles.includes("ADMIN") ? "ADMIN" : (roles.includes("SELLER") ? "SELLER" : roles[0] || "CUSTOMER");
        user.markModified('roles');
        user.markModified('role');

        // Generate tokens
        console.log("🔵 Step 6: Generating access token...");
        const accessToken = createAccessToken(user);

        console.log(`✅ Login successful for ${user.email}`);

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    roles: user.roles,
                    intelligenceLevel: user.intelligenceLevel,
                },
            },
            { status: 200 }
        );

        // Set auth cookies
        setAuthCookies(response, accessToken);

        return response;
    } catch (error) {
        console.error(`❌ SERVER ERROR: ${error.message}`);
        console.error(`Stack: ${error.stack}`);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again." },
            { status: 500 }
        );
    }
}

