"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Image from "next/image";


// Define the Product interface
interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string; // Added Product_Image field
}

export default function Product() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch products from Supabase
  async function fetchProducts() {
    try {
      // Fetch necessary columns including Product_Image
      const { data, error } = await supabase
        .from("products")
        .select(
          "Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image"
        );

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
    fetchProducts();
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
    <div className="grid justify-center grid-cols-2 gap-4">
      {products.map((product) => (
        <ProductCard key={product.Product_ID} product={product} />
      ))}
    </div>
  );
}

// ProductCard component
function ProductCard({ product }: { product: Product }) {
  return (
    <div className="w-full items-center">
      <div className="relative rounded-xl overflow-hidden shadow-lg w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
        {/* Star Rating */}
        <div className="absolute top-0 right-0 mt-2 mr-2">
          <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-white rounded-md">
            <svg
              className="w-3 h-3 text-yellow-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 22 20"
            >
              <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
            </svg>
            <p className="text-xs font-DB_Med ms-1 text-yellow-500">5.0</p>
          </span>
        </div>

        <img
          className="w-full h-24 object-cover"
          src={product.Product_Image} // Use Product_Image field as image source
          alt={product.Product_Name}
        />
        <div className="px-3 py-2">
          <div className="font-DB_Med text-lg">{product.Product_Name}</div>
          <div className="font-DB_Med text-xs mb-1 text-gray-500">{product.Product_Detail}</div>
          <div className="flex justify-between pt-2">
            <p className="text-gray-500 text-sm font-DB_Med my-0.5">
              15 นาที
            </p>
            <p className="text-base font-DB_Med text-green-600">
              ฿{product.Product_Price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
