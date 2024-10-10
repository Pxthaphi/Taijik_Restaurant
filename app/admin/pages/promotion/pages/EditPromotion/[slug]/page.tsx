"use client";
import React, { useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Swal from "sweetalert2";
import Link from "next/link";
import { Input, Textarea } from "@nextui-org/input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DatePickerWithRange } from "./components/DatePickerWithRange";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";

interface PageProps {
  params: {
    slug: string;
  };
}

export default function Edit_Promotion({ params }: PageProps) {
  const [promotionName, setPromotionName] = useState("");
  const [promotionDiscount, setPromotionDiscount] = useState<number | "">("");
  const [promotionDetail, setPromotionDetail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const router = useRouter();

  useEffect(() => {
    // Fetch existing promotion data by promotionId
    const fetchPromotionData = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("*")
        .eq("Promotion_ID", params.slug)
        .single();

      if (error) {
        console.error("Error fetching promotion data:", error);
      } else if (data) {
        setPromotionName(data.Promotion_Name);
        setPromotionDiscount(data.Promotion_Discount);
        setPromotionDetail(data.Promotion_Detail);
        setDateRange({
          from: new Date(data.Promotion_Timestart), // Set the start date
          to: new Date(data.Promotion_Timestop), // Set the end date
        });
        setPreview(data.Promotion_Images); // Set preview to existing image URL
      }
    };

    fetchPromotionData();
  }, [params.slug]);

  useEffect(() => {
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      return () => URL.revokeObjectURL(previewURL);
    }
  }, [file]);

  const onDrop = (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);
    } else if (rejectedFiles.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid file",
        text: "Please upload a PNG or JPG file under 25MB.",
      });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/png": [], "image/jpeg": [] },
    maxSize: 25 * 1024 * 1024, // 25MB
  });

  const handleDateRangeChange = (selectedDateRange: DateRange | undefined) => {
    if (selectedDateRange) {
      setDateRange({
        from: selectedDateRange.from ?? undefined,
        to: selectedDateRange.to ?? undefined,
      });
    } else {
      setDateRange({
        from: undefined,
        to: undefined,
      });
    }
  };

  const handleSubmit = async () => {
    if (
      !promotionName ||
      promotionDiscount === "" ||
      (file === null && !preview) || // Check if there's a file or an existing preview
      !dateRange.from ||
      !dateRange.to
    ) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณาตรวจสอบและกรอกข้อมูลให้ครบทุกช่อง!!",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FFA200FF",
      });
      return;
    }

    if (promotionDiscount > 100 || promotionDiscount <= 0) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน",
        text: "กรุณากรอกส่วนลดให้มากกว่า 0% และ ไม่เกิน 100%!!",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FFA200FF",
      });
      return;
    }

    try {
      let imageUrl = preview; // Start with the existing image URL

      if (file) {
        // If there's a new file, upload it
        const fileExtension = file.name.split(".").pop();
        const fileName = `${params.slug}.${fileExtension}`;

        const { error: uploadError } = await supabase.storage
          .from("Promotions")
          .update(fileName, file, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data } = await supabase.storage
          .from("Promotions")
          .getPublicUrl(fileName);

        if (!data) {
          throw new Error("Error getting public URL of the uploaded image");
        }

        imageUrl = data.publicUrl; // Update imageUrl with the new image URL
      }

      // Get current timestamp
      const now = new Date();
      const utcPlus7 = new Date(now.getTime() + 7 * 60 * 60 * 1000);

      const startDate = format(dateRange.from!, "yyyy-MM-dd");
      const endDate = format(dateRange.to!, "yyyy-MM-dd");

      const { error: updateError } = await supabase
        .from("promotions")
        .update({
          Promotion_Name: promotionName,
          Promotion_Detail: promotionDetail,
          Promotion_Discount: promotionDiscount,
          Promotion_Timestart: startDate,
          Promotion_Timestop: endDate,
          // Promotion_Status: status,
          Promotion_Images: imageUrl,
          Promotion_Update: utcPlus7,
        })
        .eq("Promotion_ID", params.slug);

      if (updateError) {
        throw updateError;
      }

      // Success message and redirect
      Swal.fire({
        icon: "success",
        title: "อัปเดตข้อมูลสำเร็จ",
        text: "อัปเดตข้อมูลสำเร็จ กรุณารอสักครู่..",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push("../../");
      });

      // Clear form fields after successful submission
      setPromotionName("");
      setPromotionDiscount("");
      setPromotionDetail("");
      setFile(null);
      setPreview(null);
      setDateRange({
        from: undefined,
        to: undefined,
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "An error occurred while updating the promotion. Please try again later.",
      });
    }
  };

  return (
    <>
      <header className="relative flex items-center justify-center max-w-screen overflow-hidden">
        <div className="max-w-md w-full py-36 shadow-md rounded-b-3xl overflow-hidden relative z-0">
          <div className="absolute inset-0 w-full h-full object-cover opacity-100">
            <div
              {...getRootProps()}
              className="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-300 rounded-lg bg-white"
            >
              <input {...getInputProps()} />
              {preview ? (
                <img src={preview} alt="Preview" className="object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 48 48"
                    className="w-10 h-10"
                  >
                    <g fill="none">
                      <path
                        fill="currentColor"
                        d="M44 24a2 2 0 1 0-4 0zM24 8a2 2 0 1 0 0-4zm15 32H9v4h30zM8 39V9H4v30zm32-15v15h4V24zM9 8h15V4H9zm0 32a1 1 0 0 1-1-1H4a5 5 0 0 0 5 5zm30 4a5 5 0 0 0 5-5h-4a1 1 0 0 1-1 1zM8 9a1 1 0 0 1 1-1V4a5 5 0 0 0-5 5z"
                      ></path>
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={4}
                        d="m6 35l10.693-9.802a2 2 0 0 1 2.653-.044L32 36m-4-5l4.773-4.773a2 2 0 0 1 2.615-.186L42 31M30 12h12m-6-6v12"
                      ></path>
                    </g>
                  </svg>
                  <p className="mt-5">
                    กรุณาเลือกรูปBanner โปรโมชั่นที่ต้องการเพิ่ม{" "}
                    <span className="text-blue-600 cursor-pointer">
                      เลือกเลย
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="absolute top-8 left-4">
            <Link href="../../">
              <div className="btn btn-circle">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="bi bi-chevron-left"
                >
                  <path
                    fillRule="evenodd"
                    d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="w-full">
        <div className="container max-w-md mx-auto px-4">
          <div className="form-control py-4">
            <label htmlFor="promotionName" className="label font-DB_Med">
              ชื่อโปรโมชั่น
            </label>
            <Input
              fullWidth
              type="text"
              placeholder="ใส่ชื่อโปรโมชั่น"
              value={promotionName}
              onChange={(e) => setPromotionName(e.target.value)}
              id="promotionName"
              errorMessage="กรุณากรอกชื่อโปรโมชั่น"
              className="font-DB_Med text-gray-500"
            />
          </div>
          <div className="form-control py-4">
            <label htmlFor="promotionDiscount" className="label font-DB_Med">
              ส่วนลด (฿)
            </label>
            <Input
              fullWidth
              type="number"
              placeholder="ใส่ส่วนลด"
              value={
                promotionDiscount !== "" ? promotionDiscount.toString() : ""
              }
              onChange={(e) =>
                setPromotionDiscount(
                  e.target.value !== "" ? Number(e.target.value) : ""
                )
              }
              id="promotionDiscount"
              errorMessage="กรุณากรอกส่วนลด"
              className="font-DB_Med text-gray-500"
            />
          </div>
          <div className="form-control py-4">
            <label htmlFor="promotionDetail" className="label font-DB_Med">
              รายละเอียดโปรโมชั่น
            </label>
            <Textarea
              fullWidth
              placeholder="รายละเอียดโปรโมชั่น"
              value={promotionDetail}
              onChange={(e) => setPromotionDetail(e.target.value)}
              id="promotionDetail"
              errorMessage="กรุณากรอกรายละเอียดโปรโมชั่น"
              className="font-DB_Med text-gray-500"
            />
          </div>
          <div className="form-control py-4">
            <label className="label font-DB_Med">ระยะเวลาของโปรโมชั่น</label>
            {/* DatePickerWithRange Component */}
            <DatePickerWithRange
              className="my-2"
              onDateChange={handleDateRangeChange}
              dateRange={{
                from: dateRange.from, // วันที่เริ่มต้น
                to: dateRange.to, // วันที่สิ้นสุด
              }}
            />
          </div>
        </div>
      </main>

      <footer className="mt-12 pt-16">
        <div className="flex justify-center fixed inset-x-0 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2">
          <button
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-12 text-lg font-DB_Med"
            onClick={handleSubmit}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 16 16"
              className="w-7 h-7 mr-2"
            >
              <path
                fill="currentColor"
                d="M5 3v2h-.5A1.5 1.5 0 0 0 3 6.5V13a2 2 0 0 0 2 2h2.257a5.5 5.5 0 0 1 5.713-8.801A1.5 1.5 0 0 0 11.5 5H11V3a2 2 0 0 0-3-1.732A2 2 0 0 0 5 3m5 2H9V3c0-.351-.09-.682-.25-.969A1.002 1.002 0 0 1 10 3zM8 5H6V3a1 1 0 0 1 2 0zm8 6.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-4-2a.5.5 0 0 0-1 0V11H9.5a.5.5 0 0 0 0 1H11v1.5a.5.5 0 0 0 1 0V12h1.5a.5.5 0 0 0 0-1H12z"
              ></path>
            </svg>
            บันทึกข้อมูลโปรโมชั่น
          </button>
        </div>
      </footer>
    </>
  );
}
