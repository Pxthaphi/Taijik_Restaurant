"use client";
import { useState, useEffect } from "react";

import Loading_Order from "./components/loading";
import Swal from "sweetalert2";
import Link from "next/link";
import Modal_CancelOrder from "./components/modal-cancel";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Order_Status({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [status_order, setStatus_order] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  let Status_text = "";
  let Status_detail = "";
  let Status_image = "";
  let Status_bgcolor = "";
  let Status_textcolor = "";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // Function to open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  if (status_order == 1) {
    Status_text = "รอการยืนยันคำสั่งซื้อจากทางร้าน";
    Status_detail = "กำลังรอดำเนินการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/waiting_order.png";
    Status_bgcolor = "bg-blue-200";
    Status_textcolor = "text-green-700";
  } else if (status_order == 2) {
    Status_text = "กำลังจัดเตรียมเมนูอาหาร";
    Status_detail = "กำลังรอดำเนินการ อาจจะใช้เวลานานกว่ากำหนดการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/preparing_order.png";
    Status_bgcolor = "bg-orange-400";
    Status_textcolor = "text-green-700";
  } else if (status_order == 3) {
    Status_text = "เตรียมเมนูอาหารเสร็จสิ้น";
    Status_detail = "กรุณาเดินทางเข้ามารับเมนูอาหารของท่าน";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_prepare.png";
    Status_bgcolor = "bg-green-600";
    Status_textcolor = "text-green-700";
  } else if (status_order == 4) {
    Status_text = "คำสั่งซื้อเสร็จสิ้น";
    Status_detail = "ขอบคุณที่ใช้บริการร้านอาหารใต้จิกค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_order.png";
    Status_bgcolor = "bg-green-600";
    Status_textcolor = "text-green-700";
  } else if (status_order == 5) {
    Status_text = "ยกเลิกคำสั่งซื้อ";
    Status_detail = "ทางร้านขออภัยหากเกิดมีข้อผิดพลาดประการใด";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
    Status_bgcolor = "bg-red-600";
    Status_textcolor = "text-red-700";
  } else {
    Status_text = "เกิดข้อผิดพลาดในการสั่งอาหาร";
    Status_detail = "กรุณาลองสั่งอาหารใหม่อีกครั้งค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
    Status_bgcolor = "bg-orange-600";
    Status_textcolor = "text-orange-600";
  }

  if (loading) {
    return <Loading_Order />;
  }

  return (
    <>
      <header className="relative flex items-center justify-center max-w-screen overflow-hidden">
        <div className="max-w-md w-full py-36 shadow-md rounded-b-3xl overflow-hidden relative z-0">
          <div className={`absolute inset-0 ${Status_bgcolor}`}></div>
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/bg_order.png?t=2024-05-09T14%3A00%3A24.685Z"
            alt="Promotion background"
          />
        </div>
        <div className="absolute inset-0 left-5 mt-64 pt-6 flex items-center justify-center animate-wiggle animate-infinite animate-duration-[1500ms]">
          <img
            src={Status_image}
            alt={Status_text}
            className="h-38 transform -translate-y-1/2 "
          />
        </div>

        <div className="">
          <div className="absolute top-8 right-0 mr-6 h-full">
            {status_order == 1 && (
              <button
                className="inline-block bg-red-500 hover:bg-red-600 py-1.5 px-2.5 rounded-full"
                onClick={openModal}
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="text-sm font-DB_Med text-white ml-1">
                    ยกเลิกออเดอร์
                  </p>
                </div>
              </button>
            )}
          </div>
          <div className="absolute top-6 left-0 mx-6 h-full">
            <Link href="../../../">
              <div className="bg-white px-2 py-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-6 mt-6">
          <h1 className={`text-2xl font-DB_Med ${Status_textcolor}`}>
            {Status_text}
          </h1>
          <p className="text-base font-DB_v4 text-gray-800 mt-2">
            {Status_detail}
          </p>
          <p className="text-base font-DB_v4 text-gray-600 mt-2">
            เลขคำสั่งซื้อ TK-00001-00000001
          </p>
          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>
        </section>

        <section className="mx-6 mt-6 my-3">
          <div className="flex justify-between item-center my-4">
            <div className="flex justify-center">
              <div className="bg-gray-200 rounded-lg px-5 py-2 flex items-center me-4">
                <p className="text-lg text-gray-700 font-DB_v4">1</p>
              </div>
              <div className="-my-0.5">
                <h3 className="text-lg font-DB_v4 text-gray-700">ข้าวกะเพรา</h3>
                <p className="text-base font-DB_v4 text-gray-500">ไก่</p>
              </div>
            </div>
            <p className="text-lg text-green-700 font-DB_Med mt-2.5">฿45</p>
          </div>

          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-6"></hr>
        </section>

        <section className="mx-6 mt-5">
          <div className="flex justify-between mt-5 my-5">
            <div className="text-xl text-gray-800 font-DB_Med">ส่วนลด</div>
            <div className="text-xl text-red-600 font-DB_Med">฿0</div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-xl text-green-600 font-DB_Med">฿45</div>
          </div>
        </section>

        {/* Modal */}
        {isModalOpen && (
          <Modal_CancelOrder setIsModalOpen={setIsModalOpen} />
          
        )}
      </main>

      <footer className="flex justify-center fixed bottom-0 inset-x-0 mb-8">
        {status_order == 4 && (
          <div className="flex justify-between item-center">
            <Link
              href="../order_product"
              className="inline-flex items-center mr-4 bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-8 text-lg font-DB_Med"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-7 h-7 mr-1"
              >
                <path
                  fill="currentColor"
                  d="M13.26 3C8.17 2.86 4 6.95 4 12H2.21c-.45 0-.67.54-.35.85l2.79 2.8c.2.2.51.2.71 0l2.79-2.8a.5.5 0 0 0-.36-.85H6c0-3.9 3.18-7.05 7.1-7c3.72.05 6.85 3.18 6.9 6.9c.05 3.91-3.1 7.1-7 7.1c-1.61 0-3.1-.55-4.28-1.48a.994.994 0 0 0-1.32.08c-.42.42-.39 1.13.08 1.49A8.858 8.858 0 0 0 13 21c5.05 0 9.14-4.17 9-9.26c-.13-4.69-4.05-8.61-8.74-8.74m-.51 5c-.41 0-.75.34-.75.75v3.68c0 .35.19.68.49.86l3.12 1.85c.36.21.82.09 1.03-.26c.21-.36.09-.82-.26-1.03l-2.88-1.71v-3.4c0-.4-.34-.74-.75-.74"
                ></path>
              </svg>
              สั่งอีกครั้ง
            </Link>
            <Link
              href="../../history"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-6 text-lg font-DB_Med"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-6 h-6 mr-1"
              >
                <path
                  fill="currentColor"
                  d="M3 22V3h18v19l-3-2l-3 2l-3-2l-3 2l-3-2zM17 9V7h-2v2zm-4 0V7H7v2zm0 2H7v2h6zm2 2h2v-2h-2z"
                ></path>
              </svg>
              ประวัติคำสั่งซื้อ
            </Link>
          </div>
        )}

        {(status_order > 4 || status_order === 0) && (
          <Link
            href="../../product"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-12 text-lg font-DB_Med"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 21 21"
              className="w-6 h-6 mr-2"
            >
              <g
                fill="none"
                fillRule="evenodd"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.578 6.487A8 8 0 1 1 2.5 10.5"></path>
                <path d="M7.5 6.5h-4v-4"></path>
              </g>
            </svg>
            สั่งอาหารอีกครั้ง
          </Link>
        )}
      </footer>
    </>
  );
}
