"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

// Dynamically import the FireAnimation component with SSR disabled
const FireAnimation = dynamic(() => import("../../components/assets/fire"), {
  ssr: false,
});

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

const Leaderboard: React.FC = () => {
  const router = useRouter();
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
        const quantitySold = order.count; // Assuming this is in your orderData

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

        // Combine the fetched product data with the quantity sold
        if (productData && productData.length > 0) {
          // Assuming productData is an array with a single product
          const productWithQuantity = {
            ...productData[0], // Get the first product's details
            count: quantitySold, // Add the quantity sold to the product data
          };
          allProductData.push(productWithQuantity);
        }
      }

      // Update the state with the combined product data
      setProducts(allProductData as Product[]);
      console.table(allProductData);
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

  const navigateBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-green-400 text-white p-4">
      {/* Top Navigation */}
      <header className="mx-8 mt-8 flex justify-center items-center mb-10">
        <div
          onClick={navigateBack}
          className="absolute py-1 px-1 top-8 left-8 cursor-pointer pt-5"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">
          สรุปการจัดอันดับเมนูอาหาร
        </div>
      </header>

      {/* Tab Selector */}
      <div className="flex justify-center space-x-4 mb-10">
        <Tabs
          key="light"
          variant="light"
          size="lg"
          aria-label="Tabs variants"
          radius="lg"
          fullWidth
          className="text-white hover:text-gray-300 focus:text-gray-300"
        >
          <Tab
            key="photos"
            title="เมนูขายดี"
            className="text-white hover:text-gray-300 focus:text-gray-300"
          />
          <Tab
            key="music"
            title="เมนูที่ไม่ค่อยมีใครสั่ง"
            className="text-white hover:text-gray-300 focus:text-gray-300"
          />
        </Tabs>
      </div>

      {/* Podium with Best-Selling Items */}
      <div className="relative">
        <div className="flex justify-center items-end space-x-10 z-0">
          {products.length > 2 ? (
            <>
              {/* Second Place */}
              <motion.div
                key={products[1].Product_ID}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-white mx-auto shadow-lg">
                    <img
                      src={products[1].Product_Image}
                      alt={products[1].Product_Name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-base font-DB_Med">
                    {products[1].Product_Name}
                  </p>
                  <p className="text-sm font-DB_Med text-gray-200">
                    ขายได้ {products[1].count} ชิ้น{" "}
                  </p>
                </div>
                <div className="text-[4rem] font-DB_Med text-gray-500">2</div>
                <div className="bg-gray-500 h-[8rem] w-16 mx-auto rounded-t-xl"></div>
              </motion.div>

              {/* First Place (Podium Highest) */}
              <motion.div
                key={products[0].Product_ID}
                className="text-center mx-4"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="relative">
                  <div className="h-24 w-24 rounded-full bg-white mx-auto shadow-lg">
                    <img
                      src={products[0].Product_Image}
                      alt={products[0].Product_Name}
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  </div>
                  <span className="absolute top-0 -right-5 bg-yellow-300 p-2 rounded-full">
                    <FireAnimation size={30} />
                  </span>
                  <p className="mt-2 text-lg font-DB_Med">
                    {products[0].Product_Name}
                  </p>
                  <p className="text-sm font-DB_Med text-gray-200">
                    ขายได้ {products[1].count} ชิ้น{" "}
                  </p>
                </div>
                <div className="text-[4rem] font-DB_Med text-yellow-400">1</div>
                <div className="bg-yellow-400 h-[12rem] w-16 mx-auto rounded-t-xl"></div>
              </motion.div>

              {/* Third Place */}
              <motion.div
                key={products[2].Product_ID}
                className="text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-white mx-auto shadow-lg">
                    <img
                      src={products[2].Product_Image}
                      alt={products[2].Product_Name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  </div>
                  <p className="mt-2 text-base font-DB_Med">
                    {products[2].Product_Name}
                  </p>
                  <p className="text-sm font-DB_Med text-gray-200">
                    ขายได้ {products[1].count} ชิ้น{" "}
                  </p>
                </div>
                <div className="text-[4rem] font-DB_Med text-brown-400">3</div>
                <div className="bg-white h-[5rem] w-16 mx-auto rounded-t-xl"></div>
              </motion.div>
            </>
          ) : (
            <p className="text-center text-red-500">No products available.</p>
          )}
        </div>

        {/* Other Food Items */}
        <div className="bg-white rounded-xl p-6 text-gray-800 shadow-lg z-10 relative">
          {products.slice(3).map((item, index) => (
            <div
              key={item.Product_ID}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div className="flex items-center">
                {/* แสดงเลขลำดับอันดับ */}
                <span className="font-DB_Med text-lg text-gray-500 mr-2">{index + 4}</span>{" "}
                {/* index + 4 เพราะเราเริ่มจากอันดับ 4 */}
                <div className="h-10 w-10 rounded-full shadow-md ml-2">
                  <img
                    src={item.Product_Image}
                    alt={item.Product_Name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
                {/* ชื่อสินค้า */}
                <p className="ml-4 font-DB_v4">{item.Product_Name}</p>
              </div>
              {/* แสดงยอดขายไว้ที่หลังสุด */}
              <p className="text-gray-500 font-DB_v4">ขายได้ {item.count} ชิ้น</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
