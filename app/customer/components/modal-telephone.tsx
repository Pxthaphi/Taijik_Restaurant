"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";
import { getUserID } from "@/app/auth/getUserID";

export default function ModalTelephone() {
  const [inputValues, setInputValues] = useState(Array(10).fill(""));
  const [isModalOpen, setIsModalOpen] = useState(true);
  const firstInputRef = useRef<HTMLInputElement>(null); // Create a ref for the first input

  useEffect(() => {
    // Focus on the first input field when the component mounts
    firstInputRef.current?.focus();
  }, []);

  const handleChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = event.target;
    if (/^\d*$/.test(value)) {
      const newInputValues = [...inputValues];
      newInputValues[index] = value;
      setInputValues(newInputValues);

      // Automatically focus the next input if it's not the last one
      if (value && index < 9) {
        document.getElementById(`input-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Backspace" && !inputValues[index]) {
      if (index > 0) {
        document.getElementById(`input-${index - 1}`)?.focus();
      }
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const paste = event.clipboardData.getData("text");
    if (/^\d{10}$/.test(paste)) {
      setInputValues(paste.split(""));
    }
    event.preventDefault();
  };

  const telephone = inputValues.join("");

  const handleConfirmTel = async () => {
    const phoneNumberRegex = /^[0-9]{10}$/;
    if (!telephone || !phoneNumberRegex.test(telephone)) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "กรุณาป้อนเบอร์โทรศัพท์ที่ถูกต้อง",
      });
      return;
    }

    Swal.fire({
      title: "ต้องการที่จะบันทึก?",
      text: "กรุณาตรวจสอบเบอร์โทรก่อนทำการบันทึก!!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#32C638",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการบันทึก",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error: userError } = await supabase
            .from("users")
            .update({ Tel_Phone: telephone })
            .eq("User_ID", getUserID());

          if (userError) {
            throw userError;
          }

          Swal.fire({
            title: "เพิ่มข้อมูลสำเร็จ!",
            text: "เพิ่มข้อมูลเบอร์โทรศัพท์สำเร็จ!!",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
          setIsModalOpen(false);
        } catch (error) {
          console.error("Error cancelling order:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถเพิ่มข้อมูลเบอร์โทรศัพท์ได้ในขณะนี้",
            icon: "error",
          });
        }
      } else {
        setIsModalOpen(false);
      }
    });
  };

  return (
    <Modal
      isOpen={isModalOpen}
      isDismissable={false}
      isKeyboardDismissDisabled={true}
      backdrop="opaque"
      placement="center"
      className="flex justify-center"
    >
      <ModalContent className="mx-6 p-4 max-w-sm">
        <ModalHeader className="flex flex-col gap-1">
          <h2 className="text-xl text-gray-800 font-DB_v4 pt-1">แจ้งเตือน</h2>
          <p className="text-sm text-gray-500 font-DB_v4">
            กรุณากรอกเบอร์โทรศัพท์ของคุณ
          </p>
        </ModalHeader>
        <ModalBody>
          <div className="flex space-x-2" onPaste={handlePaste}>
            {inputValues.map((value, index) => (
              <input
                key={index}
                id={`input-${index}`}
                ref={index === 0 ? firstInputRef : null} // Set ref only for the first input
                type="text"
                maxLength={1}
                value={value}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                inputMode="numeric"
                className="w-full h-10 text-center text-xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ))}
          </div>
        </ModalBody>
        <ModalFooter className="pt-7">
          <Button
            className="w-full text-white bg-green-600"
            onClick={handleConfirmTel}
          >
            ยืนยัน
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
