"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import Image from "next/image";
import { MdArrowBack } from "react-icons/md";
import axios from "axios";
import { closestColorName } from "../utils/closestColor";
// ✅ Import array of colors
import { colors } from "../utils/colorMap";
import { hexToRGB } from "../utils/hexToRGB";
import { rgbToHex } from "../utils/rgbToHex";
import { useRouter } from "next/navigation";

// Define type for RGB
interface RGB {
  r: number;
  g: number;
  b: number;
}

export default function DevicePage() {
  const router = useRouter();
  const [deviceName, setDeviceName] = useState("");
  const [color, setColor] = useState("Red");
  const [brightness, setBrightness] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [colorHex, setColorHex] = useState("#ff0000");
  const [colorRgb, setColorRgb] = useState<RGB>({ r: 255, g: 0, b: 0 });
  const [hexInput, setHexInput] = useState("#ff0000");
  const [rgbInput, setRgbInput] = useState({ r: "255", g: "0", b: "0" });

  const lastChangeSource = useRef<"hex" | "rgb" | null>(null);
  const hiddenColorInput = useRef<HTMLInputElement>(null);

  // ✅ useMemo just stores the array of colors
  const colorsList = useMemo(() => colors, []);

  // Sync color name → hex/rgb
  useEffect(() => {
    const selected = colorsList.find((c) => c.name === color);
    if (selected) {
      setColorHex(selected.hex);
      const rgb = hexToRGB(selected.hex);
      if (rgb) {
        setColorRgb(rgb);
        setRgbInput({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });
      }
    }
  }, [colorsList, color]);

  // HEX → RGB + closest color
  useEffect(() => {
    if (lastChangeSource.current === "hex") {
      const rgb = hexToRGB(colorHex);
      if (rgb) {
        setColorRgb(rgb);
        setRgbInput({ r: String(rgb.r), g: String(rgb.g), b: String(rgb.b) });

        // ✅ use colorsList array
        const name = closestColorName(colorHex, colorsList);
        if (name) setColor(name);
      }
      lastChangeSource.current = null;
    }
    setHexInput(colorHex);
  }, [colorHex, colorsList]);
    // TODO: Potential infinite loop: colorHex

  // RGB → HEX + closest color
  useEffect(() => {
    if (lastChangeSource.current === "rgb") {
      const hex = rgbToHex(colorRgb.r, colorRgb.g, colorRgb.b);
      if (hex.toLowerCase() !== colorHex.toLowerCase()) setColorHex(hex);

      // ✅ use colorsList array
      const name = closestColorName(hex, colorsList);
      if (name) setColor(name);

      lastChangeSource.current = null;
    }
  }, [colorRgb, colorHex, colorsList]);

  // Handle RGB input
  const handleRgbChange = (ch: "r" | "g" | "b") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^\d]/g, "").slice(0, 3);
    setRgbInput((prev) => ({ ...prev, [ch]: val }));
    const num = Math.min(255, Math.max(0, Number(val || "0")));
    lastChangeSource.current = "rgb";
    setColorRgb((prev) => ({ ...prev, [ch]: num }));
  };

  const handleRgbBlur = (ch: "r" | "g" | "b") => () => {
    setRgbInput((prev) => ({ ...prev, [ch]: prev[ch] === "" ? "0" : prev[ch] }));
  };

  // Register device
  const handleRegisterDevice = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      await axios.post(
        "/api/users/devices",
        { 
          name: deviceName, 
          color, 
          brightness 
        },
        { withCredentials: true }
      );

      setSuccess("Device registered successfully!");

      // Reset state
      const defaultColor = colorsList.find(c => c.name === "Ruby Red") || colorsList[0];
      setDeviceName("");
      setColor(defaultColor.name);
      setBrightness(100);
      setColorHex(defaultColor.hex);
      const rgb = hexToRGB(defaultColor.hex);
      setColorRgb(rgb || { r: 255, g: 0, b: 0 });
      setRgbInput({ r: String(rgb?.r ?? 255), g: String(rgb?.g ?? 0), b: String(rgb?.b ?? 0) });
      setHexInput(defaultColor.hex);

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.error || "Failed to register device.");
      else setError("Failed to register device.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-800">
      <main className="text-center w-full max-w-2xl">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-4 right-4 text-white hover:text-blue-500 transition flex items-center"
          title="Back to Dashboard"
        >
          <MdArrowBack size={28} className="mr-2" />
          Back to Dashboard
        </button>

        <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />
        <h1 className="text-4xl font-bold mt-6">Luminosity LEDs</h1>
        <p className="italic">Illuminate your creativity and expression</p>

        <div className="flex flex-col items-center justify-center bg-white p-6 max-w-lg mx-auto mt-10 rounded-xl shadow-lg">
          <div className="bg-blue-100 shadow-lg rounded-lg p-8 w-full max-w-md">
            <h1 className="text-black text-3xl font-bold text-center mb-6">Register Device</h1>

            {error && <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>}
            {success && <div className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{success}</div>}

            {/* Device Name */}
            <label className="block text-gray-700 font-semibold mb-2">Device Name</label>
            <input
              type="text"
              placeholder="Enter device name"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              className="text-gray-700 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
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
            <label className="block text-gray-700 font-semibold mb-2">RGB</label>
            <div className="flex space-x-2 mb-4">
              {(["r", "g", "b"] as const).map((ch) => (
                <input
                  key={ch}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={rgbInput[ch]}
                  onChange={handleRgbChange(ch)}
                  onBlur={handleRgbBlur(ch)}
                  className="w-1/3 p-2 border rounded-lg text-gray-700"
                  placeholder={ch.toUpperCase()}
                  maxLength={3}
                />
              ))}
            </div>

            {/* HEX */}
            <label className="block text-gray-700 font-semibold mb-2">HEX</label>
            <div className="flex items-center mb-4">
              <span className="px-3 py-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 font-mono select-none">#</span>
              <input
                type="text"
                value={hexInput.replace(/^#/, "")}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^A-Fa-f0-9]/g, "");
                  setHexInput("#" + val);
                  if (/^[A-Fa-f0-9]{6}$/.test(val)) {
                    lastChangeSource.current = "hex";
                    setColorHex("#" + val);
                  }
                }}
                className="w-full p-3 border rounded-r-lg text-gray-700 font-mono"
                placeholder="RRGGBB"
                maxLength={6}
              />
            </div>

            {/* Brightness */}
            <label className="block text-gray-700 font-semibold mb-2">
              Starting Brightness: {brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full mb-4"
            />

            {/* Register */}
            <button
              onClick={handleRegisterDevice}
              disabled={loading || !deviceName}
              className={`w-full py-3 text-white font-bold rounded-lg transition ${
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Registering..." : "Register Device"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
