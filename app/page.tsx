// pages/index.tsx
'use client'
import { useEffect, useState } from "react";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { login } from "./auth/login";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      const userType = await login();
      if (userType === "admin") {
        router.push(`/admin`);
      } else {
        router.push(`/customer`);
      }
      setLoading(false);
    };
    handleLogin();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return null;
}
