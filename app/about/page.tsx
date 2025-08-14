import Image from "next/image";
import BackButton from "../components/BackButton";

export default function AboutPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800">
      <BackButton />
      <main className="flex flex-col items-center justify-center w-full">
        <Image src="/Logo.svg" alt="LL logo" width={180} height={38} priority />
        <h1 className="text-3xl font-bold mb-4 mt-6 text-white">About</h1>
        <p className="text-lg text-center max-w-xl text-white">Luminosity LEDs was founded in 2022, wanting to give people the freedom to illuminate their creativity and inspiration.</p>
      </main>
    </div>
  );
}
