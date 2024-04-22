"use client";
import Swal from "sweetalert2";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import "./css/sweet_style.css";

export default function Random_Food() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    router.back();
  };

  const handleAnimationClick = async () => {
    await Random(); // เรียกใช้ฟังก์ชัน Random และรอจนกว่าจะเสร็จสมบูรณ์
  };

  async function Random() {
    Swal.fire({
      title: "กำลังสุ่มเมนูอาหาร",
      text: "กรุณารอสักครู่....",
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2000,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(Swal.getDenyButton());
      },
    }).then(() => {
      Swal.fire({
        html: `
          <div>
            <div class="text-3xl text-gray-700 font-DB_Med">สุ่มอาหารสำเร็จ</div>
            <div class="my-2">
              <img src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Product/test3.jpg" alt="Custom image" class="w-full h-auto rounded-2xl my-5"/>
            </div>  
            <div class="mt-1">
              <div class="flex justify-center item-center text-gray-700 text-lg font-DB_Med">เมนูที่สุ่มได้คือ <span class="text-orange-600 mx-1">ข้าวกะเพราไก่</span></div>
            </div>
          </div>`,
        icon: "success",
        showDenyButton: true,
        showCancelButton: false,
        confirmButtonText: `
          <div class="flex justify-center items-center">
            <!-- SVG icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 24 24">
              <path fill="currentColor" d="m17.275 20.25l3.475-3.45l-1.05-1.05l-2.425 2.375l-.975-.975l-1.05 1.075zM6 9h12V7H6zm12 14q-2.075 0-3.537-1.463T13 18t1.463-3.537T18 13t3.538 1.463T23 18t-1.463 3.538T18 23M3 22V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v6.675q-.7-.35-1.463-.513T18 11H6v2h7.1q-.425.425-.787.925T11.675 15H6v2h5.075q-.05.25-.062.488T11 18q0 1.05.288 2.013t.862 1.837L12 22l-1.5-1.5L9 22l-1.5-1.5L6 22l-1.5-1.5z"></path>
            </svg>
            <!-- Text -->
            <div class="text-base text-white font-DB_v4">สั่งอาหารเลย</div>
          </div>
        `,
        denyButtonText: `
          <div class="flex justify-center items-center">
            <!-- SVG icon -->
            <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 21 21" stroke-width="2">
              <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.578 6.487A8 8 0 1 1 2.5 10.5"></path>
                <path d="M7.5 6.5h-4v-4"></path>
              </g>
            </svg>
            <!-- Text -->
            <div class="text-base font-DB_v4 text-white">สุ่มใหม่อีกครั้ง</div>
          </div>
        `,
        denyButtonColor: "#E59B2B",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          // เมื่อกดปุ่มสั่งอาหารเลย
          console.log("สั่งอาหารอีกครั้ง");
        } else if (result.isDenied) {
          // เมื่อกดปุ่มสุ่มอาหารอีกครั้ง
          handleAnimationClick();
        }
      });
    });
  }
  return (
    <>
      <header className="mx-8 mt-8 flex justify-center item-center">
        <div className="absolute py-1 px-1 top-8 left-8" onClick={goBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">สุ่มเมนูอาหาร</div>
      </header>

      <section className="flex justify-center mt-12 pt-10 animate-fade-up animate-duration-[1500ms]">
        <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-lg sm:p-6">
          <div className="flex justify-center my-5 ">
            <div className="me-2 h-8 bg-gray-100 p-0.5 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 text-orange-400 animate-rotate-y animate-infinite animate-duration-[2500ms] animate-ease-in-out" // Adjusted size and color
              >
                <path
                  fill="currentColor" // Changed to fill with currentColor
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3l-3-3H4a1.001 1.001 0 0 1 0-2h3l4 4l4-4h2V5l4 3.001L17 11V9h-1l-3 3l3 3h1v-2l4 3l-4 3v-2h-2l-4-4l-4 4z"
                ></path>
              </svg>
            </div>

            <h5 className="mb-3 text-xl font-DB_Med text-gray-900">
              สุ่มเมนูอาหาร
            </h5>
          </div>

          <h5 className="text-lg font-DB_Med text-gray-700">
            หมวดหมู่เมนูอาหารที่ต้องการสุ่ม
          </h5>
          <p className="text-sm font-DB_v4 text-gray-500">
            เลือกหมวดหมู่ที่ต้องการสุ่ม เช่น หมวดหมู่ทั้งหมด , เมนูขายดี ,
            เมนูข้าว , เมนูเส้น หรือ เมนูต้ม เป็นต้น
          </p>
          <ul className="my-4 space-y-3">
            <li>
              <a
                href="#"
                className="flex items-center p-3 text-base font-bold text-gray-900 rounded-lg bg-gray-50 hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
              >
                <svg
                  aria-hidden="true"
                  className="h-4"
                  viewBox="0 0 40 38"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M39.0728 0L21.9092 12.6999L25.1009 5.21543L39.0728 0Z"
                    fill="#E17726"
                  />
                  {/* Other paths */}
                </svg>
                <span className="flex-1 ms-3 whitespace-nowrap">
                  ค่อยมาแก้ ส่วนเลือก
                </span>
                <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
                  Popular
                </span>
              </a>
            </li>
            {/* Other list items */}
          </ul>
          <div className="flex justify-center item- my-4 mt-8">
            <div className="inline-flex items-center bg-orange-400 hover:bg-orange-500 text-white rounded-3xl py-2 px-6 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 me-2 text-white" // Adjusted size and color
              >
                <path
                  fill="currentColor" // Changed to fill with currentColor
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3l-3-3H4a1.001 1.001 0 0 1 0-2h3l4 4l4-4h2V5l4 3.001L17 11V9h-1l-3 3l3 3h1v-2l4 3l-4 3v-2h-2l-4-4l-4 4z"
                ></path>
              </svg>

              <div
                className="font-DB_Med text-base text-white"
                onClick={handleAnimationClick}
              >
                กดเพื่อทำการสุ่มเมนูอาหาร
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-7 mt-9 animate-fade-up animate-duration-[1500ms]">
        <div className="font-DB_Med text-xl text-gray-600">ผลลัพธ์การสุ่ม</div>
      </section>
    </>
  );
}
