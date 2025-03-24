"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { getTextColorClass } from "../utils/getTextColorClass";

export default function DevicePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState("");
  const [color, setColor] = useState("Red");
  const [brightness, setBrightness] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const colors = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange", "White", "Black"];

  const handleRegisterDevice = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await axios.post(
        "/api/users/devices",
        { name: deviceName, color, brightness },
        { withCredentials: true }
      );

      setSuccess("Device registered successfully!");
      setDeviceName("");
      setColor("Red");
      setBrightness(100);

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to register device.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800">
    <main className="text-center w-full max-w-2xl">
      <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />
        <h1 className="text-4xl font-bold mt-6">Luminosity LEDs</h1>
        <p className="italic">Illuminate your creativity and expression</p>
        <div className="flex flex-col items-center justify-center max-h-lg bg-blue-100 p-6 max-w-lg mx-auto mt-10 rounded-xl shadow-lg">
          <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
            <h1 className="text-black text-3xl font-bold text-center mb-6">Register Device</h1>

            {error && <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
            {success && <div className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{success}</div>}

            {/* Device Name Input */}
            <label className="block text-gray-700 font-semibold mb-2">Device Name</label>
            <input
              type="text"
              placeholder="Enter device name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="text-gray-700 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />

            {/* Color Selection Dropdown */}
            <label className="block text-gray-700 font-semibold mb-2">Starting Color</label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4 ${getTextColorClass(color)}`}
            >
              {colors.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Brightness Slider */}
            <label className="block text-gray-700 font-semibold mb-2">Starting Brightness: {brightness}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full mb-4"
            />

            {/* Register Button */}
            <button
              onClick={handleRegisterDevice}
              disabled={loading || !deviceName}
              className={`w-full py-3 text-white font-bold rounded-lg transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Registering..." : "Register Device"}
            </button>

            {/* Back to Dashboard */}
            <p className="text-center text-sm text-gray-600 mt-4">
              <button className="text-blue-500 underline" onClick={() => router.push("/dashboard")}>
                Back to Dashboard
              </button>
            </p>
          </div>
          </div>
      </main>
      </div>
  );
}
