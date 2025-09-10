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
  const [colorRgb, setColorRgb] = useState<RGB>({ r: 255, g: 0, b: 0 });
  const [hexInput, setHexInput] = useState("#ff0000");
  const [rgbInput, setRgbInput] = useState({ r: "255", g: "0", b: "0" });
  const lastChangeSource = useRef<"hex" | "rgb" | null>(null);
  const hiddenColorInput = useRef<HTMLInputElement | null>(null);

  // Memoized colors array
  const colorsList = useMemo(() => colors, []);

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

      const selectedColor = colorsList.find(c => c.name === device.color) || colorsList[0];
      setColorHex(selectedColor.hex);
      const rgb = hexToRGB(selectedColor.hex);
      setColorRgb(rgb || { r: 255, g: 0, b: 0 });
      setHexInput(selectedColor.hex);
      setRgbInput({ r: String(rgb?.r ?? 255), g: String(rgb?.g ?? 0), b: String(rgb?.b ?? 0) });
    }
  }, [selectedDeviceId, devices, colorsList]);

  // ------------------ HEX ↔ RGB Sync ------------------
  useEffect(() => {
    if (lastChangeSource.current === "hex") {
      const rgb = hexToRGB(colorHex);
      if (rgb) {
        setColorRgb(rgb);
        setRgbInput({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });

        // Update color name
        const name = closestColorName(colorHex, colorsList);
        if (name) setEditValues(prev => ({ ...prev, color: name }));

        // Only update hexInput if it is valid and differs
        if (hexInput.toLowerCase() !== colorHex.toLowerCase()) {
          setHexInput(colorHex);
        }
      }
      lastChangeSource.current = null;
    }
  }, [colorHex, colorsList, hexInput]);
    // TODO: Potential infinite loop: colorHex

  useEffect(() => {
    if (lastChangeSource.current === "rgb") {
      const hex = rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b);
      if (hex.toLowerCase() !== colorHex.toLowerCase()) setColorHex(hex);

      setRgbInput({ r: String(colorRgb.r), g: String(colorRgb.g), b: String(colorRgb.b) });

      const name = closestColorName(hex, colorsList);
      if (name) setEditValues(prev => ({ ...prev, color: name }));

      // ✅ Update hexInput so the HEX input field shows the new value
      if (hexInput.toLowerCase() !== hex.toLowerCase()) setHexInput(hex);

      lastChangeSource.current = null;
    }
  }, [colorRgb, colorHex, colorsList, hexInput]);


  // ------------------ RGB Input Handlers ------------------
  const handleRgbChange = (ch: "r" | "g" | "b") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setRgbInput(prev => ({ ...prev, [ch]: val }));
    const num = Math.min(255, Math.max(0, Number(val || "0")));
    lastChangeSource.current = "rgb";
    setColorRgb(prev => ({ ...prev, [ch]: num }));
  };

  const handleRgbBlur = (ch: "r" | "g" | "b") => () => {
    setRgbInput(prev => ({ ...prev, [ch]: prev[ch] === "" ? "0" : prev[ch] }));
  };

  // ------------------ Actions ------------------
  const handleDeviceUpdate = async () => {
    try {
      await axios.put("/api/users/dashboard", { id: selectedDeviceId, ...editValues });
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
                  <div
                    className="w-12 h-12 rounded-full cursor-pointer border-2 border-black"
                    style={{ backgroundColor: colorHex }}
                    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 15px 5px ${colorHex}`}
                    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 0 0px 0px transparent"}
                    onClick={() => hiddenColorInput.current?.click()}
                  >
                    <input
                      type="color"
                      ref={hiddenColorInput}
                      value={colorHex}
                      onChange={e => { lastChangeSource.current = "hex"; setColorHex(e.target.value); }}
                      className="absolute w-0 h-0 opacity-0 pointer-events-none"
                    />
                  </div>
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
                      onBlur={handleRgbBlur(ch)}
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
                    onChange={e => {
                      const val = e.target.value.replace(/[^A-Fa-f0-9]/g, "");
                      setHexInput("#" + val);  // update input as user types
                      if (/^[A-Fa-f0-9]{6}$/.test(val)) {
                        lastChangeSource.current = "hex";
                        setColorHex("#" + val);  // only update colorHex when user finishes 6 chars
                      }
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
    </div>
  );
}
