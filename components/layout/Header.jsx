"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";

function Header() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const MenuList = [
    { name: "Home", link: "/" },
    { name: "Products", link: "/products" },
    { name: "About us", link: "/about-us" },
    { name: "Deals", link: "/deals" }
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    router.push("/");
  };

  return (
    <nav className="py-4 px-10 border-b shadow-lg flex items-center justify-between">
      <img className="h-8" src="/logo.png" alt="logo" />
      <div className="flex items-center gap-6 font-semibold">
        {MenuList.map((item) => (
          <Link href={item.link} key={item.name}>
            <button className="hover:text-blue-600">{item.name}</button>
          </Link>
        ))}
      </div>

      {/* Show loading state while checking auth */}
      {loading ? (
        <div className="w-20 h-8 bg-gray-200 animate-pulse rounded-full"></div>
      ) : user ? (
        // User is logged in - show profile
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <FaUserCircle className="text-blue-600 text-3xl" />
            <span className="font-semibold text-sm">{user.name}</span>
          </button>

          {/* Dropdown menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b">
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 font-semibold transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        // User is logged out - show login button
        <Link href="/login">
          <button className="bg-blue-600 px-5 py-1 font-bold text-amber-50 rounded-full">
            Login
          </button>
        </Link>
      )}
    </nav>
  );
}

export default Header;
