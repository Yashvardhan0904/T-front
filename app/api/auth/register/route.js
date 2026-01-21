import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb/mongodb";
import User from "@/lib/mongodb/models/User";
import bcrypt from "bcryptjs";
import { createAccessToken } from "@/lib/auth/token";
import { setAuthCookies } from "@/lib/auth/cookies";

export async function POST(request) {
    try {
        // Connect to database
        await connectDB();

        // Parse request body
        const { name, email, password } = await request.json();

        // Validate input
        if (!name || !email || !password) {
            return NextResponse.json(
                { success: false, message: "All fields are required" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists with this email" },
                { status: 400 }
            );
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user (roles & intelligenceLevel defaults come from schema)
        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
        });

        // Generate tokens
        const accessToken = createAccessToken(newUser);

        // Create response
        const response = NextResponse.json(
            {
                success: true,
                message: "Account created successfully",
                user: {
                    id: newUser._id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    roles: newUser.roles,
                    intelligenceLevel: newUser.intelligenceLevel,
                },
            },
            { status: 201 }
        );

        // Set auth cookies
        setAuthCookies(response, accessToken);

        return response;
    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { success: false, message: "Server error. Please try again." },
            { status: 500 }
        );
    }
}
