"use client";
import Chart_Price from "./components/chart_price";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import OrderComponent from "./components/order";
import Link from "next/link";
import {Tabs, Tab} from "@nextui-org/react";


export default function History() {
  const router = useRouter();

  // State variables to store fetched data
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [ongoingOrders, setOngoingOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);

  // Fetch data from Supabase
  useEffect(() => {
    async function fetchSummaryData() {
      // 1. Fetch total customers where User_Type = 'customer'
      let { count: totalCustomerCount } = await supabase
        .from("users")
        .select("*", { count: "exact" })
        .eq("User_Type", "customer");

      // 2. Fetch total orders from the 'orders' table
      let { count: totalOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" });

      // 3. Fetch ongoing orders where Order_Status is between 1 and 3
      let { count: ongoingOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .in("Order_Status", [1, 2, 3]);

      console.table(ongoingOrderCount);

      // 4. Fetch completed orders where Order_Status = 4
      let { count: completedOrderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact" })
        .eq("Order_Status", 4);

      // Update state variables
      setTotalCustomers(totalCustomerCount || 0);
      setTotalOrders(totalOrderCount || 0);
      setOngoingOrders(ongoingOrderCount || 0);
      setCompletedOrders(completedOrderCount || 0);
    }

    fetchSummaryData();
  }, []); // Empty dependency array ensures this runs once on component mount

  const navigateBack = () => {
    router.push("../");
  };
  return (
    <div className="">
      <header className="max-w-md w-full shadow-md rounded-b-[2rem] overflow-hidden background-svg pb-8">
        <div className="mx-8 mt-8 flex justify-center items-center">
          <div
            onClick={navigateBack}
            className="absolute py-1 px-1 top-8 left-8 cursor-pointer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
          </div>
          <div className="text-white font-DB_Med text-2xl pt-0.5">
            สรุปผลรายการคำสั่งซื้อ
          </div>
        </div>

        <div className="flex justify-center mt-8 mx-7">
          <Tabs size="lg" aria-label="Tabs sizes" fullWidth className="font-DB_Med" defaultSelectedKey={"Order"}>
            <Tab key="Order" title="รายการคำสั่งซื้อ" href=""/>
            <Tab key="Food" title="สินค้าขายดี" href="historyOrder/leaderpage"/>
            <Tab key="Customer" title="ลูกค้าดีเด่น" href="historyOrder/Userpage" />
          </Tabs>
        </div>

        <section className="grid grid-cols-2 gap-3 mt-8 px-4 mx-3">
          <Link href="historyOrder/Userlist">
            <div className="flex items-center justify-between p-2 bg-white rounded-xl shadow-md h-[5rem]">
              <div className="ml-2 me-4">
                <div className="text-xs text-gray-500">จำนวนลูกค้าทั้งหมด</div>
                <div className="text-lg font-semibold">{totalCustomers}</div>
              </div>
              <div className="p-2 bg-indigo-100 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 32 32"
                  className="w-6 h-6 text-indigo-500"
                >
                  <path
                    fill="currentColor"
                    d="M6 30h20v-5a7.01 7.01 0 0 0-7-7h-6a7.01 7.01 0 0 0-7 7zM9 9a7 7 0 1 0 7-7a7 7 0 0 0-7 7"
                  />
                </svg>
              </div>
            </div>
          </Link>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl shadow-md h-[5rem]">
            <div className="ml-2 me-4">
              <div className="text-xs text-gray-500">คำสั่งซื้อทั้งหมด</div>
              <div className="text-lg font-semibold">{totalOrders}</div>
            </div>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-yellow-500"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M7.245 2h9.51c1.159 0 1.738 0 2.206.163a3.05 3.05 0 0 1 1.881 1.936C21 4.581 21 5.177 21 6.37v14.004c0 .858-.985 1.314-1.608.744a.946.946 0 0 0-1.284 0l-.483.442a1.657 1.657 0 0 1-2.25 0a1.657 1.657 0 0 0-2.25 0a1.657 1.657 0 0 1-2.25 0a1.657 1.657 0 0 0-2.25 0a1.657 1.657 0 0 1-2.25 0l-.483-.442a.946.946 0 0 0-1.284 0c-.623.57-1.608.114-1.608-.744V6.37c0-1.193 0-1.79.158-2.27c.3-.913.995-1.629 1.881-1.937C5.507 2 6.086 2 7.245 2M7 6.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5zm3.5 0a.75.75 0 0 0 0 1.5H17a.75.75 0 0 0 0-1.5zM7 10.25a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5zm3.5 0a.75.75 0 0 0 0 1.5H17a.75.75 0 0 0 0-1.5zM7 13.75a.75.75 0 0 0 0 1.5h.5a.75.75 0 0 0 0-1.5zm3.5 0a.75.75 0 0 0 0 1.5H17a.75.75 0 0 0 0-1.5z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl shadow-md h-[5rem]">
            <div className="ml-2 me-4">
              <div className="text-xs text-gray-500">รอดำเนินการ</div>
              <div className="text-lg font-semibold">{ongoingOrders}</div>
            </div>
            <div className="p-2 bg-sky-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-6 h-6 text-sky-500"
              >
                <g fill="none">
                  <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                  <path
                    fill="currentColor"
                    d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 4a1 1 0 0 0-1 1v5a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V7a1 1 0 0 0-1-1"
                  />
                </g>
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded-xl shadow-md h-[5rem]">
            <div className="ml-2">
              <div className="text-xs text-gray-500">
                คำสั่งซื้อที่เสร็จสิ้น
              </div>
              <div className="text-lg font-semibold">{completedOrders}</div>
            </div>
            <div className="p-2 bg-green-100 rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 14 14"
                className="w-6 h-6 text-green-500"
              >
                <path
                  fill="currentColor"
                  fill-rule="evenodd"
                  d="M2.5 0A2.5 2.5 0 0 0 0 2.5v11a.5.5 0 0 0 .757.429L3 12.583l2.243 1.346a.5.5 0 0 0 .514 0L8 12.583l2.243 1.346A.5.5 0 0 0 11 13.5V6h.005V2.5a.625.625 0 1 1 1.25 0V6H13.5a.5.5 0 0 0 .5-.5V2a2 2 0 0 0-2-2zm6.314 4.994a.75.75 0 1 0-1.128-.988L4.644 7.483L3.2 6.4a.75.75 0 1 0-.9 1.2l2 1.5a.75.75 0 0 0 1.014-.106z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
          </div>
        </section>
      </header>

      <section className="grid grid-rows-2 mt-8">
        <div className="px-4">
          <Chart_Price />
        </div>

        <div className="px-4">
          <h2 className="text-2xl font-DB_Med mb-5 mt-5">รายการคำสั่งซื้อ</h2>

          {/* Display orders with status 'completed' */}
          <h2 className="text-lg font-DB_Med mt-4">สถานะเสร็จสิ้น</h2>
          <OrderComponent status="completed" />

          {/* Display orders with status 'pending' */}
          <h2 className="text-lg font-DB_Med mt-4">สถานะรอดำเนินการ</h2>
          <OrderComponent status="pending" />

          {/* Display orders with status 'in_progress' */}
          <h2 className="text-lg font-DB_Med mt-4">สถานะกำลังดำเนินการ</h2>
          <OrderComponent status="in_progress" />

          {/* Display orders with status 'cancelled' */}
          <h2 className="text-lg font-DB_Med mt-4">สถานะยกเลิกคำสั่งซื้อ</h2>
          <OrderComponent status="cancelled" />
        </div>
        {/* 
        <div className="px-8 mt-5">
          <Chart_Row />
        </div> */}
      </section>
    </div>
  );
}
