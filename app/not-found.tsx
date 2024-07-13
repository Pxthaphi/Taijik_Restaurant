"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1300);

    const timer = setTimeout(() => {
      router.push("/");
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [router]);

  return (
    <div>
      <h1>Page Not Found</h1>
      <p>You will be redirected to the home page in {countdown} seconds.</p>
    </div>
  );
}
