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

export default function OptionUsers({ userId }: { userId: string }) {
  const iconClasses =
    "text-xl text-default-500 pointer-events-none flex-shrink-0";

  const handleDelete = async () => {
    Swal.fire({
      title: "แน่ใจใช่มั้ย ?",
      text: "หากเปลี่ยนสถานะ จะไม่สามารถกู้ข้อมูลกลับมาได้อีก!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#4CBB17",
      cancelButtonColor: "#d33",
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      showLoaderOnConfirm: true,
      preConfirm: async () => {
        try {
          // Delete the record from the database
          const {error: deleteError } = await supabase
            .from("users")
            .update({ User_Ticket: 0 })
            .eq("User_ID", userId);

          if (deleteError) {
            throw deleteError;
          }

          Swal.fire({
            icon: "success",
            title: "ทำรายการสำเร็จ",
            text: "เปลี่ยนสถานะผู้ใช้สำเร็จ กรุณารอสักครู่",
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
        <DropdownSection title="Danger zone">
          <DropdownItem
            key="delete"
            className="text-danger"
            color="danger"
            description="หากเปลี่ยนแล้วจะไม่สามารถนำกลับมาได้"
            onClick={handleDelete}
            startContent={
              <DeleteDocumentIcon className={cn(iconClasses, "text-danger")} />
            }
          >
            ลบสถานะ Blacklist
          </DropdownItem>
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
