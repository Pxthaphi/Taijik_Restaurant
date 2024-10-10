"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { getUserID } from "@/app/auth/getUserID";

// Define the OrderProduct interface
interface OrderProduct {
  OrderP_ID: number;
  Order_ID: string;
  Product_ID: number;
  Product_Qty: number;
  Product_Size: string;
  Product_Meat: number;
  Product_Option: number;
  Product_Detail: string;
  Total_Price: number;
  Product_Name: string;
  Product_Price: number;
  Product_Image: string;
  Order_Datetime: string;
}

export default function History_Order() {
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchHistoryOrderProducts() {
    try {
      // Fetch necessary columns by joining orders, order_products, and products
      const { data, error } = await supabase
        .from("order_products")
        .select(`
          OrderP_ID,
          Order_ID,
          Product_ID,
          Product_Qty,
          Product_Size,
          Product_Meat,
          Product_Option,
          Product_Detail,
          Total_Price,
          orders (
            User_ID,
            Order_Status,
            Order_Datetime
          ),
          products (
            Product_Name,
            Product_Price,
            Product_Image
          )
        `)
        .eq("orders.User_ID",getUserID());

      if (error) {
        throw error;
      } else {
        // Flatten the nested properties and ensure products exist
        const flattenedData = data
          .filter((item: any) => item.orders && item.orders.Order_Status === 4)
          .map((item: any) => {
            const product = item.products || {};
            return {
              OrderP_ID: item.OrderP_ID,
              Order_ID: item.Order_ID,
              Product_ID: item.Product_ID,
              Product_Qty: item.Product_Qty,
              Product_Size: item.Product_Size,
              Product_Meat: item.Product_Meat,
              Product_Option: item.Product_Option,
              Product_Detail: item.Product_Detail,
              Total_Price: item.Total_Price,
              Product_Name: product.Product_Name,
              Product_Price: product.Product_Price,
              Product_Image: product.Product_Image,
              Order_Datetime: item.orders.Order_Datetime  // Add order date here
            };
          });

        // Group by Product_ID and keep only the latest order for each product
        const uniqueProducts = flattenedData.reduce(
          (acc: { [key: number]: OrderProduct }, curr: OrderProduct) => {
            if (!acc[curr.Product_ID] || new Date(acc[curr.Product_ID].Order_Datetime) < new Date(curr.Order_Datetime)) {
              acc[curr.Product_ID] = curr;
            }
            return acc;
          },
          {}
        );

        // Convert object to array and sort by Order_Date (newest first)
        const sortedProducts = Object.values(uniqueProducts).sort(
          (a, b) => new Date(b.Order_Datetime).getTime() - new Date(a.Order_Datetime).getTime()
        );

        console.table(sortedProducts);

        setOrderProducts(sortedProducts);
      }
    } catch (error) {
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchHistoryOrderProducts();
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div className="text-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (orderProducts.length === 0) {
    return <p className="font-DB_v4">ไม่พบการสั่งอาหาร ลองสั่งเลย!!</p>;
  }

  return (
    <div className="flex flex-row gap-4 overflow-x-auto">
      {orderProducts.map((orderProduct) => (
        <ProductCard key={orderProduct.OrderP_ID} orderProduct={orderProduct} />
      ))}
    </div>
  );
}

// LoadingSpinner component
function LoadingSpinner() {
  return (
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
  );
}

// ProductCard component
function ProductCard({ orderProduct }: { orderProduct: OrderProduct }) {
  return (
    <div className="flex-shrink-0 w-52">
      <div className="relative rounded-xl overflow-hidden w-full md:w-1/2 lg:w-1/2 xl:w-1/2">
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
          src={`${orderProduct.Product_Image}?t=${new Date().getTime()}`}
          alt={orderProduct.Product_Name}
        />
        <div className="px-3 py-2">
          <div className="font-DB_Med text-lg">{orderProduct.Product_Name}</div>
          <div className="font-DB_Med text-xs mb-1 text-gray-500">
            {orderProduct.Product_Detail}
          </div>
          <div className="flex justify-between pt-2">
            <p className="text-gray-500 text-sm font-DB_Med my-0.5">15 นาที</p>
            <p className="text-base font-DB_Med text-green-600">
              ฿{orderProduct.Product_Price}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
