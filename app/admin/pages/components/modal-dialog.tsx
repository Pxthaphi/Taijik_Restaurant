"use client";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
} from "@nextui-org/react";
import Swal from "sweetalert2";
import { supabase } from "@/lib/supabase";

interface DialogDemo {
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function DialogDemo({ setIsModalOpen }: DialogDemo) {
  const [openTime, setOpenTime] = useState("");
  const [closeTime, setCloseTime] = useState("");
  const [timeID, setTimeID] = useState();

  // Fetch existing times when the modal is opened
  const fetchTimes = async () => {
    const { data, error } = await supabase.from("time").select("*").single(); // Fetch a single row

    if (error) {
      console.error("Error fetching times:", error);
      return;
    }

    if (data) {
      setTimeID(data.ResTime_ID);
      setOpenTime(data.ResTime_On);
      setCloseTime(data.ResTime_Off);
    }
  };

  useEffect(() => {
    fetchTimes(); // Fetch times when the modal is opened
  }, []);

  const handleConfirmTimes = () => {
    if (!openTime || !closeTime) {
      Swal.fire({
        icon: "warning",
        title: "แจ้งเตือน!!",
        text: "กรุณาป้อนเวลาเปิดและเวลาปิดร้าน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#FFA200FF",
      });
      return;
    }

    // Check if closing time is earlier than opening time
    if (closeTime <= openTime) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "กรุณาเลือกเวลาปิดร้านหลังจากเวลาเปิดร้าน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#D31111FF",
      });
      return;
    }

    // Show confirmation dialog with SweetAlert2
    Swal.fire({
      title: "ยืนยันการตั้งค่าเวลา",
      html: `เวลาเปิดร้าน: ${openTime} น.<br />เวลาปิดร้าน: ${closeTime} น.`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#D31111FF",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          if (timeID == 1) {
            const { data, error } = await supabase
              .from("time")
              .update({ ResTime_On: openTime, ResTime_Off: closeTime })
              .eq("ResTime_ID", timeID)
              .select();
            if (error) {
              throw error;
            }
          } else {
            const { data, error } = await supabase
              .from("time")
              .insert({ ResTime_On: openTime, ResTime_Off: closeTime });
            if (error) {
              throw error;
            }
          }

          // If confirmed, close the modal and show success message
          setIsModalOpen(false);
          Swal.fire({
            title: "บันทึกเวลาเปิด-ปิดร้าน",
            html: `เวลาเปิดร้าน: ${openTime} น.<br />เวลาปิดร้าน: ${closeTime} น.`,
            icon: "success",
            showConfirmButton: false,
            timer: 3000,
          });
        } catch (error) {
          console.log("Error set time open & close:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: `ไม่สามารถตั้งเวลาเปิดปิดร้านได้ในขณะนี้ เนื่องจาก ${closeTime}`,
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
                ตั้งเวลาเปิด-ปิดร้าน
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="block text-gray-700 font-DB_v4 mb-1">
                    เวลาเปิดร้าน
                  </label>
                  <Input
                    type="time"
                    value={openTime}
                    onChange={(e) => {
                      setOpenTime(e.target.value);
                      setCloseTime(""); // Reset closing time when opening time changes
                    }}
                    className="max-w-sm"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-DB_v4 mb-1">
                    เวลาปิดร้าน
                  </label>
                  <Input
                    type="time"
                    value={closeTime}
                    onChange={(e) => setCloseTime(e.target.value)}
                    className="max-w-sm"
                    min={openTime} // Set minimum time for closing time
                  />
                </div>
              </div>
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
                onClick={handleConfirmTimes}
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
