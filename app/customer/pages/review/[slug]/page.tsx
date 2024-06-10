"use client";
import { supabase } from "@/lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PageProps {
  params: {
    slug: string;
  };
}

interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string; // Added Product_Image field
}

export default function review({ params }: PageProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  // Function to fetch products from Supabase
  async function fetchNameProducts() {
    try {
      // Fetch necessary columns including Product_Image
      const { data, error } = await supabase
        .from("products")
        .select(
          "Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image"
        ) // Include Product_Image in the query
        .eq("Product_ID", params.slug);

      if (error) {
        throw error;
      } else {
        setProducts(data as Product[]);
        console.log(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchNameProducts();
  }, []); // Run once on component mount

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
        <div className="font-DB_Med text-2xl pt-0.5">ผัดซีอิ้ว</div>
        {/* <div className="font-DB_Med text-2xl pt-0.5">{product.Product_Name}</div> */}
        {/* {products.map((product) => (
        ))} */}
      </header>

      <section className="mx-8 mt-8">
        <h4 className="text-gray-600 font-DB_Med">คะแนนความพึงพอใจ</h4>
        <div className="flex justify-center item-center">
          <div className="mt-5">
            <div className="flex flex-row-reverse justify-end items-center">
              <input
                id="hs-ratings-readonly-1"
                type="radio"
                className="peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0"
                name="hs-ratings-readonly"
                value="1"
              />
              <label className="peer-checked:text-yellow-400 text-gray-300 pointer-events-none">
                <svg
                  className="flex-shrink-0 size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              </label>
              <input
                id="hs-ratings-readonly-2"
                type="radio"
                className="peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0"
                name="hs-ratings-readonly"
                value="2"
              />
              <label className="peer-checked:text-yellow-400 text-gray-300 pointer-events-none">
                <svg
                  className="flex-shrink-0 size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              </label>
              <input
                id="hs-ratings-readonly-3"
                type="radio"
                className="peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0"
                name="hs-ratings-readonly"
                value="3"
              />
              <label className="peer-checked:text-yellow-400 text-gray-300 pointer-events-none">
                <svg
                  className="flex-shrink-0 size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              </label>
              <input
                id="hs-ratings-readonly-4"
                type="radio"
                className="peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0"
                name="hs-ratings-readonly"
                value="4"
              />
              <label className="peer-checked:text-yellow-400 text-gray-300 pointer-events-none">
                <svg
                  className="flex-shrink-0 size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              </label>
              <input
                id="hs-ratings-readonly-5"
                type="radio"
                className="peer -ms-5 size-5 bg-transparent border-0 text-transparent cursor-pointer appearance-none checked:bg-none focus:bg-none focus:ring-0 focus:ring-offset-0"
                name="hs-ratings-readonly"
                value="5"
              />
              <label className="peer-checked:text-yellow-400 text-gray-300 pointer-events-none">
                <svg
                  className="flex-shrink-0 size-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"></path>
                </svg>
              </label>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
