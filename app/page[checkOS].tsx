// pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { login } from "./auth/login";
import liff from "@line/liff";
import Swal from "sweetalert2";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const handleLogin = async () => {
      try {
        const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
        if (!liffId) {
          throw new Error("LINE_LIFF_ID is not defined.");
        }

        await liff.init({ liffId });

        const { userAgent } = navigator;
        console.log(userAgent);

        if (!liff.isInClient()) {
          Swal.fire({
            icon: "error",
            title: "ไม่สามารถใช้งานบนเว็บไซต์ได้",
            text: "ระบบกำลังเปลี่ยนไปใช้บน Line",
            showConfirmButton: false,
            timerProgressBar: true,
            timer: 3000,
            didOpen: () => {
              Swal.showLoading(Swal.getDenyButton());
            },
          }).then(() => {
            Swal.showLoading(Swal.getConfirmButton());
            const liffUrl = `https://line.me/R/app/${liffId}`;
            window.location.href = liffUrl;
          });
        } else {
          const userType = await login();
          if (userType === "admin") {
            router.push(`/admin`);
          } else {
            router.push(`/customer`);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error("LIFF initialization or profile retrieval failed:", error);
      }
    };
    handleLogin();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return null;
}
