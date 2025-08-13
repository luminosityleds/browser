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
  const [success, setSuccess] = useState(false); // State to manage the success popup visibility

  const handleOnClick = (route: string) => {
    router.push(`/${route}`);
  };

  const onSignup = async () => {
    setError(""); // Clear previous errors
    try {
      await axios.post("/api/users/signup", user);
      setSuccess(true); // Show success popup on successful signup
      setTimeout(() => {
        setSuccess(false); // Hide the popup after 3 seconds
        router.push("/login"); // Redirect to login page
      }, 3000);
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800">
      <main className="text-center w-full max-w-2xl">
        <Image src="/Logo.svg" alt="LL logo" width={180} height={38} priority />
        <h1 className="text-4xl font-bold mt-6 text-white">Luminosity LEDs</h1>
        <p className="italic text-white">Illuminate your creativity and expression</p>
        <p className="text-sm text-white">Control lightning at your fingertips like never before</p>

        <div className="flex flex-col items-center justify-center bg-blue-100 p-6 max-w-lg mx-auto mt-10 rounded-xl shadow-lg">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
            <h2 className="text-2xl font-semibold mb-6 text-black">Sign Up</h2>

            {error && (
              <div className="mb-4 p-3 text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}

            <div className="mb-4 text-left">
              <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={user.name}
                onChange={(e) => setUser({ ...user, name: e.target.value })}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border rounded-md focus:outline-none text-black"
              />
            </div>

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
              onClick={onSignup}
              className={`w-full bg-foreground text-background py-2 rounded-md hover:bg-[#49ca7a] transition`}
            >
              Sign Up
            </button>

            <div className="mt-4 text-sm text-center text-red-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => handleOnClick("login")}
                className="text-blue-500 underline"
              >
                Visit login page
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

      {/* Success Popup */}
      {success && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm text-center">
            <h3 className="text-lg font-semibold text-green-600">Registration Successful!</h3>
            <p className="mt-2 text-black">You can now log in to your account.</p>
            <button
              onClick={() => setSuccess(false)}
              className="mt-4 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
