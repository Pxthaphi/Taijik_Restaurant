'use client'
import Product from "../components/product";
import Link from "next/link";
import History_Order from "../components/history";
import Product_Type from "../components/product_type";
import { useRouter } from "next/navigation";

export default function Show_Product() {
  const router = useRouter();

  const goBack = () => {
    router.back(); // This will navigate back to the previous page
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
        <div className="py-1 px-1 item-center bg-gray-100 rounded-xl">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="#FF8291"
            className="w-7 h-7"
          >
            <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
          </svg>
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
      <section>
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
      <section>
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
      <section>
        <div className="flex items-center justify-between mx-6 mt-7">
          <div className="font-DB_Med text-xl">เมนูอาหาร</div>
        </div>

        <div className="mx-6 mt-6">
          <Product />
        </div>
      </section>
    </main>
  );
}
