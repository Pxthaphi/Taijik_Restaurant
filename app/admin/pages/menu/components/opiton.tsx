import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Button,
  cn,
} from "@nextui-org/react";
import Swal from "sweetalert2";
import { EditDocumentIcon } from "./assets/EditIcon.jsx";
import { DeleteDocumentIcon } from "./assets/DeleteIcon.jsx";
import { supabase } from "@/lib/supabase";

export default function Option_Food({ productId }: { productId: number }) {
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const handleDelete = async () => {
    Swal.fire({
      title: "แน่ใจใช่มั้ย ?",
      text: "หากลบ จะไม่สามารถกู้ข้อมูลกลับมาได้อีก!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CBB17",
      cancelButtonColor: "#d33",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          // Get the file path from the database before deleting the record
          const { data: productData, error: fetchError } = await supabase
            .from("products")
            .select("Product_Image")
            .eq("Product_ID", productId)
            .single();

          if (fetchError) {
            throw fetchError;
          }

          console.log({ Link: productData.Product_Image });

          // Check file type
          const fileType = productData.Product_Image.split(".")
            .pop()
            .toLowerCase();

          // Check if file type is PNG or JPG
          if (fileType !== "png" && fileType !== "jpg" && fileType !== "jpeg") {
            throw new Error("Invalid file type");
          }

          // Remove the file from storage
          const { error: storageError } = await supabase.storage
            .from("Product")
            .remove([`${productId}.${fileType}`]);

          if (storageError) {
            throw storageError;
          }

          // Delete the record from the database
          const { error: deleteError } = await supabase
            .from("products")
            .delete()
            .eq("Product_ID", productId);

          if (deleteError) {
            throw deleteError;
          }

          Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: "ลบข้อมูลเมนูอาหารสำเร็จ กรุณารอสักครู่",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            window.location.reload();
          });
        } catch (error) {
          Swal.fire("ผิดพลาด", "โปรดลองอีกครั้ง", "error");
          window.location.reload();
        }
      },
    });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="bordered">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="1em"
            height="1em"
            viewBox="0 0 512 512"
          >
            <path
              fill="currentColor"
              d="M256 144a64 64 0 1 0-64-64a64.072 64.072 0 0 0 64 64m0-96a32 32 0 1 1-32 32a32.036 32.036 0 0 1 32-32m0 320a64 64 0 1 0 64 64a64.072 64.072 0 0 0-64-64m0 96a32 32 0 1 1 32-32a32.036 32.036 0 0 1-32 32m0-272a64 64 0 1 0 64 64a64.072 64.072 0 0 0-64-64m0 96a32 32 0 1 1 32-32a32.036 32.036 0 0 1-32 32"
            ></path>
          </svg>
        </Button>
      </DropdownTrigger>
      <DropdownMenu variant="faded" aria-label="Dropdown menu with description">
        <DropdownSection title="" showDivider>
          <DropdownItem
            key="edit"
            description="คุณสามารถแก้ไขข้อมูลเมนูอาหารได้"
            startContent={<EditDocumentIcon className={iconClasses} />}
            href={`menu/pages/EditProduct/${productId}`}
          >
            แก้ไขข้อมูลเมนูอาหาร
          </DropdownItem>
        </DropdownSection>
        <DropdownSection title="Danger zone">
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            description="หากลบจะไม่สามารถนำกลับมาได้"
            onClick={handleDelete}
            startContent={
              <DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />
            }
          >
            ลบเมนูอาหาร
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
