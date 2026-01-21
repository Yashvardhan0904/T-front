"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function Page() {
  const { login, user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get("redirect") || "/";
      router.push(redirect);
    }
  }, [user, authLoading, router]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-amber-500"></div>
      </div>
    );
  }

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

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: "success", text: data.message });
        // Update global auth state immediately
        login(data.user);

        setFormData({ email: "", password: "" });
        setTimeout(() => {
          router.push("/");
        }, 500);
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
    <main className="min-h-screen w-full flex justify-center items-center bg-gray-100 px-4">
      <section className="flex flex-col items-center gap-6 w-full max-w-sm">

        <img src="/logo.png" className="h-20" alt="logo" />

        <div className="bg-white w-full rounded-xl p-6 flex flex-col gap-6 shadow-lg border">

          <h2 className="text-xl font-semibold text-center">Welcome Back</h2>

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
              placeholder="Enter your Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <input
              placeholder="Enter your Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring focus:ring-amber-300"
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white w-full py-2 disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Link href="/forget-password" className="w-full">
              <Button
                type="button"
                variant="outline"
                className="w-full border-amber-300 text-amber-600 hover:bg-amber-50"
              >
                Forget Password
              </Button>
            </Link>

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
              New here?
            </div>

            <Link href="/create-account" className="w-full">
              <Button
                type="button"
                className="bg-amber-500 hover:bg-amber-600 text-white w-full py-2"
              >
                Create Account
              </Button>
            </Link>

          </form>

        </div>
      </section>
    </main>
  );
}
