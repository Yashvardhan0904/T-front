import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import bcrypt from "bcryptjs";

/**
 * Seed Admin User
 * GET /api/seed-admin - Creates an admin user or promotes existing user to admin
 */
export async function GET() {
    try {
        await connectDB();

        const adminEmail = "admin@trendora.com";
        const adminPassword = "admin123";

        // Check if admin user already exists
        let adminUser = await User.findOne({ email: adminEmail });

        // Also check by ID from the logs if email match fails or just to be safe
        const logUserId = "693cf75eb96a932b3504801b";
        let logUser = await User.findOne({ _id: logUserId });

        if (logUser) {
            console.log("Found log user, upgrading...");
            logUser.role = "ADMIN";
            logUser.intelligenceLevel = "sophisticated";
            await logUser.save();
            console.log("Log user upgraded");
        }

        if (adminUser) {
            // Update to admin role if not already
            if (adminUser.role !== "ADMIN" || adminUser.intelligenceLevel !== "sophisticated") {
                adminUser.role = "ADMIN";
                adminUser.intelligenceLevel = "sophisticated";
                await adminUser.save();
            }

            return NextResponse.json({
                success: true,
                message: "Admin users updated/verified",
                credentials: {
                    email: adminEmail,
                    password: adminPassword,
                },
                upgradedLogUser: !!logUser
            });
        }

        // Create new admin user
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        adminUser = await User.create({
            name: "Admin",
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            intelligenceLevel: "sophisticated",
        });

        return NextResponse.json({
            success: true,
            message: "Admin user created successfully",
            credentials: {
                email: adminEmail,
                password: adminPassword,
            },
        });
    } catch (error: any) {
        console.error("Seed admin error:", error);
        return NextResponse.json(
            { success: false, message: error.message },
            { status: 500 }
        );
    }
}
