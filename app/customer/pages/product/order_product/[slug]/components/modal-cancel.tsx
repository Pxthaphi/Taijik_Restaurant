'use client'
import React, { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
} from "@nextui-org/react";
import { Textarea } from "@nextui-org/input";

export default function ModalCancelOrder() {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  useEffect(() => {
    onOpen();
  }, [onOpen]);


  return (
    <>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
        className="flex justify-center"
      >
        <ModalContent className="mx-6">
          {(onClose) => (
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
                  isRequired
                  label="หมายเหตุ"
                  labelPlacement="outside"
                  placeholder="ระบุอะไรสักอย่าง......."
                  className="max-w-sm font-DB_Med"
                />
              </ModalBody>
              <ModalFooter>
                
                <Button className="bg-gray-100 text-gray-700 font-DB_v4 shadow-lg" onPress={onClose}>
                  ยกเลิก
                </Button>
                <Button
                  className="text-white font-DB_v4 bg-green-600 shadow-lg"
                  onPress={onClose}
                >
                  ยืนยัน
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
