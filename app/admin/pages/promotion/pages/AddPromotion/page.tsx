"use client";
import React, { useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Swal from "sweetalert2";
import Link from "next/link";
import { Input, Textarea } from "@nextui-org/input";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { DatePickerWithRange } from "./components/DatePickerWithRange"; // นำเข้ามาแทนที่
import { format } from "date-fns"; // ใช้เพื่อ format วันที่
import { DateRange } from "react-day-picker"; // เพิ่มการนำเข้าตรงนี้

export default function Add_Promotion() {
  const [promotionName, setpromotionName] = useState("");
  const [promotionDiscount, setpromotionDiscount] = useState<number | "">("");
  const [promotionDetail, setpromotionDetail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [promotionID, setpromotionID] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const handleDateRangeChange = (selectedDateRange: DateRange | undefined) => {
    if (selectedDateRange) {
      // ถ้ามีการเลือกวันที่ ให้ทำการอัพเดต dateRange
      setDateRange({
        from: selectedDateRange.from ?? undefined, // ถ้าไม่มีค่าให้ใช้ undefined
        to: selectedDateRange.to ?? undefined,
      });
    } else {
      // ถ้า selectedDateRange เป็น undefined ให้รีเซ็ตค่า
      setDateRange({
        from: undefined,
        to: undefined,
      });
    }
  };

  const router = useRouter();

  const P_Status = 1;

  useEffect(() => {
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      return () => URL.revokeObjectURL(previewURL);
    }
  }, [file]);

  useEffect(() => {
    // Fetch the current highest Promotion_ID
    const fetchCurrentHighestpromotionID = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select("Promotion_ID")
        .order("Promotion_ID", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching highest Promotion_ID:", error);
      } else if (data && data.length > 0) {
        setpromotionID(data[0].Promotion_ID + 1);
      } else {
        setpromotionID(1);
      }
    };

    fetchCurrentHighestpromotionID();
  }, []);

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

  const handleSubmit = async () => {
    if (
      !promotionName ||
      promotionDiscount === "" || // ตรวจสอบกรณีที่ยังไม่มีค่า
      !file ||
      promotionID === null ||
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
      // // Extract the file extension
      const fileExtension = file.name.split(".").pop();
      const fileName = `${promotionID}.${fileExtension}`;

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("Promotions")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of uploaded image
      const { data } = await supabase.storage
        .from("Promotions")
        .getPublicUrl(fileName);

      if (!data) {
        throw new Error("Error getting public URL of the uploaded image");
      }

      const imageUrl = data.publicUrl;

      // Get current timestamp
      const now = new Date();
      const utcPlus7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));


      // Format the selected dates for start and end
      const startDate = format(dateRange.from!, "yyyy-MM-dd");
      const endDate = format(dateRange.to!, "yyyy-MM-dd");

      // Insert data into Supabase 'promotions' table
      const { error: insertError } = await supabase
        .from("promotions")
        .insert([
          {
            Promotion_ID: promotionID,
            Promotion_Name: promotionName,
            Promotion_Detail: promotionDetail,
            Promotion_Discount: promotionDiscount,
            Promotion_Timestart: startDate,
            Promotion_Timestop: endDate,
            Promotion_Status: P_Status,
            Promotion_Images: imageUrl,
            Promotion_Update: utcPlus7,
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log("*************************************");
      console.log(`ชื่อโปรโมชั่น : ${promotionName}`);
      console.log(`รายละเอียด : ${promotionDetail}`);
      console.log(`ส่วนลด : ${promotionDiscount}`);
      console.log(`สถานะ : ${P_Status}`);
      console.log(`เวลาเริ่มต้น : ${startDate}`);
      console.log(`เวลาสิ้นสุด : ${endDate}`);
      console.log(`Promotion_ImageURL: ${imageUrl}`);
      console.log(`เวลาที่แก้ไข: ${utcPlus7}`);
      console.log("*************************************");

      Swal.fire({
        icon: "success",
        title: "เพิ่มข้อมูลสำเร็จ",
        text: "เพิ่มข้อมูลสำเร็จ กรุณารอสักครู่..",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        router.push("../");
      });

      // Clear form fields after successful submission
      setpromotionName("");
      setpromotionDiscount("");
      setpromotionDetail("");
      setFile(null);
      setPreview(null);
      setpromotionID((prevID) => (prevID !== null ? prevID + 1 : null)); // Increment promotionID for the next submission
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "An error occurred while adding the promotion. Please try again later.",
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
              {preview && (
                <img src={preview} alt="Preview" className="object-cover" />
              )}
              {!preview && (
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
                  <p className="mt-5 font-DB_Med">
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
            <Link href="../">
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
            <label htmlFor="promotionName" className="label">
              ชื่อโปรโมชั่น
            </label>
            <Input
              fullWidth
              type="text"
              placeholder="ใส่ชื่อโปรโมชั่น"
              value={promotionName}
              onChange={(e) => setpromotionName(e.target.value)}
              id="promotionName"
              errorMessage="กรุณากรอกชื่อโปรโมชั่น"
            />
          </div>
          <div className="form-control py-4">
            <label htmlFor="promotionDiscount" className="label">
              ส่วนลด (฿)
            </label>
            <Input
              fullWidth
              type="number"
              placeholder="ใส่ส่วนลด"
              value={
                promotionDiscount !== "" ? promotionDiscount.toString() : ""
              } // แปลง number เป็น string
              onChange={(e) =>
                setpromotionDiscount(
                  e.target.value !== "" ? Number(e.target.value) : ""
                )
              } // แปลงกลับจาก string เป็น number
              id="promotionDiscount"
              errorMessage="กรุณากรอกส่วนลด"
            />
          </div>
          <div className="form-control py-4">
            <label htmlFor="promotionDetail" className="label">
              รายละเอียดโปรโมชั่น
            </label>
            <Textarea
              fullWidth
              placeholder="รายละเอียดโปรโมชั่น"
              value={promotionDetail}
              onChange={(e) => setpromotionDetail(e.target.value)}
              id="promotionDetail"
              errorMessage="กรุณากรอกรายละเอียดโปรโมชั่น"
            />
          </div>
          <div className="form-control py-4">
            <label className="label">ระยะเวลาของโปรโมชั่น</label>
            {/* DatePickerWithRange Component */}
            <DatePickerWithRange
              className="my-2"
              onDateChange={handleDateRangeChange}
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
            เพิ่มข้อมูลโปรโมชั่น
          </button>
        </div>
      </footer>
    </>
  );
}
