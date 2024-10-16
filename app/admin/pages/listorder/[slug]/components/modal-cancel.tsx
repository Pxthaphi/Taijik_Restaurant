"use client";
import React, { useState } from "react";
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
import { supabase } from "@/lib/supabase";

interface ModalCancelOrderProps {
  setIsModalOpen: (isOpen: boolean) => void;
  orderId: string; // รับ orderId เป็น prop
  fetchOrderData: () => void; // รับฟังก์ชัน fetchOrderData เพื่ออัปเดตข้อมูลในหน้าหลัก
}

export default function ModalCancelOrder({
  setIsModalOpen,
  orderId,
  fetchOrderData, // เพิ่ม fetchOrderData เพื่อดึงข้อมูลใหม่หลังจากยกเลิกเสร็จ
}: ModalCancelOrderProps) {
  const [orderDetail, setOrderDetail] = useState("");

  const handleConfirmCancel = async () => {
    if (!orderDetail) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "กรุณาป้อนเหตุผลที่ต้องการจะยกเลิกคำสั่งซื้อของลูกค้า",
      });
      return;
    }

    setIsModalOpen(false); // ปิด modal
    Swal.fire({
      title: "ต้องการที่จะยกเลิก??",
      text: "ถ้าหากยกเลิกสินค้าแล้ว จะไม่สามารถย้อนกลับได้อีก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#32C638",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { error } = await supabase
            .from("orders")
            .update({ Order_Status: 5, Order_Detail: orderDetail })
            .eq("Order_ID", orderId);

          if (error) {
            throw error;
          }

          // ลบข้อมูลจากตาราง queue
          const { error: queueError } = await supabase
            .from("queue")
            .delete()
            .eq("Order_ID", orderId);

          if (queueError) {
            throw queueError;
          }

          Swal.fire({
            title: "ยกเลิกคำสั่งซื้อสำเร็จ!",
            text: "กรุณารอสักครู่..",
            icon: "success",
            showConfirmButton: false,
            timer: 1000,
          });

          // ดึงข้อมูลออเดอร์ใหม่
          fetchOrderData(); // เรียก fetchOrderData เพื่อนำข้อมูลใหม่ไปแสดง
        } catch (error) {
          console.log("Error cancelling order:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถยกเลิกคำสั่งซื้อได้ในขณะนี้",
            icon: "error",
          });
        }
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
                กรุณาระบุข้อความเหตุผลที่ยกเลิกคำสั่งซื้อ
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
                value={orderDetail}
                onChange={(e) => setOrderDetail(e.target.value)}
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
