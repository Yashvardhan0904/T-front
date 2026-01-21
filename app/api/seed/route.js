import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        // Connect to database
        await connectDB();

        // Sample user credentials
        const sampleEmail = "sample@example.com";
        const samplePassword = "password123";

        // Check if sample user already exists
        const existingUser = await User.findOne({ email: sampleEmail });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: true,
                    message: "Sample user already exists",
                    credentials: {
                        email: sampleEmail,
                        password: samplePassword,
                    },
                },
                { status: 200 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(samplePassword, salt);

        // Create sample user
        const sampleUser = await User.create({
            name: "Sample User",
            email: sampleEmail,
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Sample user created successfully",
                credentials: {
                    email: sampleEmail,
                    password: samplePassword,
                },
                user: {
                    id: sampleUser._id,
                    name: sampleUser.name,
                    email: sampleUser.email,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json(
            { success: false, message: "Error seeding database", error: error.message },
            { status: 500 }
        );
    }
}
