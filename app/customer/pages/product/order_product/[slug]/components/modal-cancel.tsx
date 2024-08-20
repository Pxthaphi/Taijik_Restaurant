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
import { getUserID } from "@/app/auth/getUserID";

interface ModalCancelOrderProps {
  setIsModalOpen: (isOpen: boolean) => void;
  orderId: string; // Receive orderId prop
}

export default function ModalCancelOrder({
  setIsModalOpen,
  orderId,
}: ModalCancelOrderProps) {
  const [orderDetail, setOrderDetail] = useState("");

  const handleConfirmCancel = async () => {
    if(!orderDetail){
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "กรุณาป้อนเหตุผลที่ต้องการจะยกเลิกการสั่งเมนูอาหาร",
      });
      return;
    }
    setIsModalOpen(false); // Close the modal
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
          const { data, error } = await supabase
            .from("orders")
            .update({ Order_Status: 5, Order_Detail: orderDetail })
            .eq("Order_ID", orderId);

          if (error) {
            throw error;
          }

          // Delete the entry from the queue table
          const { error: queueError } = await supabase
            .from("queue")
            .delete()
            .eq("Order_ID", orderId);

          if (queueError) {
            throw queueError;
          }

          Swal.fire({
            title: "ยกเลิกคำสั่งซื้อสำเร็จ!",
            text: "ขอบคุณที่ใช้บริการร้านใต้จิกค่ะ.",
            icon: "success",
            showConfirmButton: false,
            timer: 1000,
          });

          await sendOrderNotification();
          
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

  const sendOrderNotification = async () => {
    const userId = getUserID();

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    // Flex Message ข้อความ
    const message = [
      {
        type: "flex",
        altText: `ร้านอาหารใต้จิก : คำสั่งซื้อ [${orderId}] | สถานะคำสั่งซื้อ ยกเลิกคำสั่งซื้อ`,
        contents: {
          type: "bubble",
          body: {
            type: "box",
            layout: "vertical",
            spacing: "md",
            contents: [
              {
                type: "image",
                url: "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/bg_order.png",
                size: "full",
                aspectRatio: "20:13",
                aspectMode: "cover",
                animated: true,
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "image",
                    url: "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png",
                    size: "full",
                    margin: "15px",
                    animated: true,
                  },
                ],
                width: "180px",
                position: "absolute",
                offsetStart: "65px",
                offsetTop: "27px",
                height: "190px",
                justifyContent: "center",
              },
              {
                type: "text",
                text: "ร้านอาหารใต้จิก",
                offsetStart: "5px",
                size: "xs",
                weight: "bold",
                offsetTop: "5px",
                color: "#4f4f4f",
                align: "start",
              },
              {
                type: "text",
                size: "lg",
                weight: "bold",
                wrap: true,
                align: "start",
                color: "#D41111",
                text: "ยกเลิกคำสั่งซื้อ",
                margin: "10px",
                decoration: "none",
                offsetStart: "5px",
                style: "normal",
              },
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  {
                    type: "text",
                    text: "เลขคำสั่งซื้อ",
                    color: "#555555",
                    size: "sm",
                    flex: 1,
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: `${orderId}`, // ตรวจสอบว่า Order_ID มีค่าก่อนใช้
                    color: "#555555",
                    size: "sm",
                    weight: "bold",
                    flex: 2,
                  },
                ],
                offsetStart: "5px",
              },
              {
                type: "separator",
                margin: "xl",
              },
            ],
            paddingAll: "10px",
            backgroundColor: "#ffffff",
          },
          footer: {
            type: "box",
            layout: "vertical",
            contents: [
              {
                type: "button",
                style: "primary",
                color: "#88D66C",
                action: {
                  type: "uri",
                  label: "รายละเอียดคำสั่งซื้อ",
                  uri: `https://liff.line.me/2004539512-7wZyNkj0/customer/pages/product/order_product/${orderId}`,
                },
                height: "sm",
                gravity: "center",
              },
            ],
            maxWidth: "190px",
            offsetStart: "50px",
            margin: "lg",
          },
        },
      },
    ];

    try {
      const response = await fetch("/api/sendFlexMessage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, message }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log(data.message);
      } else {
        console.error("Failed to send notification:", data.error);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
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
