"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: any) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-inter)] bg-gray-100">
      <main className="text-center">
        {/* Logo */}
        <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />

        {/* Slogan */}
        <div className="mt-6">
          <h1 className="text-4xl font-bold">Luminosity LEDs</h1>
          <p className="text-lg italic mt-2">
            Illuminate your creativity and expression
          </p>
          <p className="text-sm">
            Control lighting at your fingertips like never before
          </p>
        </div>

        {/* Logout Button */}
        <button
          onClick={logout}
          className="mt-8 px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
        >
          Logout
        </button>
      </main>
    </div>
  );
}
