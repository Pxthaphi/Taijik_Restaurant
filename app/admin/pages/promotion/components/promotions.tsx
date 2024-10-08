"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Option_Promotion from "./opiton";

// Define the PromotionDetail interface based on the 'promotions' table structure
interface PromotionDetail {
  Promotion_ID: number;
  Promotion_Name: string;
  Promotion_Detail: string;
  Promotion_Discount: number;
  Promotion_Timestart: string;
  Promotion_Timestop: string;
  Promotion_Status: number;
  Promotion_Images: string;
  Promotion_Update: string;
}

export default function Promotion() {
  const [promotions, setPromotions] = useState<PromotionDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch promotions from Supabase
  async function fetchPromotions() {
    try {
      // Fetch necessary columns including Promotion_Images
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .order("Promotion_ID");

      if (error) {
        throw error;
      } else {
        setPromotions(data as PromotionDetail[]);
        console.table(data);
      }
    } catch (error) {
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPromotions();

    const channel = supabase
      .channel("realtime-promotions")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "promotions" },
        (payload) => {
          console.log("Change received!", payload);
          fetchPromotions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]); // Run once on component mount

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

  if (promotions.length === 0) {
    return <p>ไม่พบโปรโมชั่น กรุณาเพิ่มโปรโมชั่น</p>;
  }

  return (
    <div className="grid justify-center grid-cols-2 gap-4">
      {promotions.map((promotion) => (
        <PromotionCard key={promotion.Promotion_ID} promotion={promotion} />
      ))}
    </div>
  );
  
  function PromotionCard({ promotion }: { promotion: PromotionDetail }) {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("th-TH", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Bangkok",
      }).format(date);
    };
  
    return (
      <div className="bg-white border rounded-xl shadow-sm sm:flex">
        <div className="w-full h-full bg-white border rounded-xl shadow-sm flex flex-col">
          <div className="relative w-full h-0 pb-[40%] overflow-hidden rounded-t-xl">
            <img
              className="absolute top-0 left-0 w-full h-full object-cover"
              src={`${promotion.Promotion_Images}?t=${new Date().getTime()}`}
              alt={promotion.Promotion_Name}
            />
          </div>
          <div className="flex flex-col flex-grow p-4 sm:p-7">
            <h3 className="text-xl font-DB_Med text-gray-800">
              {promotion.Promotion_Name}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <p className="text-base font-DB_v4">รหัสโปรโมชั่น</p>
              <p className="text-base font-DB_v4">{promotion.Promotion_ID}</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-base font-DB_v4">ส่วนลด</p>
              <p className="text-base font-DB_v4">{promotion.Promotion_Discount}%</p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-base font-DB_v4">สถานะ</p>
              <p className="text-base font-DB_v4">
                {promotion.Promotion_Status === 1 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    ใช้งานอยู่
                  </span>
                )}
                {promotion.Promotion_Status === 2 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    ปิดใช้งาน
                  </span>
                )}
              </p>
            </div>
            <div className="mt-5 flex justify-end space-x-4">
              <Option_Promotion promotionId={promotion.Promotion_ID} />
            </div>
            <div className="mt-5 sm:mt-auto">
              <p className="text-xs text-gray-500">
                แก้ไขล่าสุดเมื่อ {formatDate(promotion.Promotion_Update)}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}  