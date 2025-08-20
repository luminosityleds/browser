"use client";
import { useRouter } from "next/navigation";

export default function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.back()}
      className="absolute top-6 right-6 bg-white text-gray-800 px-4 py-2 rounded shadow hover:bg-gray-200 z-10"
      aria-label="Go back"
    >
      Back
    </button>
  );
}
