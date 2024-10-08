"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner"; // Import toast
import { QRCodeCanvas } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { Toaster } from "@/components/ui/sonner"; // Import Toaster

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Ticket({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userID, setuserID] = useState("");
  const [userName, setuserName] = useState("");
  const [OrderDatetime, setOrderDatetime] = useState("");
  const [ReceiveTime, setReceiveTime] = useState("");
  const [OrderOption, setOrderOption] = useState("");

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setLoading(true);

      // Fetch order details including status
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("User_ID, Order_Datetime, Receive_Time, Order_Option")
        .eq("Order_ID", params.slug)
        .single();

      if (orderError) {
        console.error(orderError);
        if (orderError.code === "PGRST116") {
          alert("ไม่พบคำสั่งซื้อที่ระบุ");
        }
        setLoading(false);
        return;
      }

      setuserID(orderData.User_ID);
      setOrderDatetime(orderData.Order_Datetime);
      setReceiveTime(orderData.Receive_Time);
      setOrderOption(orderData.Order_Option);

      // Fetch user details
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("User_Name")
        .eq("User_ID", orderData.User_ID)
        .single();

      if (userError) {
        console.error(userError);
        setLoading(false);
        return;
      }

      setuserName(userData?.User_Name);
      setLoading(false);
    };

    fetchOrderDetails();

    // Subscribe to real-time changes in the orders table
    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          console.log("Change received!", payload);
          // Check if the order ID matches the current order
          if (payload.new.Order_ID === params.slug) {
            // Show toast notification
            toast.success("เปลี่ยนสถานะคำสั่งซื้อเสร็จสิ้น");
            // Delay navigation to the order product page
            setTimeout(() => {
              router.push(`../../order_product/${params.slug}`);
            }, 2000); // Navigate after 2 seconds
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.slug, supabase, router]);

  const formatThaiDateTime = (datetimeStr: string) => {
    const [datePart, timePart] = datetimeStr.split(" ");
    const [day, month, year] = datePart.split("/");
    const [hours, minutes, seconds] = timePart.split(":");

    const date = new Date(
      parseInt(year) - 543,
      parseInt(month) - 1,
      parseInt(day),
      parseInt(hours),
      parseInt(minutes),
      parseInt(seconds)
    );

    const formattedDate = date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = date.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return { formattedDate, formattedTime };
  };

  const goBack = () => router.push(`../../order_product/${params.slug}`);

  const qrcode = `https://liff.line.me/2004539512-7wZyNkj0/admin/pages/listorder/${params.slug}`;

  return (
    <>
      <main className="bg-gradient-to-br from-green-600 to-green-200 flex justify-center items-center min-h-screen">
        <header className="absolute top-0 left-0 w-full px-4 mt-4">
          <div
            className="absolute top-4 left-6 py-2 px-2 bg-white rounded-xl shadow-md"
            onClick={goBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 text-green-600 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </div>
        </header>

        <section className="flex justify-center items-center w-full max-w-md px-4 mt-4">
          <div className="w-full mt-10">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden relative">
              <div className="relative bg-sky-500">
                <img
                  src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/bg_order.png"
                  alt="Event"
                  className="w-full h-44 object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <img
                    src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_order.png"
                    alt="Promotion background"
                    className="h-[11rem] transform -translate-y-1/2 animate-wiggle animate-infinite animate-duration-[1500ms]"
                  />
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="text-center mb-4">
                  <p className="text-xl font-DB_Med">
                    คำสั่งซื้อร้านอาหารใต้จิก
                  </p>
                  <p className="text-sm font-DB_v4 text-gray-600 mt-2">
                    ขอบคุณที่ไว้ใจร้านเรา
                  </p>
                </div>

                <div className="bg-gray-100 p-5 rounded-xl text-center">
                  <p className="text-sm font-DB_Med text-gray-500">
                    เลขคำสั่งซื้อ
                  </p>
                  <p className="text-xl font-DB_Med">{params.slug}</p>

                  <div className="flex justify-between items-center mt-4 text-gray-600">
                    <div className="text-left">
                      <p className="text-sm font-DB_Med text-gray-500 mt-2">
                        ชื่อผู้สั่ง
                      </p>
                      <p className="text-lg font-DB_Med">
                        {userName || "กำลังโหลด..."}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-DB_Med text-gray-500 mt-2">
                        ตัวเลือกการสั่งซื้อ
                      </p>
                      <p className="text-lg font-DB_Med">
                        {OrderOption || "กำลังโหลด..."}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4 text-gray-600 mt-2">
                    <div className="text-left mt-1">
                      <p className="text-sm font-DB_Med text-gray-500">
                        วันที่ดำเนินการ
                      </p>
                      <p className="text-md font-semibold">
                        {OrderDatetime
                          ? formatThaiDateTime(OrderDatetime).formattedDate
                          : "กำลังโหลด..."}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="mt-1">
                        <p className="text-sm font-DB_Med text-gray-500">
                          เวลาที่รับสินค้า
                        </p>
                        <p className="text-md font-semibold">
                          {ReceiveTime ? ReceiveTime + " น." : "กำลังโหลด..."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center my-6">
                  <QRCodeCanvas value={qrcode} size={150} />
                </div>

                <p className="text-center text-sm text-gray-500">
                  โปรดแสดงตอนไปถึงหน้าร้านเพื่อรับอาหารของท่าน
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Toaster richColors /> {/* Add Toaster here */}
    </>
  );
}
