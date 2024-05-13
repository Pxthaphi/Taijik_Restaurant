"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import PickerWithButtonField from "./components/timepicker";

export default function Order_Product() {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState<string>("");

  let Order_ID = "TK-0000-11111";

  const handleCloseTimePicker = () => {
    // ปิด mobiletimepicker และทำอย่างอื่นที่คุณต้องการ เช่น นำค่าเวลาที่เลือกไปใช้งานต่อ
    console.log("time to select : ", selectedTimeDisplay);
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const goBack = () => {
    router.back();
  };

  return (
    <>
      <main>
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
          <div className="font-DB_Med text-2xl pt-0.5">สรุปคำสั่งซื้อ</div>
        </header>

        <section className="flex justify-center items-center pt-2 mt-5">
          <div className="flex">
            <div className="flex bg-gray-100 hover:bg-gray-200 rounded-lg transition p-1">
              <nav className="flex space-x-1" aria-label="Tabs" role="tablist">
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-lg hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options1" ? "active" : ""
                  }`}
                  id="segment-item-1"
                  data-hs-tab="#segment-1"
                  aria-controls="segment-1"
                  role="tab"
                  onClick={() => handleOptionSelect("options1")}
                >
                  <p className="text-base font-DB_v4">กินที่ร้าน</p>
                  {selectedOption === "options1" && selectedTimeDisplay && (
                    <p className="text-base font-DB_v4 text-orange-500">
                      ({selectedTimeDisplay})
                    </p>
                  )}
                  {selectedOption === "options1" && <PickerWithButtonField />}
                </button>
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-lg hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options2" ? "active" : ""
                  }`}
                  id="segment-item-2"
                  data-hs-tab="#segment-2"
                  aria-controls="segment-2"
                  role="tab"
                  onClick={() => handleOptionSelect("options2")}
                >
                  <p className="text-base font-DB_v4">ใส่กล่องกลับบ้าน</p>
                  {selectedOption === "options2" && selectedTimeDisplay && (
                    <p className="text-base font-DB_v4 text-orange-500">
                      ({selectedTimeDisplay})
                    </p>
                  )}
                  {selectedOption === "options2" && <PickerWithButtonField />}
                </button>
              </nav>
            </div>
          </div>
        </section>

        <section className="mt-6 mx-8">
          <div className="max-w-full my-2">
            <div className="rounded-2xl flex items-center">
              <div className="w-1/3 ms-2">
                <img
                  className="w-18 h-18 object-cover rounded-xl"
                  src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Product/test3.jpg"
                  alt="Image Description"
                />
              </div>
              <div className="w-1/2 ms-6 pt-1">
                <h3 className="text-lg font-DB_Med text-gray-700">
                  ข้าวกะเพราไก่
                </h3>

                <p className="text-sm text-gray-500 font-DB_v4">
                  เนื้อสัตว์ หมู , เพิ่ม ไข่ดาว
                </p>

                <div className="flex justify-between mt-4 gap-x-6">
                  <h3 className="text-lg font-DB_Med text-green-600 pt-2">
                    ฿45
                  </h3>
                  <div className="ms-12 pt-1 ">
                    {/* Input Number */}
                    <div
                      className="py-1.5 px-2 inline-block bg-white border border-gray-200 rounded-xl "
                      data-hs-input-number=""
                    >
                      <div className="flex items-center gap-x-1">
                        <button
                          type="button"
                          onClick={decrementQuantity}
                          className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                          data-hs-input-number-decrement=""
                        >
                          <svg
                            className="flex-shrink-0 size-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14"></path>
                          </svg>
                        </button>
                        <input
                          className="p-0 w-6 bg-transparent border-0 text-gray-800 text-center focus:ring-0"
                          type="text"
                          value={quantity}
                          readOnly
                          data-hs-input-number-input=""
                        />
                        <button
                          type="button"
                          onClick={incrementQuantity}
                          className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
                          data-hs-input-number-increment=""
                        >
                          <svg
                            className="flex-shrink-0 size-3.5"
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M5 12h14"></path>
                            <path d="M12 5v14"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                    {/* End Input Number */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className="mx-8 h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>

        <section className="mx-8 mt-5">
          <div className="text-lg font-DB_Med">ใช้คูปองส่วนลด</div>

          <div className="pt-3">
            <div className="relative flex rounded-full shadow-sm">
              <input
                type="text"
                id="hs-trailing-button-add-on-with-icon-and-button"
                name="hs-trailing-button-add-on-with-icon-and-button"
                placeholder="ใส่รหัสคูปองเพื่อใช้ส่วนลด"
                className="py-3 px-6 ps-11 block w-full border border-gray-200 shadow-sm rounded-s-full text-sm"
              />
              <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <button
                type="button"
                className="py-2 px-6 rounded-e-full border border-transparent bg-green-600 hover:bg-green-700"
              >
                <p className="text-xs font_DB_Med text-white">ใช้งานโค้ด</p>
              </button>
            </div>
          </div>

          <div className="text-xs text-red-500 font-DB_v4 mt-4">
            * คุณมีคูปองที่สามารถใช้ได้จำนวน 2 คูปอง
          </div>
        </section>

        <section className="mx-8 mt-5">
          <div className="text-xl text-gray-800 font-DB_Med mt-4">ราคารวม</div>
          <div className="flex justify-between mt-3">
            <div className="text-base text-gray-800 font-DB_Med">
              ข้าวกะเพราไก่
            </div>
            <div className="text-base text-gray-800 font-DB_Med">฿45.00</div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="text-base text-gray-800 font-DB_Med">ส่วนลด</div>
            <div className="text-base text-gray-800 font-DB_Med">฿0</div>
          </div>

          <hr className="h-px my-2 bg-gray-100 border-0 mt-3 pt-1 rounded-full"></hr>

          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-2xl text-green-600 font-DB_Med">฿45</div>
          </div>
        </section>
      </main>

      <footer className="flex justify-center fixed bottom-0 inset-x-0 mb-8 mt-12">
        <Link
          href={`order_product/${Order_ID}`}
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-12 text-lg font-DB_Med"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path
              fillRule="evenodd"
              d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
              clipRule="evenodd"
            />
          </svg>
          สั่งอาหารเลย
        </Link>
      </footer>
    </>
  );
}
