"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null); // State to store the user ID

  // Fetch the user ID from the /me endpoint
  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const response = await axios.get("/api/users/me");
        const user = response.data.data;

        if (user && user._id) {
          setUserId(user._id); // Set the user ID from the response
        } else {
          throw new Error("User ID not found");
        }
      } catch (error: any) {
        console.error("Error fetching user ID:", error.message);
        router.push("/login"); // Redirect to login if the user is not authenticated
      }
    };

    fetchUserId();
  }, [router]);

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: any) {
      console.log("Error logging out:", error.message);
    }
  };

  const deleteAccount = async () => {
    const confirmDelete = confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      if (!userId) {
        alert("User ID not found. Please log in again.");
        router.push("/login");
        return;
      }

      await axios.delete("/api/users/deleteAccount", { data: { userId } });
      alert("Your account has been deleted.");
      router.push("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 font-[family-name:var(--font-inter)] bg-gray-800">
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
          className="mt-8 px-6 py-2 bg-yellow-500 text-white font-semibold rounded-md hover:bg-yellow-600 transition"
        >
          Logout
        </button>

        {/* Delete Account Button */}
        <button
          onClick={deleteAccount}
          className="mt-4 px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
        >
          Delete Account
        </button>
      </main>
    </div>
  );
}
