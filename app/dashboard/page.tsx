"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { LogOut } from "lucide-react";
import axios from "axios";
import { closestColorName } from "../utils/closestColor";
import { colors } from "../utils/colorMap";
import { hexToRGB } from "../utils/hexToRGB";
import { rgbToHex } from "../utils/rgbToHex";
import { useRouter } from "next/navigation";
import { HexColorPicker } from "react-colorful";
import { MdColorize } from "react-icons/md";

// ------------------ Types ------------------
interface RGB {
  r: number;
  g: number;
  b: number;
}

interface Device {
  _id: string;
  name: string;
  color: string; // Named color
  brightness: number;
  powered: boolean;
}

interface User {
  _id: string;
  name: string;
  email: string;
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
    color: colors[0].name,
    brightness: 100,
    powered: false,
  });
  const [loading, setLoading] = useState(true);

  // ------------------ Color Picker State ------------------
  const [colorHex, setColorHex] = useState("#ff0000");
  const [canvasPickerActive, setCanvasPickerActive] = useState(false);

  // derive rgb from hex
  const colorRgb: RGB = useMemo(
    () => hexToRGB(colorHex) ?? { r: 255, g: 0, b: 0 },
    [colorHex]
  );

  // controlled inputs
  const [hexInput, setHexInput] = useState("#ff0000");
  const [rgbInput, setRgbInput] = useState({ r: "255", g: "0", b: "0" });

  const hiddenColorInput = useRef<HTMLInputElement>(null);
  const colorsList = useMemo(() => colors, []);

  // keep inputs synced whenever base color changes
  useEffect(() => {
    setHexInput(colorHex);
    setRgbInput({
      r: String(colorRgb.r),
      g: String(colorRgb.g),
      b: String(colorRgb.b),
    });
  }, [colorHex, colorRgb]);

  // ------------------ RGB Handlers ------------------
  const handleRgbChange = (ch: "r" | "g" | "b") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setRgbInput((prev) => {
      const updated = { ...prev, [ch]: val };

      const r = Math.min(255, Math.max(0, Number(updated.r || "0")));
      const g = Math.min(255, Math.max(0, Number(updated.g || "0")));
      const b = Math.min(255, Math.max(0, Number(updated.b || "0")));

      if (updated.r !== "" && updated.g !== "" && updated.b !== "") {
        setColorHex(rgbToHex(r, g, b));
      }

      return updated;
    });
  };

  const handleRgbBlur = () => {
    const r = Math.min(255, Math.max(0, Number(rgbInput.r || "0")));
    const g = Math.min(255, Math.max(0, Number(rgbInput.g || "0")));
    const b = Math.min(255, Math.max(0, Number(rgbInput.b || "0")));
    setRgbInput({ r: String(r), g: String(g), b: String(b) });
    setColorHex(rgbToHex(r, g, b));
  };

  // ------------------ HEX Handlers ------------------
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^A-Fa-f0-9]/g, "");
    setHexInput("#" + val);

    if (/^[A-Fa-f0-9]{6}$/.test(val)) {
      setColorHex("#" + val);
    }
  };

  const handleHexBlur = () => {
    const val = hexInput.replace(/^#/, "");
    if (/^[A-Fa-f0-9]{6}$/.test(val)) {
      setColorHex("#" + val);
    } else {
      setHexInput(colorHex);
    }
  };

  // ------------------ EyeDropper Handler ------------------
  const handleEyeDropper = async () => {
    if ("EyeDropper" in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        setColorHex(result.sRGBHex);
      } catch {
        // canceled or failed
      }
    } else {
      setCanvasPickerActive(true);
    }
  };

  const handleCanvasPick = (pickedHex: string) => {
    setColorHex(pickedHex);
    setCanvasPickerActive(false);
  };

  // ------------------ Fetch Data ------------------
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get<{ data: User }>("/api/users/me");
        const user = response.data.data;

        if (!user || !user._id) throw new Error("User ID not found");
        setUserId(user._id);

        const deviceRes = await axios.get<{ devices: Device[] }>("/api/users/dashboard");
        setDevices(deviceRes.data.devices);
      } catch (error: unknown) {
        console.error("Error fetching data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [router]);

  // ------------------ Selected Device ------------------
  useEffect(() => {
    if (!selectedDeviceId) {
      setSelectedDevice(null);   // clear selection
      return;
    }
    const device = devices.find(d => d._id === selectedDeviceId) || null;
    setSelectedDevice(device);

    if (device) {
      setEditValues({
        name: device.name,
        color: device.color,
        brightness: device.brightness,
        powered: device.powered,
      });

      const selectedColor = colorsList.find(c => c.name === device.color) || colorsList[0];
      setColorHex(selectedColor.hex);
    }
  }, [selectedDeviceId, devices, colorsList]);

  // ------------------ Actions ------------------
  const handleDeviceUpdate = async () => {
    try {
      const colorName = closestColorName(colorHex, colorsList);
      await axios.put("/api/users/dashboard", { id: selectedDeviceId, ...editValues, color: colorName });
      alert("Device updated successfully");

      const updatedDevices = await axios.get<{ devices: Device[] }>("/api/users/dashboard");
      setDevices(updatedDevices.data.devices);
    } catch (error: unknown) {
      alert("Failed to update device");
      console.error("Something went wrong:", error);
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
      alert("Failed to delete device");
      console.error("Something went wrong:", error);
    }
  };

  const logout = async () => {
    await axios.get("/api/users/logout");
    router.push("/login");
  };

  const registerDevice = () => router.push("/device");

  const deleteAccount = async () => {
    if (!confirm("Are you sure?")) return;
    if (!userId) return router.push("/login");
    await axios.delete("/api/users/deleteAccount", { data: { userId } });
    router.push("/login");
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
                  {!canvasPickerActive && (
                    <div className="flex flex-col items-center relative">
                      <HexColorPicker color={colorHex} onChange={setColorHex} />

                      {/* EyeDropper icon inside a circle */}
                      <div
                        onClick={handleEyeDropper}
                        className="relative -bottom-4 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center hover:bg-gray-400 cursor-pointer shadow-md transition"
                        title="Pick Color"
                      >
                        <MdColorize className="text-gray-700 text-xl" />
                      </div>
                    </div>
                  )}
                </div>

                {/* RGB Inputs */}
                <label className="block mb-2">RGB</label>
                <div className="flex space-x-2 mb-4">
                  {(["r","g","b"] as const).map(ch => (
                    <input
                      key={ch}
                      type="text"
                      value={rgbInput[ch]}
                      onChange={handleRgbChange(ch)}
                      onBlur={handleRgbBlur}
                      className="w-1/3 p-2 border rounded-lg text-gray-700"
                      placeholder={ch.toUpperCase()}
                      inputMode="numeric"
                    />
                  ))}
                </div>

                {/* HEX Input */}
                <label className="block mb-2">HEX</label>
                <div className="flex items-center mb-4">
                  <span className="px-3 py-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 font-mono select-none">#</span>
                  <input
                    type="text"
                    value={hexInput.replace(/^#/, "")}
                    onChange={handleHexChange}
                    onBlur={handleHexBlur}
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

                {/* Powered Toggle */}
                <label className="block mb-2">Powered</label>
                <div
                  onClick={() => setEditValues(prev => ({ ...prev, powered: !prev.powered }))}
                  className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${editValues.powered ? "bg-green-500" : "bg-gray-300"}`}
                >
                  <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${editValues.powered ? "translate-x-6" : "translate-x-0"}`} />
                </div>

                {/* Action Buttons */}
                <button onClick={handleDeviceUpdate} className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Update Device</button>
                <button onClick={handleDeviceDelete} className="mt-2 w-full bg-red-600 text-white py-2 rounded hover:bg-red-700">Delete Device</button>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 space-y-2">
          <button onClick={deleteAccount} className="w-full py-2 bg-red-600 text-white font-semibold rounded hover:bg-red-700">Delete Account</button>
          <button onClick={registerDevice} className="w-full py-2 bg-green-600 text-white font-semibold rounded hover:bg-green-700">Register New Device</button>
        </div>
      </main>

        {/* Canvas Picker Fallback */}
        {canvasPickerActive && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <CanvasColorPicker onPick={handleCanvasPick} />
        </div>
      )}
    </div>
  );
}

// Canvas-based fallback component
function CanvasColorPicker({ onPick }: { onPick: (hex: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = 300; // fixed width
    const height = 300; // fixed height
    canvas.width = width;
    canvas.height = height;

    // Fill with a horizontal hue gradient (0 → 360 degrees)
    const hueGradient = ctx.createLinearGradient(0, 0, width, 0);
    for (let i = 0; i <= 360; i += 10) {
      hueGradient.addColorStop(i / 360, `hsl(${i}, 100%, 50%)`);
    }
    ctx.fillStyle = hueGradient;
    ctx.fillRect(0, 0, width, height);

    // Overlay vertical gradient for brightness (top: white, middle: transparent, bottom: black)
    const brightnessGradient = ctx.createLinearGradient(0, 0, 0, height);
    brightnessGradient.addColorStop(0, "rgba(255,255,255,1)");
    brightnessGradient.addColorStop(0.5, "rgba(255,255,255,0)");
    brightnessGradient.addColorStop(0.5, "rgba(0,0,0,0)");
    brightnessGradient.addColorStop(1, "rgba(0,0,0,1)");
    ctx.fillStyle = brightnessGradient;
    ctx.fillRect(0, 0, width, height);
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.floor((e.clientY - rect.top) * (canvas.height / rect.height));

    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    onPick(hex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        onClick={handleClick}
        className="cursor-crosshair rounded-lg shadow-lg"
      />
    </div>
  );
}

