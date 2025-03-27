"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleOnClick = (route: String) => {
    router.push(`/${route}`);
  };

  return (
    <div className="bg-gray-800 grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-inter)]">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <Image
          className=""
          src="/Logo.svg"
          alt="LL logo"
          width={180}
          height={38}
          priority
        />

        <div className="text-left mb-8 mt-4">
          <div className="text-4xl font-bold mb-2">Luminosity LEDs</div>
          <div className="text-lg italic">
            Illuminate your creativity and expression
          </div>

          <div className="text-sm">
            Control lightning at your fingertips like never before
          </div>
        </div>

        <div className="flex gap-10 items-center flex-col sm:flex-row">
          <button
            type="button"
            onClick={() => handleOnClick("login")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#49ca7a] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleOnClick("signup")}
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#d0e93f] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
          >
            Signup
          </button>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <button
          type="button"
          onClick={() => handleOnClick("about")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          About
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("contact")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Contact
        </button>
        <button
          type="button"
          onClick={() => handleOnClick("help")}
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image
            aria-hidden
            src="/help.svg"
            alt="Help icon"
            width={16}
            height={16}
          />
          Help
        </button>
      </footer>
    </div>
  );
}