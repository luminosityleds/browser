import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/signup");
  }, [router]);

  return null; // Optional: You can return a loader or placeholder here.
}
