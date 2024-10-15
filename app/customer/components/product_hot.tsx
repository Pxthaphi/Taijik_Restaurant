"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";
import dynamic from 'next/dynamic';

// Dynamically import the FireAnimation component with SSR disabled
const FireAnimation = dynamic(() => import('./assets/fire'), { ssr: false });

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
    return <p className="font-DB_v4">ขณะนี้ยังไม่มีเมนูอาหารขายดี</p>;
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
              <FireAnimation size={20} />
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
