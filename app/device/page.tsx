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
import { HexColorPicker } from "react-colorful";
import { MdColorize } from "react-icons/md";

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
const [canvasPickerActive, setCanvasPickerActive] = useState(false);

// derive rgb from hex
const colorRgb: RGB = useMemo(
  () => hexToRGB(colorHex) ?? { r: 255, g: 0, b: 0 },
  [colorHex]
);

const colorsList = useMemo(() => colors, []);

  // ------------------ Controlled Inputs ------------------
  const [hexInput, setHexInput] = useState("#ff0000");
  const [rgbInput, setRgbInput] = useState({ r: "255", g: "0", b: "0" });
  const [colorNameInput, setColorNameInput] = useState(
    closestColorName(colorHex, colorsList)
  );

  // keep inputs synced whenever base color changes
  useEffect(() => {
    setHexInput(colorHex);
    setRgbInput({
      r: String(colorRgb.r),
      g: String(colorRgb.g),
      b: String(colorRgb.b),
    });
    setColorNameInput(closestColorName(colorHex, colorsList));
  }, [colorHex, colorRgb, colorsList]);

  // ------------------ Color Name Handlers ------------------
  const handleColorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setColorNameInput(e.target.value);
  };

  const handleColorNameBlur = () => {
    const match = colorsList.find(
      (c) => c.name.toLowerCase() === colorNameInput.toLowerCase()
    );

    if (match) {
      setColorHex(match.hex);
      setColorNameInput(match.name); // normalize case
    } else {
      // fallback to closest
      const closest = closestColorName(colorNameInput, colorsList);
      const closestColor = colorsList.find((c) => c.name === closest);
      if (closestColor) {
        setColorHex(closestColor.hex);
        setColorNameInput(closestColor.name);
      }
    }
  };

  // ------------------ RGB Handlers ------------------
  const handleRgbChange = (ch: "r" | "g" | "b") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
              <div className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</div>
            )}
            {success && (
              <div className="text-green-600 bg-green-100 p-3 rounded-md mb-4">{success}</div>
            )}

            {/* Device Name */}
            <label className="block text-gray-700 font-semibold mb-2">Device Name</label>
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
              <label className="text-gray-700 font-semibold mb-2">Color Grid</label>
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

            {/* Color Name Input */}
            <label className="block text-gray-700 font-semibold mb-2">Color Name</label>
            <input
              type="text"
              placeholder="e.g. Sky Blue"
              value={colorNameInput}
              onChange={handleColorNameChange}
              onBlur={handleColorNameBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // prevent form submission if inside a <form>
                  handleColorNameBlur();
                }
              }}
              className="w-full p-3 border rounded-lg text-gray-700 mb-4"
            />  

            {/* RGB Inputs */}
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
                  onBlur={handleRgbBlur}
                  className="w-1/3 p-2 border rounded-lg text-gray-700"
                  placeholder={ch.toUpperCase()}
                  maxLength={3}
                />
              ))}
            </div>

            {/* HEX Input */}
            <label className="block text-gray-700 font-semibold mb-2">HEX</label>
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
            <label className="block text-gray-700 font-semibold mb-2 text-center">Powered</label>
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
                loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Registering..." : "Register Device"}
            </button>
          </div>
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
