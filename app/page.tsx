"use client";
import { useState, useEffect } from "react";
import liff from "@line/liff";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";

interface Profile {
  userId?: string;
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const login = async () => {
      setLoading(true);
      try {
        const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
        if (!liffId) {
          throw new Error("LINE_LIFF_ID is not defined.");
        }

        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const userProfile = await liff.getProfile();

          const isAdmin =
            userProfile.userId === process.env.NEXT_PUBLIC_ADMIN_LINE_USER_ID;

          if (isAdmin) {
            router.push(`/admin`);
          } else {
            router.push(`/customer`);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error(
          "LIFF initialization or profile retrieval failed:",
          error
        );
        // Handle error
      }
    };

    login();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return null;
}
