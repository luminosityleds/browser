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
  const [error, setError] = useState<string | null>(null);

  const handleOnClick = (route: string) => {
    router.push(`/${route}`);
  };

  const onLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post("/api/users/login", user);
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login failed", error.response?.data?.error || error.message);
      setError(error.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800">
      <main className="text-center w-full max-w-2xl">
        <Image src="/Logo.svg" alt="LL logo" width={180} height={38} priority />
        <h1 className="text-4xl font-bold mt-6 text-white">Luminosity LEDs</h1>
        <p className="italic text-white">Illuminate your creativity and expression</p>
        <p className="text-sm text-white">Control lightning at your fingertips like never before</p>

        <div className="flex flex-col items-center justify-center bg-blue-100 p-6 max-w-lg mx-auto mt-10 rounded-xl shadow-lg">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-black">Login</h2>

            {error && (
              <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-4 text-left">
              <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
              />
            </div>

            <div className="mb-6 text-left">
              <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                placeholder="Enter your password"
                className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
              />
            </div>

            <button
              onClick={onLogin}
              className={`w-full bg-foreground text-background py-2 rounded-md hover:bg-[#49ca7a] transition ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={loading}
            >
              {loading ? "Processing..." : "Login"}
            </button>

            <div className="mt-4 text-sm text-center text-red-500">
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
        </div>
      </main>

      <footer className="mt-10 flex gap-6 flex-wrap items-center justify-center text-white">
        <button
          type="button"
          onClick={() => handleOnClick("about")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image src="/file.svg" alt="File icon" width={16} height={16} />
          About
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("contact")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image src="/globe.svg" alt="Globe icon" width={16} height={16} />
          Contact
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("help")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image src="/help.svg" alt="Help icon" width={16} height={16} />
          Help
        </button>
      </footer>
    </div>
  );
}
