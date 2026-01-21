import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import { createAccessToken } from "@/lib/auth/token";
import { setAuthCookies } from "@/lib/auth/cookies";
import { cookies } from "next/headers";

export async function GET(request) {
    console.log("\n🔵 ========== GOOGLE OAUTH CALLBACK TRIGGERED (Refactored) ==========");

    try {
        // Step 1: Get code and state from query parameters
        const { searchParams } = new URL(request.url);
        const code = searchParams.get("code");
        const returnedState = searchParams.get("state");
        console.log(`🔵 Step 1: Code received: ${code ? "✅ YES" : "❌ NO"}`);
        console.log(`🔵 Step 1: State received: ${returnedState ? "✅ YES" : "❌ NO"}`);

        if (!code) {
            console.error("❌ No authorization code received from Google");
            return NextResponse.redirect(new URL("/login?error=no_code", request.url));
        }

        // Step 1.5: Validate state parameter (CSRF protection)
        console.log("🔵 Step 1.5: Validating state parameter...");

        // Use standard Next.js cookies API
        const cookieStore = await cookies();
        const storedState = cookieStore.get("oauth_state")?.value;
        const storedVerifier = cookieStore.get("oauth_verifier")?.value;

        console.log(`   - Stored state: ${storedState ? "✅ Present" : "❌ Missing"}`);
        console.log(`   - Stored verifier: ${storedVerifier ? "✅ Present" : "❌ Missing"}`);

        if (!storedState || storedState !== returnedState) {
            console.error(`❌ State mismatch! Expected: ${storedState?.substring(0, 10)}..., Got: ${returnedState?.substring(0, 10)}...`);
            console.log("   This can happen if:");
            console.log("   - OAuth initiated from different browser/device");
            console.log("   - Cookies expired (10 min timeout)");
            console.log("   - CSRF attack attempt");
            return NextResponse.redirect(new URL("/login?error=state_mismatch", request.url));
        }
        console.log("✅ Step 1.5: State validated successfully");

        // Step 2: Exchange code for access token (with PKCE if available)
        console.log("🔵 Step 2: Exchanging code for access token...");
        console.log(`   - Client ID: ${process.env.GOOGLE_CLIENT_ID ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Client Secret: ${process.env.GOOGLE_CLIENT_SECRET ? "✅ Set" : "❌ Missing"}`);
        console.log(`   - Redirect URI: ${process.env.GOOGLE_REDIRECT_URI}`);

        const tokenParams = new URLSearchParams({
            code,
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
            grant_type: "authorization_code",
        });

        // Add PKCE verifier if present
        if (storedVerifier) {
            tokenParams.set("code_verifier", storedVerifier);
            console.log("✅ PKCE verifier included in token exchange");
        } else {
            console.warn("⚠️ WARNING: No PKCE verifier found. This might fail if Google expects it.");
        }

        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: tokenParams,
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error(`❌ Token exchange failed: ${errorText}`);
            return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
        }

        const tokenData = await tokenResponse.json();
        const { access_token } = tokenData;
        console.log("✅ Step 2: Access token received successfully");

        // Step 3: Fetch user profile from Google
        console.log("🔵 Step 3: Fetching user profile from Google...");
        const profileResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            console.error(`❌ Profile fetch failed: ${errorText}`);
            return NextResponse.redirect(new URL("/login?error=profile_fetch_failed", request.url));
        }

        const googleUser = await profileResponse.json();
        console.log("✅ Step 3: Google profile fetched successfully");
        console.log(`   - Name: ${googleUser.name}`);
        console.log(`   - Email: ${googleUser.email}`);
        console.log(`   - Google ID: ${googleUser.id}`);

        // Step 4: Connect to MongoDB
        console.log("🔵 Step 4: Connecting to MongoDB...");
        const mongoose = await connectDB();
        console.log(`✅ Step 4: MongoDB connected to database: ${mongoose.connection.db.databaseName}`);

        // Ensure connection is ready
        if (!mongoose.connection.db) {
            throw new Error("MongoDB connection failed or is not ready.");
        }

        const userCollectionName = User.collection.name;
        console.log(`   - User collection: ${userCollectionName}`);

        // Step 5: Check if user exists in database...
        console.log("🔵 Step 5: Checking if user exists in database...");
        let user = await User.findOne({
            $or: [
                { email: googleUser.email },
                { provider: "google", providerId: googleUser.id }
            ]
        });

        // AUTO-MIGRATION: If not found in 'customer', check legacy 'users'
        if (!user) {
            console.log(`🔍 User ${googleUser.email} not found in '${userCollectionName}', checking legacy 'users'...`);
            try {
                const legacyUser = await mongoose.connection.db.collection('users').findOne({
                    $or: [
                        { email: googleUser.email },
                        { provider: "google", providerId: googleUser.id }
                    ]
                });

                if (legacyUser) {
                    console.log(`🚀 Found ${googleUser.email} in legacy collection. Migrating to '${userCollectionName}'...`);
                    // Ensure we don't insert duplicate ID if it somehow exists
                    delete legacyUser._id;

                    // Create new user valid for current schema
                    user = await User.create({
                        ...legacyUser,
                        email: googleUser.email, // Ensure email matches
                        provider: "google",
                        providerId: googleUser.id,
                    });

                    console.log(`✅ Migration complete for ${googleUser.email}`);
                }
            } catch (migErr) {
                console.warn(`⚠️ Legacy migration check failed: ${migErr.message}`);
            }
        }

        if (user) {
            console.log("✅ Step 5: Existing user found");
            console.log(`   - User ID: ${user._id}`);

            // User exists - update if needed
            let needsUpdate = false;
            if (user.provider !== "google") {
                console.log("🔵 Step 5a: Linking Google account to existing credentials user...");
                user.provider = "google";
                user.providerId = googleUser.id;
                needsUpdate = true;
            }
            if (!user.avatar && googleUser.picture) {
                user.avatar = googleUser.picture;
                needsUpdate = true;
            }

            if (needsUpdate) {
                await user.save();
                console.log("✅ Step 5a: User updated with Google info");
            }
        } else {
            // Step 6: Create new user
            console.log("🔵 Step 6: Creating new user in database...");

            try {
                user = await User.create({
                    name: googleUser.name,
                    email: googleUser.email,
                    provider: "google",
                    providerId: googleUser.id,
                    avatar: googleUser.picture,
                    roles: ["CUSTOMER"], // Default role
                });
                console.log("✅ Step 6: New user created successfully!");
                console.log(`   - New User ID: ${user._id}`);
            } catch (createError) {
                console.error(`❌ Step 6: User creation failed: ${createError.message}`);
                throw createError;
            }
        }

        // Step 6.4: Resolve and normalize roles (Enterprise Identity)
        console.log("🔵 Step 6.4: Resolving roles...");
        const { isAdminEmail } = await import("@/lib/config/adminEmails");

        let roles = user.roles && user.roles.length > 0 ? [...user.roles] : [];
        if (user.role && !roles.includes(user.role)) roles.push(user.role);

        if (isAdminEmail(user.email)) {
            if (!roles.includes("ADMIN")) roles.push("ADMIN");
            console.log("✅ Admin role detected via email");
        } else if (roles.length === 0) {
            roles.push("CUSTOMER");
        }

        // Standardize legacy role string for compatibility
        user.roles = roles;
        user.role = roles.includes("ADMIN") ? "ADMIN" : (roles.includes("SELLER") ? "SELLER" : roles[0] || "CUSTOMER");
        // We will save these changes in Step 8
        console.log(`✅ Roles resolved: ${user.roles.join(', ')}`);


        // Step 7: Generate JWT token
        console.log("🔵 Step 7: Generating access token...");
        const accessToken = createAccessToken(user);
        console.log("✅ Step 7: Access token generated");

        // Step 8: Save user changes (Enterprise Identity)
        console.log("🔵 Step 8: Saving user data...");
        await user.save();
        console.log(`✅ Step 8: User data saved.`);

        // Step 9: Create response and set cookies
        console.log("🔵 Step 9: Setting authentication cookies...");
        const response = NextResponse.redirect(new URL("/", request.url));
        setAuthCookies(response, accessToken);

        // Clear OAuth state cookies (security: one-time use)
        // Note: With next/headers cookies(), we can't easily delete effectively in the response object 
        // in the same way as setting them, but since we are redirecting, the response cookies work fine.
        response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
        response.cookies.set("oauth_verifier", "", { maxAge: 0, path: "/" });

        console.log("✅ Step 9: Cookies set successfully, OAuth cookies cleared");

        console.log("🎉 ========== GOOGLE OAUTH COMPLETE - REDIRECTING TO / ==========\n");
        return response;

    } catch (error) {
        console.error("\n❌ ========== GOOGLE OAUTH CALLBACK ERROR ==========");
        console.error(`Error name: ${error.name}`);
        console.error(`Error message: ${error.message}`);
        console.error(`Error stack: ${error.stack}`);
        console.error("====================================================\n");
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    }
}

