"use client";
import { useState, useEffect } from "react";
import { useDropzone, FileRejection } from "react-dropzone";
import Swal from "sweetalert2";
import Link from "next/link";
import { Input } from "@nextui-org/input";
import { Textarea } from "@nextui-org/input";
import { Select, SelectItem, Avatar } from "@nextui-org/react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Switch, cn } from "@nextui-org/react";
import { SunIcon } from "./components/SunIcon";
import { MoonIcon } from "./components/MoonIcon";

interface PageProps {
  params: {
    slug: string;
  };
}

interface TypeItem {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

export default function Edit_Product({ params }: PageProps) {
  const [menuName, setMenuName] = useState<string>("");
  const [price, setPrice] = useState<string>("");
  const [P_Detail, setP_Detail] = useState("");
  const [P_Status, setP_Status] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [productTypes, setProductTypes] = useState<TypeItem[]>([]);
  const router = useRouter();
  const [isSelectedStatus, setIsSelectedStatus] = useState(true);
  const [isSelectedDisable, setIsSelectedDisable] = useState(false);
  const [readonlySwitch, setReadOnlySwitch] = useState(false);
  const [disableSwitch, setDisableSwitch] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error }: { data: any; error: any } = await supabase
          .from("products")
          .select("*")
          .eq("Product_ID", params.slug)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          setMenuName(data.Product_Name || "");
          setP_Detail(data.Product_Detail || "");
          setPrice(data.Product_Price || "");
          setSelectedType(data.Product_Type || "");
          setP_Status(data.Product_Status || "");
          setPreview(data.Product_Image);
          if (data.Product_Status == 1) {
            setIsSelectedStatus(true);
          } else if (data.Product_Status == 2) {
            setIsSelectedStatus(false);
          } else if (data.Product_Status == 3) {
            setIsSelectedStatus(false);
            setIsSelectedDisable(!isSelectedDisable);
            setDisableSwitch(!disableSwitch);
            setReadOnlySwitch(!readonlySwitch);
          }
        }

        setLoading(false); // Set loading to false after fetching data
      } catch (error: any) {
        console.error("Error fetching product:", error.message);
        setLoading(false); // Ensure loading state is set to false on error
      } finally {
        setLoading(false); // Set loading to false after fetching data
      }
    };

    fetchProduct();
  }, [params.slug]);

  useEffect(() => {
    if (file) {
      const previewURL = URL.createObjectURL(file);
      setPreview(previewURL);

      return () => URL.revokeObjectURL(previewURL);
    }
  }, [file]);

  useEffect(() => {
    const fetchTypeProducts = async () => {
      try {
        const { data, error } = await supabase.from("product_type").select("*");

        if (error) {
          throw new Error("Error fetching type products: " + error.message);
        }

        if (data) {
          setProductTypes(data);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchTypeProducts();
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

  // Function to delete product image from storage
  const deleteProductImage = async () => {
    try {
      // Get the file path from the database before deleting the record
      const { data: productData, error: fetchError } = await supabase
        .from("products")
        .select("Product_Image")
        .eq("Product_ID", params.slug)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      console.log({ Link: productData.Product_Image });

      // Check file type
      const fileType = productData.Product_Image.split(".").pop().toLowerCase();

      console.log({ Type: fileType });

      // Check if file type is PNG or JPG
      if (fileType !== "png" && fileType !== "jpg" && fileType !== "jpeg") {
        throw new Error("Invalid file type");
      }

      // Remove the file from storage
      const { error: storageError } = await supabase.storage
        .from("Product")
        .remove([`${params.slug}.${fileType}`]);

      if (storageError) {
        throw storageError;
      }

      console.log("Successfully deleted image");

      // Optionally, update state or UI after deletion
      setPreview(null); // Clear preview if needed
    } catch (error: any) {
      console.error("Error deleting product image:", error.message);
      Swal.fire({
        icon: "error",
        title: "Delete Failed",
        text: "An error occurred while deleting the product image. Please try again later.",
      });
    }
  };

  useEffect(() => {
    if(isSelectedDisable == true){
      setP_Status("3");
    }else if(isSelectedStatus == true){
      setP_Status("1");
    }else{
      setP_Status("2");
    }
  }, [isSelectedDisable, isSelectedStatus]);

  const handleSwitchStatus = () => {
    setIsSelectedStatus(!isSelectedStatus);
  };

  const handleSwitchToggle = () => {
    setIsSelectedDisable(!isSelectedDisable);
    setDisableSwitch(!disableSwitch);
    setReadOnlySwitch(!readonlySwitch);
  };

  console.log("*************************************");
  console.log(`ชื่อเมนูอาหาร : ${menuName}`);
  console.log(`รายละเอียด : ${P_Detail}`);
  console.log(`ราคา : ${price}`);
  console.log(`ประเภทเมนูอาหาร : ${selectedType}`);
  console.log(`สถานะ : ${P_Status}`);
  console.log("selectStatus : ", isSelectedStatus);
  console.log("selectDisable : ", isSelectedDisable);
  console.log("*************************************");

  const handleSubmit = async () => {
    if (!menuName || !price) {
      Swal.fire({
        icon: "error",
        title: "Incomplete Information",
        text: "Please fill all the fields.",
      });
      return;
    }

    try {
      let imageUrl = preview; // Assume preview holds the current image URL from database

      if (file) {
        // Delete old image from storage
        await deleteProductImage();

        // Upload new image to Supabase storage

        const fileExtension = file.name.split(".").pop();
        const fileName = `${params.slug}.${fileExtension}`;

        const { error } = await supabase.storage
          .from("Product")
          .upload(fileName, file);

        if (error) {
          throw error;
        }

        // Get public URL of uploaded image
        const { data } = await supabase.storage
          .from("Product")
          .getPublicUrl(fileName);

        if (!data) {
          throw new Error("Failed to get image URL from storage.");
        }

        imageUrl = data.publicUrl;
      }

      // Get current timestamp
      const now = new Date().toLocaleString("th-TH", {
        timeZone: "Asia/Bangkok",
      });

      // Update data in Supabase 'products' table
      const { error: updateError } = await supabase
        .from("products")
        .update({
          Product_Name: menuName,
          Product_Detail: P_Detail,
          Product_Price: price,
          Product_Type: selectedType,
          Product_Status: P_Status,
          Product_Image: imageUrl,
          Product_Update: now,
        })
        .eq("Product_ID", params.slug);

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
      setMenuName("");
      setPrice("");
      setFile(null);
      setPreview(null);
      setSelectedType("1");
    } catch (error: any) {
      console.error("Error updating product:", error.message);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "An error occurred while updating the product. Please try again later.",
      });
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          loading ? "bg-green-600" : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center">
          <img
            src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/loading.png"
            alt="Loading"
            className="animate-wiggle animate-infinite"
          ></img>
          <div className="mt-8">
            <div className="text-3xl text-white font-UID_Deep">
              กรุณารอสักครู่ . . . . .
            </div>
          </div>

          <div role="status" className="mt-8 animate-fade animate-delay-1000">
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#848484"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#EBEAE5"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

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
              {}
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
            <Link href="../../">
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
          <h1 className="text-2xl font-DB_Med">แก้ไขข้อมูลเมนูอาหาร</h1>
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
            className="font-DB_Med"
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

          <div className="flex justify-between items-center">
            <div className="flex justify-center items-center">
              <p className="me-1.5 pt-0.5">สถานเมนูอาหาร:</p>
              <p
                className={`text-xl font-DB_Med ${
                  P_Status === "1"
                    ? "text-green-600"
                    : P_Status === "2"
                    ? "text-red-600"
                    : "text-black"
                }`}
              >
                {P_Status === "1"
                  ? "มีเหลือ"
                  : P_Status === "2"
                  ? "หมด"
                  : "ปิดใช้งาน"}
              </p>
            </div>
            <Switch
              size="lg"
              isSelected={isSelectedStatus}
              color={isSelectedStatus ? "success" : "danger"}
              startContent={<SunIcon />}
              endContent={<MoonIcon />}
              isReadOnly={readonlySwitch}
              isDisabled={disableSwitch}
              onClick={handleSwitchStatus}
            />
          </div>

          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-6"></hr>

          <Switch
            color="danger"
            size="md"
            isSelected={isSelectedDisable}
            onClick={handleSwitchToggle}
            classNames={{
              base: cn(
                "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                "justify-between cursor-pointer rounded-lg gap-2 p-4 border-2 border-transparent",
                "data-[selected=true]:border-red-500"
              ),
              wrapper: "p-0 h-4 overflow-visible",
              thumb: cn(
                "w-6 h-6 border-2 shadow-lg",
                "group-data-[hover=true]:border-red-500",
                //selected
                "group-data-[selected=true]:ml-6",
                // pressed
                "group-data-[pressed=true]:w-7",
                "group-data-[selected]:group-data-[pressed]:ml-4"
              ),
            }}
          >
            <div className="flex flex-col gap-1">
              <p className="text-medium">ปิดใช้งานเมนูอาหาร</p>
              <p className="text-tiny text-default-400">
                หากปิดใช้งานเมนูอาหารดังกล่าว
                ระบบจะทำการซ่อนเมนูจากหน้าจอระบบของลูกค้า
              </p>
            </div>
          </Switch>

          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-6"></hr>
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
              viewBox="0 0 24 24"
              className="w-6 h-6 mr-2"
            >
              <g
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              >
                <path d="M11 21H8.574a3 3 0 0 1-2.965-2.544l-1.255-8.152A2 2 0 0 1 6.331 8H17.67a2 2 0 0 1 1.977 2.304l-.109.707"></path>
                <path d="M9 11V6a3 3 0 0 1 6 0v5m3.42 4.61a2.1 2.1 0 0 1 2.97 2.97L18 22h-3v-3z"></path>
              </g>
            </svg>
            บันทึกข้อมูลเมนูอาหาร
          </button>
        </div>
      </footer>
    </>
  );
}
