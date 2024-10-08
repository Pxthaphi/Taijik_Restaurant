// pages/index.tsx
"use client";
import { useEffect, useState } from "react";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { login } from "./auth/login";
import { supabase } from "@/lib/supabase";
import Swal from "sweetalert2";
import liff from "@line/liff";
import Cookies from "js-cookie";

export default function Home() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // ทดลองดึงข้อมูลจาก Supabase
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("Product_Name", 1); // ระบุชื่อ table ที่ต้องการดึงข้อมูล

        // ถ้ามี error หรือไม่มีการดึงข้อมูล
        if (error || !data) {
          throw new Error("Cannot fetch data");
        }

        // ถ้าเชื่อมต่อสำเร็จ ดำเนินการล็อกอิน
        const userType = await login();
        if (userType === "admin") {
          Cookies.set("userType", userType);  // เก็บค่า userType ใน cookie
          router.push(`/admin`);
        } else {
          Cookies.set("userType", userType);  // เก็บค่า userType ใน cookie
          router.push(`/customer`);
        }
      } catch (error) {
        // แสดงข้อความแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการเชื่อมต่อ
        Swal.fire({
          icon: "error",
          title: "เชื่อมต่อไม่สำเร็จ",
          text: "ไม่สามารถเชื่อมต่อกับระบบได้ กรุณาลองในภายหลัง",
          timer: 3000,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => {
          setTimeout(() => {
            liff.closeWindow();
          }, 3000);
        });
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  if (loading) {
    return <Loading />;
  }
  return null;
}
