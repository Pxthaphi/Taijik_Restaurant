"use client";
import React from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/input";
import Swal from "sweetalert2";

interface ModalCancelOrderProps {
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function ModalCancelOrder({
  setIsModalOpen,
}: ModalCancelOrderProps) {
  const handleConfirmCancel = () => {
    setIsModalOpen(false); // Close the modal
    Swal.fire({
      title: "ต้องการที่จะยกเลิก??",
      text: "ถ้าหากยกเลิกสินค้าแล้ว จะไม่สามารถย้อนกลับได้อีก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#32C638",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการยกเลิก",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "ยกเลิกคำสั่งซื้อสำเร็จ!",
          text: "ขอบคุณที่ใช้บริการร้านใต้จิกค่ะ.",
          icon: "success",
          showConfirmButton: false,
          timer: 1000,
        });
        // setStatus_order(5);
      }
    });
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={() => setIsModalOpen(false)}
        isDismissable={false}
        isKeyboardDismissDisabled={true}
        backdrop="opaque"
        placement="center"
        className="flex justify-center"
      >
        <ModalContent className="mx-6">
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl text-gray-800 font-DB_v4 pt-1">
                ยกเลิกคำสั่งซื้อ
              </h2>
              <p className="text-sm text-gray-500 font-DB_v4">
                กรุณาระบุข้อความเหตุผลที่ยกเลิกคำสั่งซื้อ??
              </p>
            </ModalHeader>
            <ModalBody>
              <Textarea
                autoFocus
                isRequired
                label="หมายเหตุ"
                labelPlacement="outside"
                placeholder="ระบุอะไรสักอย่าง......."
                className="max-w-sm font-DB_Med"
              />
            </ModalBody>
            <ModalFooter>
              <Button
                className="bg-gray-100 text-gray-700"
                onClick={() => setIsModalOpen(false)}
              >
                ยกเลิก
              </Button>
              <Button
                className="text-white bg-green-600"
                onClick={handleConfirmCancel}
              >
                ยืนยัน
              </Button>
            </ModalFooter>
          </>
        </ModalContent>
      </Modal>
    </>
  );
}
