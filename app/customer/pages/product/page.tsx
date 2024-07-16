"use client";
import { useState, useEffect } from "react";
import Product from "../components/product";
import Link from "next/link";
import History_Order from "../components/history";
import Product_Type from "../components/product_type";
import { useRouter } from "next/navigation";
import { getUserID } from "@/app/auth/getUserID";
import { supabase } from "@/lib/supabase";

interface Product {
  User_ID: string;
  Product_ID: string;
  Product_Qty: number;
}

export default function Show_Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    if (userID) {
      fetchProductsFromCart();
    }
  }, [userID]);

  const goBack = () => {
    router.push("../")
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
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">ประเภทเมนูอาหาร</div>
          <Link
            href=""
            className="inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-DB_Med py-1 px-3 rounded-2xl"
          >
            ดูทั้งหมด
          </Link>
        </div>
        <div className="mx-6 mt-6">
          <Product_Type />
        </div>
      </section>

      {/* รายการอาหารที่เคยซื้อ */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">สั่งอีกครั้ง</div>
          <Link
            href=""
            className="inline-block bg-green-500 hover:bg-green-600 text-white text-xs font-DB_Med py-1 px-3 rounded-2xl"
          >
            ดูทั้งหมด
          </Link>
        </div>
        <div className="mx-6 mt-6">
          <History_Order />
        </div>
      </section>

      {/* รายการอาหาร */}
      <section className="animate-fade-up animate-duration-[1000ms]">
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">เมนูอาหาร</div>
        </div>

        <div className="mx-6 mt-6 my-9">
          <Product />
        </div>
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
