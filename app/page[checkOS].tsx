// pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { login } from "./auth/login";
import liff from "@line/liff";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

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

        // Check if the user is within the Line client using LIFF
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
            window.location.href = liffUrl; // Redirect user to Line app
          });
        } else {
          // If in Line client, proceed with login and routing
          const userType = await login();
          if (userType === "admin") {
            Cookies.set("userType", userType); // เก็บค่า userType ใน cookie
            router.push(`/admin`);
          } else {
            Cookies.set("userType", userType); // เก็บค่า userType ใน cookie
            router.push(`/customer`);
          }
          setLoading(false); // Stop loading once login is successful
        }
      } catch (error) {
        console.error(
          "LIFF initialization or profile retrieval failed:",
          error
        );
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to initialize LIFF or retrieve profile.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    };
    handleLogin();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return null;
}
