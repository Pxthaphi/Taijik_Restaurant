"use client"; // Mark this file as a Client Component

import { Button } from "@nextui-org/react";
import { getUserID } from "@/app/auth/getUserID";

export default function Page() {
  const sendOrderNotification = async () => {
    const Order_ID = "TK-00000001";
    const userId = getUserID();

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    const message = [
      {
        type: "flex",
        altText: "สถานคำสั่งซื้อ : รอทางร้านยืนยันคำสั่งซื้อ | ร้านอาหารใต้จิก",
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
                    url: "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/waiting_order.png",
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
                size: "lg",
                weight: "bold",
                wrap: true,
                align: "start",
                color: "#008DDA",
                text: "รอทางร้านยืนยันคำสั่งซื้อ",
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
                  },
                  {
                    type: "text",
                    text: `${Order_ID}`,
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
                margin: "lg",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ข้าวกะเพราไก่ x 1",
                        flex: 0,
                      },
                      {
                        type: "text",
                        text: "฿50",
                        align: "end",
                        offsetEnd: "10px",
                        color: "#399918",
                      },
                    ],
                  },
                ],
                spacing: "xs",
                margin: "xxl",
                offsetStart: "5px",
              },
              {
                type: "separator",
                margin: "xl",
              },
              {
                type: "box",
                layout: "vertical",
                contents: [
                  {
                    type: "button",
                    style: "primary",
                    color: "#88D66C",
                    action: {
                      type: "uri",
                      label: "ดูรายละเอียดคำสั่งซื้อ",
                      uri: `https://line.me/R/oaMessage/%40544iobxm`,
                    },
                    height: "sm",
                  },
                ],
                maxWidth: "190px",
                offsetStart: "50px",
                margin: "lg",
              },
            ],
            paddingAll: "10px",
            backgroundColor: "#ffffff",
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
    <div>
      <Button color="primary" variant="shadow" onClick={sendOrderNotification}>
        Test Send Notification
      </Button>
    </div>
  );
}
