"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import dynamic from "next/dynamic";

// Dynamically import the FireAnimation component with SSR disabled
const FireAnimation = dynamic(() => import("./assets/fire"), {
  ssr: false,
});

// Define the User interface
interface User {
  User_ID: string;
  User_Name: string;
  User_Picture: string;
  Total_Orders: number;
}

const Userboard: React.FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchTopUsers() {
    try {
      // Fetch top users based on order count using an RPC call
      const { data: userData, error: userError } = await supabase.rpc(
        "get_user_order_summary"
      );

      if (userError) {
        throw userError;
      }

      console.table(userData);

      // Update the state with the fetched user data
      setUsers(userData as User[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTopUsers();

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Change received!", payload);
          fetchTopUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const navigateBack = () => {
    router.push("../../../");
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
          สรุปการจัดอันดับผู้ใช้
        </div>
      </header>

      {/* Tab Selector */}
      <div className="flex justify-center mt-8 mx-7">
        <Tabs
          size="lg"
          aria-label="Tabs sizes"
          fullWidth
          className="font-DB_Med"
          defaultSelectedKey={"Customer"}
        >
          <Tab key="Order" title="รายการคำสั่งซื้อ" href="./" />
          <Tab key="Food" title="สินค้าขายดี" href="./leaderpage" />
          <Tab key="Customer" title="ลูกค้าดีเด่น" href="" />
        </Tabs>
      </div>

      {/* Podium with Top Users */}
      <div className="relative mt-10">
        <div className="flex justify-center items-end space-x-10 z-0">
          {users.length > 0 ? (
            <>
              {/* Second Place (ถ้ามีข้อมูลผู้ใช้คนที่ 2) */}
              {users[1] && (
                <motion.div
                  key={users[1].User_ID}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-white mx-auto shadow-lg">
                      <img
                        src={users[1].User_Picture}
                        alt={users[1].User_Name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-base font-DB_Med">
                      {users[1].User_Name}
                    </p>
                    <p className="text-sm font-DB_Med text-gray-200">
                      สั่งซื้อ {users[1].Total_Orders} ครั้ง
                    </p>
                  </div>
                  <div className="text-[4rem] font-DB_Med text-gray-500">2</div>
                  <div className="bg-gray-500 h-[8rem] w-16 mx-auto rounded-t-xl"></div>
                </motion.div>
              )}

              {/* First Place (ถ้ามีข้อมูลผู้ใช้คนที่ 1) */}
              {users[0] && (
                <motion.div
                  key={users[0].User_ID}
                  className="text-center mx-4"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-white mx-auto shadow-lg">
                      <img
                        src={users[0].User_Picture}
                        alt={users[0].User_Name}
                        className="h-24 w-24 rounded-full object-cover"
                      />
                    </div>
                    <span className="absolute top-0 -right-5 bg-yellow-300 p-2 rounded-full">
                      <FireAnimation size={30} />
                    </span>
                    <p className="mt-2 text-lg font-DB_Med">
                      {users[0].User_Name}
                    </p>
                    <p className="text-sm font-DB_Med text-gray-200">
                      สั่งซื้อ {users[0].Total_Orders} ครั้ง
                    </p>
                  </div>
                  <div className="text-[4rem] font-DB_Med text-yellow-400">
                    1
                  </div>
                  <div className="bg-yellow-400 h-[12rem] w-16 mx-auto rounded-t-xl"></div>
                </motion.div>
              )}

              {/* Third Place (ถ้ามีข้อมูลผู้ใช้คนที่ 3) */}
              {users[2] && (
                <motion.div
                  key={users[2].User_ID}
                  className="text-center"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="relative">
                    <div className="h-16 w-16 rounded-full bg-white mx-auto shadow-lg">
                      <img
                        src={users[2].User_Picture}
                        alt={users[2].User_Name}
                        className="h-16 w-16 rounded-full object-cover"
                      />
                    </div>
                    <p className="mt-2 text-base font-DB_Med">
                      {users[2].User_Name}
                    </p>
                    <p className="text-sm font-DB_Med text-gray-200">
                      สั่งซื้อ {users[2].Total_Orders} ครั้ง
                    </p>
                  </div>
                  <div className="text-[4rem] font-DB_Med text-brown-400">
                    3
                  </div>
                  <div className="bg-white h-[5rem] w-16 mx-auto rounded-t-xl"></div>
                </motion.div>
              )}
            </>
          ) : (
            <p className="text-center text-red-500">ไม่พบข้อมูล</p>
          )}
        </div>

        {/* Other Users */}
        <div className="bg-white rounded-xl p-6 text-gray-800 shadow-lg z-10 relative">
          {users.slice(3).map((user, index) => (
            <div
              key={user.User_ID}
              className="flex items-center justify-between py-3 border-b last:border-b-0"
            >
              <div className="flex items-center">
                {/* แสดงเลขลำดับอันดับ */}
                <span className="font-DB_Med text-lg text-gray-500 mr-2">
                  {index + 4}
                </span>{" "}
                {/* index + 4 เพราะเราเริ่มจากอันดับ 4 */}
                <div className="h-10 w-10 rounded-full shadow-md ml-2">
                  <img
                    src={user.User_Picture}
                    alt={user.User_Name}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                </div>
                {/* ชื่อผู้ใช้ */}
                <p className="ml-4 font-DB_v4">{user.User_Name}</p>
              </div>
              {/* แสดงจำนวนการสั่งซื้อไว้ที่หลังสุด */}
              <p className="text-gray-500 font-DB_v4">
                สั่งซื้อ {user.Total_Orders} ครั้ง
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Userboard;
