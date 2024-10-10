"use client";
import { useState, useEffect } from "react";
import Product from "../components/product";
import Product_Hot from "../../components/product_hot";
import Link from "next/link";
import History_Order from "../components/history";
import Product_Type from "../components/product_type";
import { useRouter } from "next/navigation";
import { getUserID } from "@/app/auth/getUserID";
import { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Divider } from "@nextui-org/react";
import FireAnimation from "../../components/assets/fire";

interface Product {
  User_ID: string;
  Product_ID: string;
  Product_Qty: number;
}

interface ProductType {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

export default function Show_Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [productType, setProductType] = useState<ProductType[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const userID = getUserID();
  const router = useRouter();

  useEffect(() => {
    const fetchProductsFromCart = async () => {
      try {
        const { data, error } = await supabase
          .from("cart")
          .select("User_ID, Product_ID, Product_Qty")
          .eq("User_ID", userID);

        if (error) throw error;

        setProducts(data);

        const totalQuantity = data.reduce(
          (sum, item) => sum + item.Product_Qty,
          0
        );
        setTotalQty(totalQuantity);
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error fetching products: ", error.message);
          setError(error.message);
        } else {
          console.error("Error fetching products: ", error);
          setError("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    async function fetchType() {
      try {
        // Fetch necessary columns including Product_Image
        const { data, error } = await supabase.from("product_type").select("*");

        if (error) {
          throw error;
        } else {
          setProductType(data as ProductType[]);
          console.table(data);
        }
      } catch (error) {
        setError((error as PostgrestError).message);
      }
    }

    if (userID) {
      fetchProductsFromCart();
    }

    fetchType();
  }, [userID]);

  // ฟังก์ชันเพื่อเปิด sheet
  const openSheet = () => {
    setIsSheetOpen(true);
  };

  // ฟังก์ชันเพื่อปิด sheet
  const closeSheet = () => {
    setIsSheetOpen(false);
  };

  const goBack = () => {
    router.push("../");
  };

  return (
    <main>
      <header className="mx-8 flex justify-between mt-8">
        <div className="py-1 px-1 item-center" onClick={goBack}>
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
        <div className="font-DB_Med text-2xl pt-0.5">สั่งอาหาร</div>
        <div className="relative py-1 px-1 item-center bg-gray-100 rounded-xl">
          <Link href="favorite">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#FF8291"
              className="w-7 h-7"
            >
              <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </Link>
          {/* {totalQty > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-xs">
              {totalQty}
            </div>
          )} */}
        </div>
      </header>

      {/* Search */}
      <section>
        <div className="mx-6 mt-8">
          <div className="relative pt-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="ค้นหาเมนูที่คุณชอบ..."
              className="pl-10 w-full pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* ประเภทอาหาร */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        {/* <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">ประเภทเมนูอาหาร</div>
          <button
            onClick={openSheet} // เรียกใช้ฟังก์ชันเพื่อเปิด sheet เมื่อคลิก
            className="inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-DB_Med py-1 px-3 rounded-2xl"
          >
            ดูทั้งหมด
          </button>
        </div> */}

        {/* Sheet จะถูกแสดงเมื่อ isSheetOpen เป็น true */}
        {isSheetOpen && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetContent side={"bottom"} className="rounded-t-2xl px-4">
              <SheetHeader className="">
                <SheetTitle>
                  <h1 className="font-DB_v4 text-lg text-gray-800">ตัวกรอง</h1>
                </SheetTitle>
              </SheetHeader>
              <Divider className="my-4" />

              <SheetDescription>
                <div className="space-y-4">
                  {/* ร้านอาหารที่เปิดเท่านั้น */}
                  <div className="flex justify-between items-center">
                    <span className="text-base font-DB_Med text-gray-800">
                      เมนูอาหารที่มีเหลืออยู่เท่านั้น
                    </span>
                    <input
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-green-500"
                    />
                  </div>

                  {/* โปรโมชั่น */}
                  {/* <div>
                  <h3 className="text-base font-DB_Med text-gray-800">โปรโมชั่น</h3>
                  <p className="text-sm text-gray-600">เก็บโค้ดลดเพิ่ม</p>
                </div> */}

                  {/* ราคา */}
                  <div>
                    <h3 className="text-base font-DB_Med text-gray-800">
                      ราคา
                    </h3>
                    <div className="flex space-x-2 mt-2">
                      {[...Array(5)].map((_, index) => (
                        <button
                          key={index}
                          className="px-3 py-1 border rounded text-gray-800 font-DB_Med"
                        >
                          ฿{index + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ประเภทอาหาร */}
                  <div>
                    <h3 className="text-base font-DB_Med text-gray-800">
                      ประเภทอาหาร
                    </h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "สตรีทฟู้ด/รถเข็น",
                        "ชานมไข่มุก",
                        "อาหารญี่ปุ่น",
                        "อาหารอีสาน",
                        "อาหารไทย",
                        "อาหารทะเล",
                        "อาหารเช้า",
                        "ก๋วยเตี๋ยว",
                        "ของหวาน",
                        "ร้านกาแฟ",
                        "เบเกอรี่ เค้ก",
                        "อาหารตามสั่ง",
                        "อาหารจีน",
                        "อาหารจานเดียว",
                        "ข้าวต้ม",
                        "ฟาสต์ฟู้ด",
                        "อาหารเวียดนาม",
                        "ซูชิ",
                        "อาหารคลีน/สลัด",
                        "ติ่มซำ",
                      ].map((type, index) => (
                        <button
                          key={index}
                          className="px-4 py-1 border rounded text-gray-800 text-sm"
                        >
                          <p className="font-DB_v4">{type}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetDescription>

              {/* Action Buttons */}
              <div className="flex justify-between mt-8 px-4">
                <button className="w-[48%] py-2 border rounded-xl shadow-sm text-gray-800 font-DB_Med">
                  ล้างค่า
                </button>
                <button className="w-[48%] py-2 bg-green-500 text-white rounded-xl shadow-lg font-DB_Med">
                  ค้นหา
                </button>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </section>

      {/* รายการอาหารที่เคยซื้อ */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">สั่งอีกครั้ง</div>
        </div>
        <div className="mx-6 mt-6">
          <History_Order />
        </div>
      </section>

      {/* รายการอาหารขายดี */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="flex justify-center font-DB_Med text-xl">
            <div className="mr-1">เมนูอาหาร ขายดี</div>
            <div className="-mt-1">
              <FireAnimation size={30} />
            </div>
          </div>
        </div>

        <div className="mx-6 mt-6 my-9">
          <Product_Hot />
        </div>
      </section>

      {/* แยกแต่ละประเภทเมนูอาหาร */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        {productType.length > 0 ? (
          productType.map((type) => (
            <div key={type.Type_ID} className="mb-10">
              {/* Category Header */}
              <div className="flex items-center justify-between mx-6 mt-7">
                <div className="font-DB_Med text-xl">{type.Type_Name}</div>
              </div>

              {/* Product List */}
              <div className="mx-6 mt-6 my-9">
                <Product typeId={type.Type_ID} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No categories available</p>
        )}
      </section>

      {totalQty > 0 && (
        <footer className="fixed bottom-8 right-8 z-50">
          <div className="relative">
            <Link href="product/order_product">
              <div className="bg-green-500 rounded-full w-14 h-14 flex items-center justify-center cursor-pointer shadow-xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#ffffff"
                  className="w-8 h-8"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                <div className="absolute top-1 -right-1 bg-gray-100 text-green-600 text-base font-DB_Med rounded-full h-6 w-6 flex items-center justify-center">
                  {totalQty}
                </div>
              </div>
            </Link>
          </div>
        </footer>
      )}
    </main>
  );
}
