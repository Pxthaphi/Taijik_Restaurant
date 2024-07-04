"use client";
import Swal from "sweetalert2";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./css/sweet_style.css";
import { getUserID } from "@/app/auth/getUserID";
import { Select, SelectItem, Avatar } from "@nextui-org/react";
import { typeproduct } from "./components/data";
import confetti from "canvas-confetti";

export default function Random_Food() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const userID = getUserID();
  console.log("UserID (Random page) : ", userID);

  const goBack = () => {
    router.back();
  };

  const handleAnimationClick = async () => {
    await randomFood(); // เรียกใช้ฟังก์ชัน randomFood และรอจนกว่าจะเสร็จสมบูรณ์
  };

  async function randomFood() {
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
      // นำ confetti มาแสดง
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Add a delay of 1 second (1000 milliseconds)
      setTimeout(() => {
        Swal.fire({
          html: `
          <div>
            <div class="text-3xl text-gray-700 font-DB_Med">สุ่มอาหารสำเร็จ</div>
            <div class="my-2">
              <img src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Product/2.jpg" alt="Custom image" class="w-full h-auto rounded-2xl my-5"/>
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
            <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 24 24">...</svg>
            <div class="text-base text-white font-DB_v4">สั่งอาหารเลย</div>
          </div>`,
          denyButtonText: `
          <div class="flex justify-center items-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 21 21" stroke-width="2">...</svg>
            <div class="text-base font-DB_v4 text-white">สุ่มใหม่อีกครั้ง</div>
          </div>`,
          denyButtonColor: "#E59B2B",
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) {
            console.log("สั่งอาหารอีกครั้ง");
          } else if (result.isDenied) {
            handleAnimationClick(); // Assuming this function is defined elsewhere
          }
        });
      }, 100); // Delay of 1000 milliseconds (1 second)
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
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">สุ่มเมนูอาหาร</div>
      </header>

      <section className="flex justify-center mt-12 pt-10 animate-fade-up animate-duration-[1000ms]">
        <div className="w-full max-w-sm p-4 bg-white rounded-lg shadow-lg sm:p-6">
          <div className="flex justify-center my-5">
            <div className="me-2 h-8 bg-gray-100 p-0.5 rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 text-orange-400 animate-rotate-y animate-infinite animate-duration-[2500ms] animate-ease-in-out"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3-3-3H4a1 1 0 1 1 0-2h3l4 4 4-4h2V5l4 3.001L17 11V9h-1l-3 3 3 3h1v-2l4 3-4 3v-2h-2l-4-4-4 4z"
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

          <Select
            items={typeproduct}
            placeholder="กรุณาเลือกหมวดหมู่เพื่อทำการสุ่ม"
            labelPlacement="outside"
            className="pt-5"
            classNames={{
              base: "max-w-sm",
              trigger: "h-12",
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data?.Type_Name ?? "Unknown"}
                    className="flex-shrink-0"
                    size="sm"
                    src={item.data?.Type_Icon ?? ""}
                  />
                  <div className="flex flex-col">
                    <span>{item.data?.Type_Name ?? "Unknown"}</span>
                    <span className="text-default-500 text-tiny">
                      {/* ({item.data?.email ?? "No email"}) */}
                    </span>
                  </div>
                </div>
              ));
            }}
            aria-label="เลือกหมวดหมู่เพื่อทำการสุ่ม"
          >
            {(typeproduct) => (
              <SelectItem
                key={typeproduct.Type_ID}
                textValue={typeproduct.Type_Name}
              >
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={typeproduct.Type_Name}
                    className="flex-shrink-0"
                    size="sm"
                    src={typeproduct.Type_Icon}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{typeproduct.Type_Name}</span>
                    <span className="text-tiny text-default-400">
                      {/* {type.email} */}
                    </span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          <div className="flex justify-center my-4 mt-8">
            <div className="inline-flex items-center bg-orange-400 hover:bg-orange-500 text-white rounded-3xl py-2 px-6 text-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 me-2 text-white"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3-3-3H4a1 1 0 1 1 0-2h3l4 4 4-4h2V5l4 3.001L17 11V9h-1l-3 3 3 3h1v-2l4 3-4 3v-2h-2l-4-4-4 4z"
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
