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
import dayjs from "dayjs";

import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(timezone);
dayjs.extend(utc);

interface DialogDemo {
  setIsModalOpen: (isOpen: boolean) => void;
}

export default function DialogDemo({ setIsModalOpen }: DialogDemo) {
  const [openTime, setOpenTime] = useState<string>(""); // Store as string for input fields
  const [closeTime, setCloseTime] = useState<string>(""); // Store as string for input fields
  const [timeID, setTimeID] = useState();

  // Fetch existing times when the modal is opened
  const fetchTimes = async () => {
    const { data, error } = await supabase.from("time").select("*").single();

    if (error) {
      console.error("Error fetching times:", error);
      return;
    }

    if (data) {
      setTimeID(data.ResTime_ID);

      const timeOpenFromDB = data.ResTime_On.replace("+00", ""); // Remove +00
      const timeCloseFromDB = data.ResTime_Off.replace("+00", ""); // Remove +00

      const currentTime = dayjs.utc(); // Current time in UTC

      // Convert the database times to Thai time
      const timeOpen = dayjs
        .utc(`${currentTime.format("YYYY-MM-DD")}T${timeOpenFromDB}Z`)
        .tz("Asia/Bangkok")
        .format("HH:mm"); // Convert to Thai time and format as HH:mm

      const timeClose = dayjs
        .utc(`${currentTime.format("YYYY-MM-DD")}T${timeCloseFromDB}Z`)
        .tz("Asia/Bangkok")
        .format("HH:mm"); // Convert to Thai time and format as HH:mm

      setOpenTime(timeOpen); // Set as string for input
      setCloseTime(timeClose); // Set as string for input
    }
  };

  useEffect(() => {
    fetchTimes(); // Fetch times when the modal is opened
    console.log("", openTime);
    console.log("", closeTime);
  }, []);

  const convertToUTC = (timeString: string) => {
    return dayjs
      .tz(`1970-01-01T${timeString}`, "Asia/Bangkok")
      .utc()
      .format("HH:mm:ss");
  };

  const handleConfirmTimes = async () => {
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

    // Convert times to UTC before saving
    const openTimeUTC = convertToUTC(openTime);
    const closeTimeUTC = convertToUTC(closeTime);

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
              .update({ ResTime_On: openTimeUTC, ResTime_Off: closeTimeUTC })
              .eq("ResTime_ID", timeID)
              .select();
            if (error) {
              throw error;
            }
          } else {
            const { data, error } = await supabase
              .from("time")
              .insert({ ResTime_On: openTimeUTC, ResTime_Off: closeTimeUTC });
            if (error) {
              throw error;
            }
          }

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
                    value={openTime} // openTime is now a string
                    onChange={(e) => {
                      setOpenTime(e.target.value); // Store time directly as a string
                      setCloseTime(""); // Reset closing time when opening time changes
                    }}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-DB_v4 mb-1">
                    เวลาปิดร้าน
                  </label>
                  <Input
                    type="time"
                    value={closeTime} // closeTime is now a string
                    onChange={(e) => setCloseTime(e.target.value)}
                    min={openTime} // Set minimum close time based on opening time
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
