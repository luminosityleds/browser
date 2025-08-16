import Image from "next/image";
import BackButton from "../components/BackButton";

export default function ContactPage() {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen p-4 bg-gray-800">
      <BackButton />
      <main className="flex flex-col items-center justify-center w-full">
        <Image src="/Logo.svg" alt="LL logo" width={180} height={38} priority />
        <h1 className="text-3xl font-bold mb-4 mt-6 text-white">Contact</h1>
        <p className="text-lg text-center max-w-xl text-white">Visit Our GitHub Page For More Information!</p>
        <a
          href="https://github.com/luminosityleds"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 flex justify-center"
        >
          <Image src="/github.svg" alt="GitHub logo" width={70} height={70} />
        </a>
      </main>
    </div>
  );
}
