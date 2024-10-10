"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // Adjust this import if needed
import Food from "./components/food";

// Define the ProductType interface
interface ProductType {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

export default function Menu() {
  const router = useRouter();
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch product types from Supabase
  // Fetch product types from Supabase
  const fetchProductTypes = async () => {
    try {
      const { data, error } = await supabase.from("product_type").select("*");

      if (error) {
        throw error;
      }
      setProductTypes(data as ProductType[]);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductTypes();
  }, []);

  const goBack = () => {
    router.push("../");
  };

  if (loading) {
    return <p>Loading categories...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
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
        <div className="font-DB_Med text-2xl pt-0.5">เมนูอาหาร</div>
      </header>

      <section>
        <div className="flex items-center justify-end mx-6 mt-7">
          <Link
            href="menu/pages/AddProduct"
            className="inline-flex items-center bg-green-500 hover:bg-green-600 text-white text-sm font-DB_Med py-2 px-3 rounded-2xl "
          >
            <div className="flex item-center pr-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 48 48"
                className=""
              >
                <defs>
                  <mask id="ipSAddOne0">
                    <g fill="none" strokeLinejoin="round" strokeWidth={4}>
                      <path
                        fill="#fff"
                        stroke="#fff"
                        d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"
                      ></path>
                      <path
                        stroke="#000"
                        strokeLinecap="round"
                        d="M24 16v16m-8-8h16"
                      ></path>
                    </g>
                  </mask>
                </defs>
                <path
                  fill="currentColor"
                  d="M0 0h48v48H0z"
                  mask="url(#ipSAddOne0)"
                ></path>
              </svg>
            </div>
            เพิ่มข้อมูลเมนูอาหาร
          </Link>
        </div>
      </section>

      <section className="animate-fade-up animate-duration-[1000ms]">
        {productTypes.length > 0 ? (
          productTypes.map((type) => (
            <div key={type.Type_ID} className="mb-10">
              {/* Category Header */}
              <div className="flex items-center justify-between mx-6 mt-7">
                <div className="font-DB_Med text-xl">{type.Type_Name}</div>
              </div>

              {/* Product List */}
              <div className="mx-6 mt-6 my-9">
                <Food typeId={type.Type_ID} />
              </div>
            </div>
          ))
        ) : (
          <p className="text-center">No categories available</p>
        )}
      </section>
    </>
  );
}
