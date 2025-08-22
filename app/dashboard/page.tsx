"use client";

import React, { useEffect, useRef, useState } from "react";

import Image from "next/image";
import { LogOut } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

// ------------------ Types ------------------
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Device {
  _id: string;
  name: string;
  color: string;       // Only the named color is stored
  brightness: number;
  powered: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

// ------------------ Color Map ------------------
const colorMap: Record<string, string> = {
  Red: "#ff0000",
  Green: "#00ff00",
  Blue: "#0000ff",
  Yellow: "#ffff00",
  Purple: "#800080",
  Orange: "#ffa500",
  White: "#ffffff",
  Black: "#000000",
};

// ------------------ Utility Functions ------------------
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}

function hexToRgb(hex: string): RGB | null {
  const match = hex.replace("#", "").match(/^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!match) return null;
  return { r: parseInt(match[1], 16), g: parseInt(match[2], 16), b: parseInt(match[3], 16) };
}

function closestColorName(hex: string, colorMap: Record<string, string>): string {
  const target = hexToRgb(hex);
  if (!target) return "Red";

  let closest = "Red";
  let minDist = Infinity;

  for (const [name, mapHex] of Object.entries(colorMap)) {
    const rgb = hexToRgb(mapHex)!;
    const dist = Math.pow(target.r - rgb.r, 2) + Math.pow(target.g - rgb.g, 2) + Math.pow(target.b - rgb.b, 2);
    if (dist < minDist) {
      minDist = dist;
      closest = name;
    }
  }
  return closest;
}

