"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";

export default function Page() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match" });
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setMessage({ type: "error", text: "Password must be at least 6 characters" });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message + " You can now login!" });
        // Reset form
        setFormData({ name: "", email: "", password: "", confirmPassword: "" });
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex justify-center items-center bg-gray-100 px-4 py-8">
      <section className="flex flex-col items-center gap-6 w-full max-w-sm">

        {/* Logo */}
        <img src="/logo.png" className="h-20" alt="logo" />

        {/* Card */}
        <div className="bg-white w-full rounded-xl p-6 flex flex-col gap-6 shadow-lg border">

          <h2 className="text-xl font-semibold text-center">Create Account</h2>

          {/* Message Display */}
          {message.text && (
            <div
              className={`p-3 rounded-lg text-sm ${message.type === "success"
                ? "bg-green-100 text-green-800 border border-green-300"
                : "bg-red-100 text-red-800 border border-red-300"
                }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              placeholder="Enter your Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <input
              placeholder="Enter your Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <input
              placeholder="Create Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <input
              placeholder="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white w-full py-2 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </Button>

            <div className="relative flex items-center gap-2">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-sm text-gray-500">or</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            <Link href="/api/auth/google" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full flex items-center justify-center gap-2 py-2"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </Button>
            </Link>

            <div className="text-center text-sm text-gray-600 mt-2">
              Already have an account?
            </div>

            {/* Login Link */}
            <Link href="/login" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                Login
              </Button>
            </Link>

          </form>

        </div>
      </section>
    </main>
  );
}
