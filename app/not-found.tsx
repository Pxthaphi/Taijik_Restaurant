// not-found.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    // ตั้งเวลาให้กลับไปยังหน้าแรกหลังจาก 3 วินาที (3000 milliseconds)
    const timeout = setTimeout(() => {
      router.push("/"); // กลับไปที่หน้าแรก
    }, 3000);

    // ล้าง timeout เมื่อ component นี้ถูก unmounted
    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 relative">
      {/* แสดงข้อความ 404 ขนาดใหญ่ */}
      <h1 className="text-[15rem] font-extrabold text-gray-300 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        404
      </h1>
      <div className="relative z-10 flex flex-col items-center">
        {/* รูปภาพแสดงหน้าที่ไม่พบ */}
        <Image
          src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png"
          alt="ไม่พบหน้าดังกล่าว"
          width={200}
          height={200}
          className="mb-4"
        />
        <h1 className="text-3xl font-DB_Med text-red-700 text-center">
          ไม่พบหน้าดังกล่าว
        </h1>
        <p className="text-md text-gray-500 font-DB_Med mt-2 text-center">
          กรุณารอสักครู่ ระบบกำลังนำพาท่านกลับไปหน้าหลัก...
        </p>
      </div>
    </div>
  );
}
