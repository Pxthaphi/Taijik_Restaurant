"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";

// Define the Product interface
interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string; // Added Product_Image field
  Product_Status: number;
  count: number;
}

export default function Product_Hot() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchProducts() {
    try {
      // Fetch top-selling products using an RPC call
      const { data: orderData, error: orderError } = await supabase.rpc(
        "get_top_selling_products"
      );

      if (orderError) {
        throw orderError;
      }

      console.table(orderData);

      // Create an array to store all the product details
      let allProductData = [];

      // Loop through the orderData array to fetch details for each product
      for (const order of orderData) {
        const Product_ID = order.product_id;

        // Fetch necessary columns including Product_Image for each Product_ID
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select(
            "Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image, Product_Status"
          )
          .neq("Product_Status", 3)
          .eq("Product_ID", Product_ID)
          .order("Product_Status", { ascending: true });

        if (productError) {
          throw productError;
        }

        // Combine the fetched product data
        if (productData && productData.length > 0) {
          allProductData.push(...productData);
        }
      }

      // Update the state with the combined product data
      setProducts(allProductData as Product[]);
    } catch (error) {
      console.error("Error fetching products:", error);
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("realtime-products")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        (payload) => {
          console.log("Change received!", payload);
          fetchProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

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
      {products.map((product, index) => (
        <ProductCard
          key={product.Product_ID}
          product={product}
          rank={index + 1}
        />
      ))}
    </div>
  );
}

// ProductCard component
function ProductCard({ product, rank }: { product: Product; rank: number }) {
  if (product.Product_Status === 3) {
    return null; // Do not render products with Product_Status = 3
  }

  return (
    <div className="w-full items-center">
      <div
        className={`relative rounded-xl overflow-hidden shadow-lg w-full md:w-1/2 lg:w-1/2 xl:w-1/2 ${
          product.Product_Status === 2
            ? "bg-gray-200 opacity-50 pointer-events-none"
            : ""
        }`}
      >
        <Link
          href={
            product.Product_Status === 1
              ? `/customer/pages/product/${product.Product_ID}`
              : "#"
          }
        >
          {/* Star Rating */}
          <div className="absolute top-0 left-0 mt-2 mr-2">
            <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-white bg-orange-400 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 128 128"
                className="w-3 h-3"
              >
                <radialGradient
                  id="notoFire0"
                  cx={68.884}
                  cy={124.296}
                  r={70.587}
                  gradientTransform="matrix(-1 -.00434 -.00713 1.6408 131.986 -79.345)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset={0.314} stopColor="#ff9800"></stop>
                  <stop offset={0.662} stopColor="#ff6d00"></stop>
                  <stop offset={0.972} stopColor="#f44336"></stop>
                </radialGradient>
                <path
                  fill="url(#notoFire0)"
                  d="M35.56 40.73c-.57 6.08-.97 16.84 2.62 21.42c0 0-1.69-11.82 13.46-26.65c6.1-5.97 7.51-14.09 5.38-20.18c-1.21-3.45-3.42-6.3-5.34-8.29c-1.12-1.17-.26-3.1 1.37-3.03c9.86.44 25.84 3.18 32.63 20.22c2.98 7.48 3.2 15.21 1.78 23.07c-.9 5.02-4.1 16.18 3.2 17.55c5.21.98 7.73-3.16 8.86-6.14c.47-1.24 2.1-1.55 2.98-.56c8.8 10.01 9.55 21.8 7.73 31.95c-3.52 19.62-23.39 33.9-43.13 33.9c-24.66 0-44.29-14.11-49.38-39.65c-2.05-10.31-1.01-30.71 14.89-45.11c1.18-1.08 3.11-.12 2.95 1.5"
                ></path>
                <radialGradient
                  id="notoFire1"
                  cx={64.921}
                  cy={54.062}
                  r={73.86}
                  gradientTransform="matrix(-.0101 .9999 .7525 .0076 26.154 -11.267)"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset={0.214} stopColor="#fff176"></stop>
                  <stop offset={0.328} stopColor="#fff27d"></stop>
                  <stop offset={0.487} stopColor="#fff48f"></stop>
                  <stop offset={0.672} stopColor="#fff7ad"></stop>
                  <stop offset={0.793} stopColor="#fff9c4"></stop>
                  <stop
                    offset={0.822}
                    stopColor="#fff8bd"
                    stopOpacity={0.804}
                  ></stop>
                  <stop
                    offset={0.863}
                    stopColor="#fff6ab"
                    stopOpacity={0.529}
                  ></stop>
                  <stop
                    offset={0.91}
                    stopColor="#fff38d"
                    stopOpacity={0.209}
                  ></stop>
                  <stop
                    offset={0.941}
                    stopColor="#fff176"
                    stopOpacity={0}
                  ></stop>
                </radialGradient>
                <path
                  fill="url(#notoFire1)"
                  d="M76.11 77.42c-9.09-11.7-5.02-25.05-2.79-30.37c.3-.7-.5-1.36-1.13-.93c-3.91 2.66-11.92 8.92-15.65 17.73c-5.05 11.91-4.69 17.74-1.7 24.86c1.8 4.29-.29 5.2-1.34 5.36c-1.02.16-1.96-.52-2.71-1.23a16.1 16.1 0 0 1-4.44-7.6c-.16-.62-.97-.79-1.34-.28c-2.8 3.87-4.25 10.08-4.32 14.47C40.47 113 51.68 124 65.24 124c17.09 0 29.54-18.9 19.72-34.7c-2.85-4.6-5.53-7.61-8.85-11.88"
                ></path>
              </svg>
              <p className="text-xs font-DB_Med ms-1 text-white">
                ขายดีอันดับ {rank}
              </p>
            </span>
          </div>

          <img
            className="w-full h-24 object-cover"
            src={`${product.Product_Image}?t=${new Date().getTime()}`}
            alt={`Image of ${product.Product_Name}`} // Add alt text for accessibility
          />
          <div className="px-3 py-2">
            <div className="font-DB_Med text-lg">{product.Product_Name}</div>
            <div className="font-DB_Med text-xs mb-1 text-gray-500">
              {product.Product_Detail}
            </div>
            <div className="flex justify-between pt-2">
              <p className="text-gray-500 text-sm font-DB_Med my-0.5">
                15 นาที
              </p>
              <p className="text-base font-DB_Med text-green-600">
                ฿{product.Product_Price}
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
