"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import axios from "axios";
import { getTextColorClass } from "../utils/getTextColorClass";

export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [devices, setDevices] = useState<any[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<any | null>(null);
  const [editValues, setEditValues] = useState({ name: "", color: "Red", brightness: 100, powered: false });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/users/me");
        const user = response.data.data;
        if (user && user._id) {
          setUserId(user._id);
          const deviceRes = await axios.get("/api/users/dashboard");
          setDevices(deviceRes.data.devices);
        } else {
          throw new Error("User ID not found");
        }
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  useEffect(() => {
    if (selectedDeviceId) {
      const device = devices.find((d) => d._id === selectedDeviceId);
      setSelectedDevice(device);
      setEditValues({
        name: device?.name || "",
        color: device?.color || "Red",
        brightness: device?.brightness || 100,
        powered: device?.powered || false,
      });
    }
  }, [selectedDeviceId, devices]);

  const handleDeviceUpdate = async () => {
    try {
      await axios.put("/api/users/dashboard", {
        id: selectedDeviceId,
        ...editValues,
      });
      alert("Device updated successfully");
      const updatedDevices = await axios.get("/api/users/dashboard");
      setDevices(updatedDevices.data.devices);
    } catch (err: any) {
      console.error("Failed to update device:", err);
      alert("Failed to update device");
    }
  };

  const handleDeviceDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this device?");
    if (!confirmDelete) return;
  
    try {
      await axios.delete("/api/users/dashboard", {
        data: { deviceId: selectedDeviceId },
      });
      alert("Device deleted successfully");
  
      // Refresh devices list
      const updatedDevices = await axios.get("/api/users/dashboard");
      setDevices(updatedDevices.data.devices);
      setSelectedDeviceId(""); // clear selection
    } catch (err: any) {
      console.error("Failed to delete device:", err);
      alert("Failed to delete device");
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: any) {
      console.log("Error logging out:", error.message);
    }
  };

  const registerDevice = () => router.push("/device");

  const deleteAccount = async () => {
    const confirmDelete = confirm("Are you sure you want to delete your account? This action cannot be undone.");
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
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800">
      <main className="text-center w-full max-w-2xl">
        <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />
        <h1 className="text-4xl font-bold mt-6">Luminosity LEDs</h1>
        <p className="italic">Illuminate your creativity and expression</p>

        {devices.length === 0 ? (
            <div className="mt-6 text-white flex items-center gap-2 bg-stone-950 p-4 rounded shadow">
              <p className="font-medium">No devices found. Please register a device.</p>
              <span className="text-xl">⚠️</span>
            </div>
        ) : (
          <div className="text-black mt-6">
            <label className="block text-white mb-2">Select Device</label>
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="w-full p-2 rounded"
            >
              <option value="">-- Choose a Device to Update --</option>
              {devices.map((device) => (
                <option key={device._id} value={device._id}>
                  {device.name}
                </option>
              ))}
            </select>

            {selectedDevice && (
              <div className="mt-6 bg-blue-100 p-4 text-left">
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />
                <label className="block mb-2">Color</label>
                <select
                  value={editValues.color}
                  onChange={(e) => setEditValues({ ...editValues, color: e.target.value })}
                  className={`w-full p-2 border rounded mb-4 ${getTextColorClass(editValues.color)}`}
                >
                  <option value="Red">Red</option>
                  <option value="Green">Green</option>
                  <option value="Blue">Blue</option>
                  <option value="Purple">Purple</option>
                  <option value="Yellow">Yellow</option>
                  <option value="Orange">Orange</option>
                  <option value="White">White</option>
                  <option value="Black">Black</option>
                </select>

                <label className="block mb-2">Brightness ({editValues.brightness}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editValues.brightness}
                  onChange={(e) => setEditValues({ ...editValues, brightness: parseInt(e.target.value) })}
                  className="w-full mb-4"
                />

                <label className="block mb-2">Powered</label>
                <input
                  type="checkbox"
                  checked={editValues.powered}
                  onChange={(e) => setEditValues({ ...editValues, powered: e.target.checked })}
                />

                <button
                  onClick={handleDeviceUpdate}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                >
                  Update Device
                </button>
                <button
                onClick={handleDeviceDelete}
                className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700"
                >
                  Delete Device
                </button>

              </div>
            )}
          </div>
        )}

        <div className="mt-10 space-y-2">
          <button
            onClick={logout}
            className="w-full py-2 bg-yellow-500 text-white font-semibold rounded hover:bg-yellow-600"
          >
            Logout
          </button>
          <button
            onClick={deleteAccount}
            className="w-full py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
          >
            Delete Account
          </button>
          <button
            onClick={registerDevice}
            className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700"
          >
            Register New Device
          </button>
        </div>
      </main>
    </div>
  );
}
