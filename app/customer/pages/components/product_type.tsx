"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";

// Define the Product interface
interface Product {
  Type_ID: number;
  Type_Name: string;
}

export default function Product_Type() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProductsType() {
    try {
      // Fetch necessary columns including Product_Image
      const { data, error } = await supabase.from("product_type").select("*");

      if (error) {
        throw error;
      } else {
        setProducts(data as Product[]);
      }
    } catch (error) {
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProductsType();
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div className="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (products.length === 0) {
    return <p>No products available</p>;
  }

  return (
    <div className="flex flex-row gap-2 overflow-x-auto">
      {products.map((product) => (
        <ProductCard key={product.Type_ID} product={product} />
      ))}
    </div>
  );
}

// ProductCard component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="flex-shrink-0 w-auto">
      <div className="relative overflow-hidden w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
        <button className="rounded-xl bg-gray-50">
          <div className="px-3 py-2">
            <div className="flex justify-around items-center">
              <span className="me-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="#F39E01"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </span>
              <div className="font-DB_Med text-sm">{product.Type_Name}</div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}
