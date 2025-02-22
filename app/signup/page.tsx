"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import axios from "axios";

export default function SignUp() {
  const router = useRouter();
  const [user, setUser] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [error, setError] = useState("");

  const handleOnClick = (route: string) => {
    router.push(`/${route}`);
  };

  const onSignup = async () => {
    setError(""); // Clear previous errors
    try {
      await axios.post("/api/users/signup", user);
      router.push("/login"); // Redirect to login on successful signup
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError("Invalid input. Please check your details and try again.");
      } else if (error.response?.status === 409) {
        setError("An account with this email already exists. Please log in.");
      } else {
        setError("Signup failed. Please try again.");
      }
    }
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)]">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Image src="/Logo.svg" alt="LL logo" width={180} height={38} priority />
        <div className="text-left mb-8 mt-4">
          <div className="text-4xl font-bold mb-2">Luminosity LEDs</div>
          <div className="text-lg italic">Illuminate your creativity and expression</div>
          <div className="text-sm">Control lightning at your fingertips like never before</div>
        </div>

        {/* Signup Form */}
        <div className="w-full max-w-sm p-4 border rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Sign Up</h2>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="mb-4">
            <label htmlFor="name" className="block mb-1 text-sm font-medium">Name</label>
            <input
              id="name"
              type="text"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-1 text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block mb-1 text-sm font-medium">Password</label>
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
            onClick={onSignup}
            className="w-full bg-foreground text-background py-2 rounded-md hover:bg-[#383838] transition"
          >
            Sign Up
          </button>
          <div className="mt-4 text-sm text-center">
            Already have an account? <button type="button" onClick={() => handleOnClick("login")} className="text-blue-500 underline">Visit login page</button>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <button type="button" onClick={() => handleOnClick("about")} className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          <Image aria-hidden src="/file.svg" alt="File icon" width={16} height={16} /> About
        </button>
        <button type="button" onClick={() => handleOnClick("contact")} className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          <Image aria-hidden src="/globe.svg" alt="Globe icon" width={16} height={16} /> Contact
        </button>
        <button type="button" onClick={() => handleOnClick("help")} className="flex items-center gap-2 hover:underline hover:underline-offset-4">
          <Image aria-hidden src="/help.svg" alt="Help icon" width={16} height={16} /> Help
        </button>
      </footer>
    </div>
  );
}
