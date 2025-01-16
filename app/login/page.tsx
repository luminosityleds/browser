"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); // State for error messages

  const handleOnClick = (route: string) => {
    router.push(`/${route}`);
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error before attempting login
      const response = await axios.post("/api/users/login", user);
      router.push("/dashboard"); // Redirect to homepage on successful login
    } catch (error: any) {
      console.error("Login failed", error.response?.data?.error || error.message);
      setError(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)]">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Image
          src="/Logo.svg"
          alt="LL logo"
          width={180}
          height={38}
          priority
        />

        <div className="text-left mb-8 mt-4">
          <div className="text-4xl font-bold mb-2">Luminosity LEDs</div>
          <div className="text-lg italic">
            Illuminate your creativity and expression
          </div>
          <div className="text-sm">
            Control lightning at your fingertips like never before
          </div>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm p-4 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Login</h2>

          {error && (
            <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) =>
                setUser({ ...user, email: e.target.value })
              }
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block mb-1 text-sm font-medium"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={user.password}
              onChange={(e) =>
                setUser({ ...user, password: e.target.value })
              }
              placeholder="Enter your password"
              className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
            />
          </div>
          <button
            onClick={onLogin}
            className={`w-full bg-foreground text-background py-2 rounded-md hover:bg-[#383838] transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Processing..." : "Login"}
          </button>
          <div className="mt-4 text-sm text-center">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => handleOnClick("signup")}
              className="text-blue-500 underline"
            >
              Visit signup page
            </button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <button
          type="button"
          onClick={() => handleOnClick("about")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          About
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("contact")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Contact
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("help")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/help.svg"
            alt="Help icon"
            width={16}
            height={16}
          />
          Help
        </button>
      </footer>
    </div>
  );
}
