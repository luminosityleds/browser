"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { MdArrowBack } from "react-icons/md";
import axios from "axios";
import { closestColorName } from "../utils/closestColor";
import { colors } from "../utils/colorMap";
import { hexToRGB } from "../utils/hexToRGB";
import { rgbToHex } from "../utils/rgbToHex";
import { useRouter } from "next/navigation";

interface RGB {
  r: number;
  g: number;
  b: number;
}

export default function DevicePage() {
  const router = useRouter();

  const [editValues, setEditValues] = useState({
    name: "",
    brightness: 100,
    powered: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // ------------------ Color Picker State ------------------
  const [colorHex, setColorHex] = useState("#ff0000");

  // derive rgb from hex (no need to sync manually)
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
const handleRgbChange =
  (ch: "r" | "g" | "b") => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, "").slice(0, 3);
    setRgbInput((prev) => {
      const updated = { ...prev, [ch]: val };

      // try converting live if all values are valid numbers
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
  // ensure blanks get reset
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

  // if valid hex length, update color live
  if (/^[A-Fa-f0-9]{6}$/.test(val)) {
    setColorHex("#" + val);
  }
};

const handleHexBlur = () => {
  const val = hexInput.replace(/^#/, "");
  if (/^[A-Fa-f0-9]{6}$/.test(val)) {
    setColorHex("#" + val);
  } else {
    // revert invalid/partial input
    setHexInput(colorHex);
  }
};

  // ------------------ Register Device ------------------
  const handleRegisterDevice = async () => {
    if (!editValues.name.trim()) {
      setError("⚠️ Please enter a device name before registering.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const colorName = closestColorName(colorHex, colorsList);

      await axios.post(
        "/api/users/devices",
        {
          name: editValues.name,
          color: colorName,
          brightness: editValues.brightness,
          powered: editValues.powered,
        },
        { withCredentials: true }
      );

      setSuccess("Device registered successfully!");

      // Reset form
      const defaultColor =
        colorsList.find((c) => c.name === "Ruby Red") || colorsList[0];
      setEditValues({ name: "", brightness: 100, powered: false });
      setColorHex(defaultColor.hex);

      setTimeout(() => router.push("/dashboard"), 1000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err))
        setError(err.response?.data?.error || "Failed to register device.");
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
        >
          <MdArrowBack size={28} className="mr-2" /> Back to Dashboard
        </button>

        <Image src="/Logo.svg" alt="LL logo" width={200} height={38} priority />
        <h1 className="text-4xl font-bold mt-6">Luminosity LEDs</h1>
        <p className="italic">Illuminate your creativity and expression</p>

        <div className="flex flex-col items-center justify-center bg-white p-6 max-w-lg mx-auto mt-10 rounded-xl shadow-lg">
          <div className="bg-blue-100 shadow-lg rounded-lg p-8 w-full max-w-md">
            <h1 className="text-black text-3xl font-bold text-center mb-6">
              Register Device
            </h1>

            {error && (
              <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-600 bg-green-100 p-3 rounded-md mb-4">
                {success}
              </div>
            )}

            {/* Device Name */}
            <label className="block text-gray-700 font-semibold mb-2">
              Device Name
            </label>
            <input
              type="text"
              placeholder="Enter device name"
              value={editValues.name}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, name: e.target.value }))
              }
              className="text-gray-700 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 mb-4"
            />

            {/* Color Wheel */}
            <div className="flex flex-col items-center mt-4 mb-6">
              <label className="text-gray-700 font-semibold mb-2">
                Color Wheel
              </label>
              <div
                className="w-12 h-12 rounded-full cursor-pointer border-2 border-black"
                style={{ backgroundColor: colorHex }}
                onMouseEnter={(e) =>
                  (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 15px 5px ${colorHex}`
                }
                onMouseLeave={(e) =>
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "0 0 0px 0px transparent"
                }
                onClick={() => hiddenColorInput.current?.click()}
              >
                <input
                  type="color"
                  ref={hiddenColorInput}
                  value={colorHex}
                  onChange={(e) => setColorHex(e.target.value)}
                  className="absolute w-0 h-0 opacity-0 pointer-events-none"
                />
              </div>
            </div>

            {/* RGB Inputs */}
            <label className="block text-gray-700 font-semibold mb-2">
              RGB
            </label>
            <div className="flex space-x-2 mb-4">
              {(["r", "g", "b"] as const).map((ch) => (
                <input
                  key={ch}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  value={rgbInput[ch]}
                  onChange={handleRgbChange(ch)}
                  onBlur={handleRgbBlur}
                  className="w-1/3 p-2 border rounded-lg text-gray-700"
                  placeholder={ch.toUpperCase()}
                  maxLength={3}
                />
              ))}
            </div>

            {/* HEX Input */}
            <label className="block text-gray-700 font-semibold mb-2">
              HEX
            </label>
            <div className="flex items-center mb-4">
              <span className="px-3 py-3 border border-r-0 rounded-l-lg bg-gray-100 text-gray-700 font-mono select-none">
                #
              </span>
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
            <label className="block text-gray-700 font-semibold mb-2">
              Starting Brightness: {editValues.brightness}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={editValues.brightness}
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  brightness: Number(e.target.value),
                }))
              }
              className="w-full mb-4"
            />

            {/* Powered Toggle */}
            <label className="block text-gray-700 font-semibold mb-2 text-center">
              Powered
            </label>
            <div className="flex justify-center mb-2">
              <div
                onClick={() =>
                  setEditValues((prev) => ({ ...prev, powered: !prev.powered }))
                }
                className={`relative w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                  editValues.powered ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                    editValues.powered ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>

            {/* Register Button */}
            <button
              onClick={handleRegisterDevice}
              disabled={loading}
              className={`w-full py-3 text-white font-bold rounded-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
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