// ------------------ Dashboard Component ------------------
export default function Dashboard() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [devices, setDevices] = useState<Device[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [editValues, setEditValues] = useState<Omit<Device, "_id">>({
    name: "",
    color: "Red",
    brightness: 100,
    powered: false,
  });
  const [loading, setLoading] = useState(true);

  const [colorHex, setColorHex] = useState("#ff0000");
  const [colorRgb, setColorRgb] = useState<RGB>({ r: 255, g: 0, b: 0 });
  const [hexInput, setHexInput] = useState("#ff0000");
  const lastChangeSource = useRef<"hex" | "rgb" | null>(null);
  const hiddenColorInput = useRef<HTMLInputElement | null>(null);

  // ------------------ Fetch User + Devices ------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<{ data: User }>("/api/users/me");
        const user = response.data.data;

        if (user && user._id) {
          setUserId(user._id);
          const deviceRes = await axios.get<{ devices: Device[] }>("/api/users/dashboard");
          setDevices(deviceRes.data.devices);
        } else {
          throw new Error("User ID not found");
        }
      } catch (error: unknown) {
        if (error instanceof Error) console.error("Error fetching data:", error.message);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  // ------------------ Selected Device ------------------
  useEffect(() => {
    if (!selectedDeviceId) return;

    const device = devices.find(d => d._id === selectedDeviceId) || null;
    setSelectedDevice(device);

    if (device) {
      setEditValues({
        name: device.name,
        color: device.color,
        brightness: device.brightness,
        powered: device.powered,
      });

      const hex = colorMap[device.color] || "#ff0000";
      setColorHex(hex);
      setColorRgb(hexToRgb(hex)!);
      setHexInput(hex);
    }
  }, [selectedDeviceId, devices]);

  // ------------------ HEX ↔ RGB Sync ------------------
  useEffect(() => {
    if (lastChangeSource.current === "hex") {
      const rgb = hexToRgb(colorHex);
      if (rgb) setColorRgb(rgb);
      lastChangeSource.current = null;
    }
    setHexInput(colorHex);
  }, [colorHex]);

  useEffect(() => {
    if (lastChangeSource.current === "rgb") {
      const hex = rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b);
      if (hex.toLowerCase() !== colorHex.toLowerCase()) setColorHex(hex);
      lastChangeSource.current = null;
    }
  }, [colorRgb, colorHex]);

  // ------------------ Actions ------------------
  const handleDeviceUpdate = async () => {
    try {
      const colorName = closestColorName(colorHex, colorMap);
      await axios.put("/api/users/dashboard", { id: selectedDeviceId, ...editValues, color: colorName });

      alert("Device updated successfully");
      const updatedDevices = await axios.get<{ devices: Device[] }>("/api/users/dashboard");
      setDevices(updatedDevices.data.devices);
    } catch (error: unknown) {
      if (error instanceof Error) alert("Failed to update device: " + error.message);
      else alert("Failed to update device");
    }
  };

  const handleDeviceDelete = async () => {
    if (!confirm("Are you sure you want to delete this device?")) return;
    try {
      await axios.delete("/api/users/dashboard", { data: { deviceId: selectedDeviceId } });
      alert("Device deleted successfully");
      const updatedDevices = await axios.get<{ devices: Device[] }>("/api/users/dashboard");
      setDevices(updatedDevices.data.devices);
      setSelectedDeviceId("");
    } catch (error: unknown) {
      if (error instanceof Error) alert("Failed to delete device: " + error.message);
      else alert("Failed to delete device");
    }
  };

  const logout = async () => {
    try {
      await axios.get("/api/users/logout");
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) console.log("Error logging out:", error.message);
    }
  };

  const registerDevice = () => router.push("/device");

  const deleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

    try {
      if (!userId) {
        alert("User ID not found. Please log in again.");
        router.push("/login");
        return;
      }
      await axios.delete("/api/users/deleteAccount", { data: { userId } });
      alert("Your account has been deleted.");
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) console.error("Error deleting account:", error.message);
    }
  };

  // ------------------ Render ------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800 relative">
      <button onClick={logout} title="Logout" className="absolute top-4 right-4 text-white hover:text-red-500 transition">
        <LogOut size={28} />
        <span>Logout</span>
      </button>

      <main className="text-center w-full max-w-2xl">
        <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />
        <h1 className="text-4xl font-bold mt-6">Luminosity LEDs</h1>
        <p className="italic">Illuminate your creativity and expression</p>

        {loading ? (
          <div className="flex justify-center mt-10">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : devices.length === 0 ? (
          <div className="mt-6 text-white flex items-center gap-2 bg-stone-950 p-4 rounded shadow">
            <p className="font-medium">No devices found. Please register a device.</p>
            <span className="text-xl">⚠️</span>
          </div>
        ) : (
          <div className="text-black mt-6">
            <label className="block text-white mb-2">Select Device</label>
            <select
              value={selectedDeviceId}
              onChange={e => setSelectedDeviceId(e.target.value)}
              className="w-full p-2 rounded"
            >
              <option value="">-- Choose a Device to Update --</option>
              {devices.map(device => (
                <option key={device._id} value={device._id}>{device.name}</option>
              ))}
            </select>

            {selectedDevice && (
              <div className="mt-6 bg-blue-100 p-4 text-left rounded-lg shadow">

                {/* Device Name */}
                <label className="block mb-2">Name</label>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                  className="w-full p-2 border rounded mb-4"
                />

                {/* Color Wheel */}
                <div className="flex flex-col items-center mt-4 mb-6">
                  <label className="text-gray-700 font-semibold mb-2">Color Wheel</label>

                  <div
                    className="w-12 h-12 rounded-full cursor-pointer border-2 border-black"
                    style={{ backgroundColor: colorHex }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 15px 5px ${colorHex}`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0px 0px transparent";
                    }}
                    onClick={() => hiddenColorInput.current?.click()}
                  >
                    <input
                      type="color"
                      ref={hiddenColorInput}
                      value={colorHex}
                      onChange={(e) => {
                        lastChangeSource.current = "hex";
                        setColorHex(e.target.value);
                      }}
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    />
                  </div>
                </div>

                {/* RGB */}
                <label className="block mb-2">RGB</label>
                <div className="flex space-x-2 mb-4">
                  {(["r", "g", "b"] as const).map(ch => (
                    <input
                      key={ch}
                      type="text"
                      value={colorRgb[ch]}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
                        const num = Math.min(255, Math.max(0, Number(val) || 0));
                        lastChangeSource.current = "rgb";
                        setColorRgb({ ...colorRgb, [ch]: num });
                      }}
                      className="w-1/3 p-2 border rounded-lg text-gray-700"
                      placeholder={ch.toUpperCase()}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                {/* HEX */}
                <label className="block mb-2">HEX</label>
                <div className="flex items-center mb-4">
                  <span className="px-3 py-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 font-mono select-none">#</span>
                  <input
                    type="text"
                    value={hexInput.replace(/^#/, "")}
                    onChange={e => {
                      const val = e.target.value.replace(/[^A-Fa-f0-9]/g, "");
                      setHexInput("#" + val);
                      if (/^[A-Fa-f0-9]{6}$/.test(val)) { lastChangeSource.current = "hex"; setColorHex("#" + val); }
                    }}
                    className="w-full p-3 border rounded-r-lg text-gray-700 font-mono"
                    placeholder="RRGGBB"
                    maxLength={6}
                  />
                </div>

                {/* Brightness */}
                <label className="block mb-2">Brightness ({editValues.brightness}%)</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editValues.brightness}
                  onChange={e => setEditValues({ ...editValues, brightness: parseInt(e.target.value) })}
                  className="w-full mb-4"
                />

                {/* Powered */}
                <label className="block mb-2">Powered</label>
                <input
                  type="checkbox"
                  checked={editValues.powered}
                  onChange={e => setEditValues({ ...editValues, powered: e.target.checked })}
                />

                {/* Buttons */}
                <button onClick={handleDeviceUpdate} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                  Update Device
                </button>
                <button onClick={handleDeviceDelete} className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">
                  Delete Device
                </button>

              </div>
            )}
          </div>
        )}

        <div className="mt-10 space-y-2">
          <button onClick={deleteAccount} className="w-full py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700">
            Delete Account
          </button>
          <button onClick={registerDevice} className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700">
            Register New Device
          </button>
        </div>
      </main>
    </div>
  );
}
