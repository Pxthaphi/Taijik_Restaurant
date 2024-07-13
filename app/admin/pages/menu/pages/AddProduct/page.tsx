"use client";
import React, { useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Swal from "sweetalert2";
import Link from "next/link";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import { Select, SelectItem, Avatar } from "@nextui-org/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Product_type from "./data";

export default function Add_Product() {
  const [menuName, setMenuName] = useState("");
  const [price, setPrice] = useState("");
  const [P_Detail, setP_Detail] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [productID, setProductID] = useState<number | null>(null);
  const productTypes = Product_type(); // Use the product types from the component
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
    // Fetch the current highest Product_ID
    const fetchCurrentHighestProductID = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("Product_ID")
        .order("Product_ID", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching highest Product_ID:", error);
      } else if (data && data.length > 0) {
        setProductID(data[0].Product_ID + 1);
      } else {
        setProductID(1);
      }
    };

    fetchCurrentHighestProductID();
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
    if (!menuName || !price || !file || productID === null) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Information",
        text: "Please fill all the fields.",
      });
      return;
    }

    try {
      // Extract the file extension
      const fileExtension = file.name.split(".").pop();
      const fileName = `${productID}.${fileExtension}`;

      // Upload image to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("Product")
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL of uploaded image
      const { data } = await supabase.storage
        .from("Product")
        .getPublicUrl(fileName);

      if (!data) {
        throw new Error("Error getting public URL of the uploaded image");
      }

      const imageUrl = data.publicUrl;

      // Get current timestamp
      const now = new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      });

      // Insert data into Supabase 'products' table
      const { error: insertError } = await supabase
        .from("products")
        .insert([
          {
            Product_ID: productID,
            Product_Name: menuName,
            Product_Detail: P_Detail,
            Product_Price: price,
            Product_Type: selectedType,
            Product_Status: P_Status,
            Product_Image: imageUrl,
            Product_Update: now,
          },
        ])
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log("*************************************");
      console.log(`ชื่อเมนูอาหาร : ${menuName}`);
      console.log(`รายละเอียด : ${P_Detail}`);
      console.log(`ราคา : ${price}`);
      console.log(`ประเภทเมนูอาหาร : ${selectedType}`);
      console.log(`สถานะ : ${P_Status}`);
      console.log(`Product_ImageURL: ${imageUrl}`);
      console.log(`เวลาที่แก้ไข: ${now}`);
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
      setMenuName("");
      setPrice("");
      setP_Detail("");
      setFile(null);
      setPreview(null);
      setSelectedType("");
      setProductID((prevID) => (prevID !== null ? prevID + 1 : null)); // Increment productID for the next submission
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "An error occurred while adding the menu item. Please try again later.",
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
                  <p className="mt-5">
                    กรุณาเลือกรูปเมนูอาหารที่ต้องการเพิ่ม{" "}
                    <span className="text-blue-600 cursor-pointer">
                      เลือกเลย
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="">
          <div className="absolute top-6 left-0 mx-6 h-full">
            <Link href="../">
              <div className="bg-white px-2 py-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-6 mt-6">
          <h1 className="text-2xl font-DB_Med">เพิ่มข้อมูลเมนูอาหาร</h1>
          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>
        </section>

        <section className="mx-6 mt-6 my-3">
          <Input
            type="text"
            label="ชื่อเมนูอาหาร"
            placeholder="กรุณากรอกชื่อเมนูอาหาร"
            labelPlacement="outside"
            className="py-5 font-DB_Med"
            value={menuName}
            onChange={(e) => setMenuName(e.target.value)}
          />
          <Input
            type="number"
            label="ราคาสินค้า"
            placeholder="0.00"
            labelPlacement="outside"
            className="my-5 font-DB_Med"
            startContent={
              <div className="pointer-events-none flex items-center">
                <span className="text-default-400 text-small">฿</span>
              </div>
            }
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />

          <Textarea
            labelPlacement="outside"
            label="รายละเอียดสินค้า"
            variant="flat"
            placeholder="เช่น หมู ไก่ ทะเล"
            value={P_Detail}
            onChange={(e) => setP_Detail(e.target.value)}
            className="my-5 font-DB_Med"
            classNames={{
              base: "max-w-full",
              input: "resize-y min-h-[40px]",
            }}
          />

          <Select
            items={productTypes}
            label="ประเภทเมนูอาหาร"
            placeholder="กรุณาเลือกประเภทเมนูอาหาร"
            labelPlacement="outside"
            onChange={(e) => setSelectedType(e.target.value)}
            value={selectedType}
            className="py-5 font-DB_Med"
            classNames={{
              base: "max-w-full",
              trigger: "h-12",
            }}
            renderValue={(items) => {
              return items.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <Avatar
                    alt={item.data!.Type_Name}
                    className="flex-shrink-0"
                    size="sm"
                    src={item.data!.Type_Icon}
                  />
                  <div className="flex flex-col">
                    <span>{item.data!.Type_Name}</span>
                  </div>
                </div>
              ));
            }}
          >
            {(Type_P) => (
              <SelectItem key={Type_P.Type_ID} textValue={Type_P.Type_Name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={Type_P.Type_Name}
                    className="flex-shrink-0"
                    size="sm"
                    src={Type_P.Type_Icon}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{Type_P.Type_Name}</span>
                  </div>
                </div>
              </SelectItem>
            )}
          </Select>

          {/* <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-6"></hr> */}
        </section>
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
            เพิ่มข้อมูลเมนูอาหาร
          </button>
        </div>
      </footer>
    </>
  );
}
