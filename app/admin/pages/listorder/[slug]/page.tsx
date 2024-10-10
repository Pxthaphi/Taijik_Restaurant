"use client";
import { useRouter } from "next/navigation";
import { Textarea } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Modal_CancelOrder from "./components/modal-cancel";
import Swal from "sweetalert2";
import { Avatar } from "@nextui-org/react";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
  };
}

interface Order {
  Order_ID: string;
  User_ID: string;
  Order_Datetime: string;
  Receive_Time: string;
  Order_Detail: string;
  Order_Option: string;
  Promotion_ID: number;
  Order_Status: keyof typeof statusNames;
}

interface OrderProduct {
  OrderP_ID: number;
  Order_ID: string;
  Product_ID: number;
  Product_Qty: number;
  Product_Size: string;
  Product_Meat: number | number[]; // Adjusted to handle both single values and arrays
  Product_Option: number | number[]; // Adjusted to handle both single values and arrays
  Product_Noodles: number | number[];
  Product_Detail: string;
  Total_Price: number;
}

interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Type: number;
  Product_Status: number;
  Product_Image: string;
  Product_Update: string;
}

interface Meat {
  Meat_ID: number;
  Meat_Name: string; // Changed to string as it's more typical for a single name
  Meat_Price: number;
}

interface FoodOption {
  Option_ID: number;
  Option_Names: string[];
  Option_Price: number;
}

interface MergedProduct extends OrderProduct {
  Product_Name: string;
  Product_Image: string;
  Meat_Names: string[]; // Corrected to match the expected array
  Option_Names: string[];
  Noodles_Names: string[]; // Add a field to store noodle type names
}

const statusNames = {
  1: "รอการยืนยัน",
  2: "กำลังดำเนินการ",
  3: "เตรียมเสร็จสิ้น",
  4: "ลูกค้ารับแล้ว",
  5: "ยกเลิกคำสั่งซื้อ",
};

export default function ListOrder_Status({ params }: PageProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userPicture, setUserPicture] = useState<string>("");
  const [orderStatusName, setOrderStatusName] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState(1);
  const [lastNotifiedStatus, setLastNotifiedStatus] = useState(0); // เริ่มต้นด้วยค่า 0 หรือ null
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [quantityMap, setQuantityMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string>("");
  const [userID, setuserID] = useState<string>("");
  const [telephone, setTelephone] = useState<string>("");

  let Status_text = "";
  let Status_detail = "";
  let Status_image = "";
  let Status_textcolor = "";

  if (orderStatus == 1) {
    Status_text = "รอการยืนยันคำสั่งซื้อจากทางร้าน";
    Status_textcolor = "#008DDA";
    Status_detail = "กำลังรอดำเนินการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/waiting_order.png";
  } else if (orderStatus == 2) {
    Status_text = "กำลังจัดเตรียมเมนูอาหาร";
    Status_textcolor = "#e35a20";
    Status_detail = "กำลังรอดำเนินการ อาจจะใช้เวลานานกว่ากำหนดการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/preparing_order.png";
  } else if (orderStatus == 3) {
    Status_text = "เตรียมเมนูอาหารเสร็จสิ้น";
    Status_textcolor = "#269117";
    Status_detail = "กรุณาเดินทางเข้ามารับเมนูอาหารของท่าน";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_prepare.png";
  } else if (orderStatus == 4) {
    Status_text = "คำสั่งซื้อเสร็จสิ้น";
    Status_textcolor = "#269117";
    Status_detail = "ขอบคุณที่ใช้บริการร้านอาหารใต้จิกค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_order.png";
  } else if (orderStatus == 5) {
    Status_text = "ยกเลิกคำสั่งซื้อ";
    Status_textcolor = "#E11212";
    Status_detail = "ทางร้านขออภัยหากเกิดมีข้อผิดพลาดประการใด";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
  } else {
    Status_text = "เกิดข้อผิดพลาดในการสั่งอาหาร";
    Status_textcolor = "#E11212";
    Status_detail = "กรุณาลองสั่งอาหารใหม่อีกครั้งค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
  }

  useEffect(() => {
    const deleteQueueEntry = async () => {
      if (orderStatus === 4) {
        // Delete the entry from the queue table
        const { error: queueError } = await supabase
          .from("queue")
          .delete()
          .eq("Order_ID", params.slug);

        if (queueError) {
          throw queueError;
        }

        console.log("delete data from queue success");
      }
    };

    deleteQueueEntry();
  }, [orderStatus]);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("Order_ID", params.slug)
          .single();

        if (orderError) throw orderError;

        const typedOrderData = orderData as Order;

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("User_ID, User_Name, User_Picture, Tel_Phone")
          .eq("User_ID", typedOrderData.User_ID)
          .single();

        if (userError) throw userError;

        setuserID(userData?.User_ID || "");
        setUserName(userData?.User_Name || "");
        setUserPicture(userData?.User_Picture || "");
        setTelephone(userData?.Tel_Phone || "");

        setOrderStatusName(statusNames[typedOrderData.Order_Status] || "");
        setOrderStatus(typedOrderData.Order_Status);

        const { data: orderProductsData, error: orderProductsError } =
          await supabase
            .from("order_products")
            .select("*")
            .eq("Order_ID", params.slug);

        if (orderProductsError) throw orderProductsError;

        const productIds = orderProductsData.map((op) => op.Product_ID);
        const meatIds = orderProductsData.flatMap((op) =>
          Array.isArray(op.Product_Meat) ? op.Product_Meat : [op.Product_Meat]
        );
        const optionIds = orderProductsData.flatMap((op) =>
          Array.isArray(op.Product_Option)
            ? op.Product_Option
            : [op.Product_Option]
        );

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("*")
          .in("Product_ID", productIds);

        if (productsError) throw productsError;

        const { data: meatsData, error: meatsError } = await supabase
          .from("product_meat")
          .select("*")
          .in("Meat_ID", meatIds);

        if (meatsError) throw meatsError;

        const { data: optionsData, error: optionsError } = await supabase
          .from("product_option")
          .select("*")
          .in("Option_ID", optionIds);

        if (optionsError) throw optionsError;

        // Fetch noodle types
        const noodleIds = orderProductsData.flatMap((op) =>
          Array.isArray(op.Product_Option)
            ? op.Product_Noodles
            : [op.Product_Noodles]
        );

        const { data: noodlesData, error: noodlesError } = await supabase
          .from("noodles_type")
          .select("*")
          .in("Noodles_ID", noodleIds);

        if (noodlesError) throw noodlesError;

        const mergedProducts = orderProductsData.map(
          (orderProduct: OrderProduct) => {
            const product = productsData.find(
              (p) => p.Product_ID === orderProduct.Product_ID
            );

            const meatIds = Array.isArray(orderProduct.Product_Meat)
              ? orderProduct.Product_Meat
              : [orderProduct.Product_Meat];

            const meatNames = meatsData
              .filter((meat) => meatIds.includes(meat.Meat_ID))
              .map((meat) => meat.Meat_Name);

            const productOptionIds = Array.isArray(orderProduct.Product_Option)
              ? orderProduct.Product_Option
              : [orderProduct.Product_Option];

            const optionNames = optionsData
              .filter((opt) => productOptionIds.includes(opt.Option_ID))
              .map((opt) => opt.Option_Name);

            const noodleIds = Array.isArray(orderProduct.Product_Noodles)
              ? orderProduct.Product_Noodles
              : [orderProduct.Product_Noodles];

            const noodleNames = noodlesData
              .filter((noodle) => noodleIds.includes(noodle.Noodles_ID))
              .map((noodle) => noodle.Noodles_Name);

            return {
              ...orderProduct,
              Product_Name: product?.Product_Name || "",
              Product_Image: product?.Product_Image || "",
              Meat_Names: meatNames,
              Option_Names: optionNames,
              Noodles_Names: noodleNames, // Include the noodle names
            };
          }
        );

        setOrder(typedOrderData);
        setProducts(mergedProducts);

        const quantityMapFromResponse = orderProductsData.reduce(
          (map, product) => {
            map[product.Product_ID] = product.Product_Qty;
            return map;
          },
          {}
        );

        setQuantityMap(quantityMapFromResponse);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Change received!", payload);
          fetchOrderData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.slug]);

  const openModalCancel = (orderId: string) => {
    setCancelOrderId(orderId);
    setIsModalOpen(true);
  };
  const handleChangeStatus = async () => {
    Swal.fire({
      title: "ต้องการที่จะเปลี่ยนสถานะ??",
      text: "ถ้าหากเปลี่ยนสถานะแล้ว จะไม่สามารถย้อนกลับได้อีก",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#32C638",
      cancelButtonColor: "#d33",
      confirmButtonText: "ต้องการเปลี่ยนสถานะ",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const newStatus = orderStatus + 1;

          const { data, error } = await supabase
            .from("orders")
            .update({ Order_Status: newStatus })
            .eq("Order_ID", params.slug);

          if (error) {
            throw error;
          }

          // อัปเดตค่า orderStatus ให้เป็นสถานะใหม่
          setOrderStatus(newStatus);

          Swal.fire({
            title: "เปลี่ยนสถานะคำสั่งซื้อสำเร็จ!",
            text: "กรุณารอสักครู่..",
            icon: "success",
            showConfirmButton: false,
            timer: 1500,
          });
        } catch (error) {
          console.log("Error changing order status:", error);
          Swal.fire({
            title: "เกิดข้อผิดพลาด!",
            text: "ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้ในขณะนี้",
            icon: "error",
          });
        }
      }
    });
  };

  // useEffect to send a notification after orderStatus has changed
  useEffect(() => {
    const sendNotification = async () => {
      if (orderStatus && orderStatus !== lastNotifiedStatus) {
        try {
          if (orderStatus) {
            await sendOrderNotification();
          }
          setLastNotifiedStatus(orderStatus); // อัปเดตสถานะที่ส่งการแจ้งเตือนล่าสุด
        } catch (error) {
          console.error("Error sending order notification:", error);
        }
      }
    };

    sendNotification();
  }, [orderStatus, lastNotifiedStatus]);

  const calculateTotalPrice = () => {
    return products.reduce((total, product) => {
      const quantity = quantityMap[product.Product_ID] || 0;
      return total + product.Total_Price * quantity;
    }, 0);
  };

  const navigateBack = () => {
    router.back();
  };

  function getStatusColor(status: string): string {
    switch (status) {
      case "รอการยืนยัน":
        return "bg-sky-500";
      case "กำลังดำเนินการ":
        return "bg-orange-500";
      case "เตรียมเสร็จสิ้น":
      case "ลูกค้ารับแล้ว":
        return "bg-green-600";
      case "ยกเลิกคำสั่งซื้อ":
        return "bg-red-500";
      default:
        return "bg-gray-400"; // สีเทาเป็นค่าเริ่มต้นหากไม่ระบุสถานะ
    }
  }

  const sendOrderNotification = async () => {
    const userId = userID;

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    // สร้างรายการอาหาร
    const orderItems = products.map((product) => {
      const quantity = quantityMap[product.Product_ID]; // ค่าเริ่มต้นเป็น 1 ถ้าจำนวนไม่ระบุ
      const meatText = product.Meat_Names ? ` (${product.Meat_Names})` : "";
      const optionsText = product.Option_Names
        ? ` (เพิ่ม ${product.Option_Names})`
        : "";
      const noodlesText = product.Noodles_Names
        ? ` (เส้น: ${product.Noodles_Names.join(", ")})`
        : ""; // Add noodles information

      return {
        type: "box",
        layout: "horizontal",
        contents: [
          {
            type: "text",
            text: `${product.Product_Name} ${meatText} ${optionsText} ${noodlesText} x ${quantity}`,
            flex: 0,
            size: "sm",
          },
          {
            type: "text",
            text: `฿${product.Total_Price * quantity}`,
            align: "end",
            offsetEnd: "10px",
            color: "#399918",
          },
        ],
      };
    });

    // คำนวณส่วนลดและราคาสุทธิ
    const discount = 0; // สมมุติส่วนลดเป็น 0
    const totalPrice = products.reduce((sum, product) => {
      const quantity = quantityMap[product.Product_ID] || 1;
      return sum + product.Total_Price * quantity;
    }, 0);
    const finalPrice = totalPrice - discount;

    // Flex Message ข้อความ
    const message = [
      {
        type: "flex",
        altText: `ร้านอาหารใต้จิก : คำสั่งซื้อ [${params.slug}] | สถานะคำสั่งซื้อ ${Status_text}`,
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
                    url: `${Status_image}`,
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
                color: `${Status_textcolor}`,
                text: `${Status_text}`,
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
                    text: `${params.slug}`, // ตรวจสอบว่า Order_ID มีค่าก่อนใช้
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
                contents: orderItems,
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
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ส่วนลด",
                        color: "#c21313",
                        offsetStart: "5px",
                        align: "start",
                        weight: "bold",
                        size: "md",
                      },
                      {
                        type: "text",
                        text: `-฿${discount}`,
                        offsetEnd: "5px",
                        align: "end",
                        color: "#c21313",
                        size: "md",
                      },
                    ],
                    paddingBottom: "10px",
                    paddingTop: "5px",
                  },
                  {
                    type: "box",
                    layout: "horizontal",
                    contents: [
                      {
                        type: "text",
                        text: "ราคาสุทธิ",
                        offsetStart: "5px",
                        size: "md",
                        weight: "bold",
                        color: "#269117",
                      },
                      {
                        type: "text",
                        text: `฿${finalPrice}`,
                        offsetEnd: "5px",
                        align: "end",
                        color: "#269117",
                        weight: "regular",
                        size: "md",
                      },
                    ],
                    paddingBottom: "10px",
                  },
                ],
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
                  label: "ดูสถานะคำสั่งซื้อ",
                  uri: `https://liff.line.me/2004539512-7wZyNkj0/customer/pages/product/order_product/${params.slug}`,
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

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${
          loading ? "bg-green-600" : "bg-white"
        }`}
      >
        <div className="flex flex-col items-center">
          <img
            src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/loading.png"
            alt="Loading"
            className="animate-wiggle animate-infinite"
          ></img>
          <div className="mt-8">
            <div className="text-3xl text-white font-UID_Deep">
              กรุณารอสักครู่ . . . . .
            </div>
          </div>

          <div role="status" className="mt-8 animate-fade animate-delay-1000">
            <svg
              aria-hidden="true"
              role="status"
              className="inline w-10 h-10 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="#848484"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="#EBEAE5"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <main className="">
        <header className="mx-8 mt-8 flex justify-center item-center">
          <div
            className="absolute py-1 px-1 top-8 left-8"
            onClick={navigateBack}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-7 h-7 cursor-pointer"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
              />
            </svg>
          </div>
          <div className="font-DB_Med text-2xl pt-0.5">
            รายละเอียดคำสั่งซื้อ
          </div>
        </header>

        <section className="mt-6 mx-8">
          <div className="flex justify-between item-center">
            <p className="text-lg font-DB_Med">รหัสคำสั่งซื้อ</p>
            <p className="text-lg font-DB_Med">{params.slug}</p>
            <div
              className={`rounded-2xl px-2 py-0.5 w-auto h-auto ${getStatusColor(
                orderStatusName
              )}`}
            >
              <p className="text-sm font-DB_Med text-white pt-0.5">
                {orderStatusName}
              </p>
            </div>
          </div>
          <div className="flex item-center mt-5">
            <p className="text-lg font-DB_Med me-[5.2rem]">ชื่อผู้สั่ง</p>
            <div className="flex justify-center items-center me-[1.5rem]">
              <Avatar src={userPicture} className="w-7 h-7 me-2" />
              <p className="text-lg font-DB_Med">{userName}</p>
            </div>
            <Link
              href={`tel:${telephone}`}
              className="flex justify-center items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-7 h-7 text-white rounded-2xl bg-green-500 px-1 py-1 me-1"
              >
                <path
                  fill="currentColor"
                  d="M5 9.86a18.47 18.47 0 0 0 9.566 9.292l.68.303a3.5 3.5 0 0 0 4.33-1.247l.889-1.324a1 1 0 0 0-.203-1.335l-3.012-2.43a1 1 0 0 0-1.431.183l-.932 1.257a12.14 12.14 0 0 1-5.51-5.511l1.256-.932a1 1 0 0 0 .183-1.431l-2.43-3.012a1 1 0 0 0-1.335-.203l-1.333.894a3.5 3.5 0 0 0-1.237 4.355z"
                />
              </svg>
              <p className="text-sm font-DB_v4 pt-1">โทรเลย</p>
            </Link>
          </div>
        </section>

        <hr className="mx-8 h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>

        {products.map((product) => (
          <section key={product.Product_ID} className="mt-6 mx-6">
            <div className="max-w-full my-2">
              <div className="rounded-2xl flex items-center">
                <div className="w-1/3 ms-2">
                  <img
                    className="w-18 h-18 object-cover rounded-xl"
                    src={`${product.Product_Image}?t=${new Date().getTime()}`}
                    alt={product.Product_Name}
                  />
                </div>
                <div className="w-1/2 ms-4 pt-1">
                  <h3 className="text-lg font-DB_Med text-gray-700">
                    {product.Product_Name} ({product.Meat_Names.join(", ")})
                  </h3>
                  {product.Option_Names.length > 0 && (
                    <p className="text-sm text-gray-500 font-DB_v4">
                      ตัวเลือกเพิ่มเติม: {product.Option_Names.join(", ")}
                    </p>
                  )}
                  {product.Noodles_Names.length > 0 && (
                    <p className="text-sm text-gray-500 font-DB_v4">
                      ชนิดเส้น: {product.Noodles_Names.join(", ")}
                    </p>
                  )}
                  {product.Product_Detail != "" && (
                    <p className="text-sm text-gray-500 font-DB_v4">
                      รายละเอียดเพิ่มเติม : {product.Product_Detail}
                    </p>
                  )}
                  <div className="flex justify-between gap-x-6">
                    <h3 className="text-lg font-DB_Med text-green-600">
                      ฿{product.Total_Price}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        <hr className="mx-8 h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>

        <section className="mx-8 mt-5">
          <div className="text-xl text-gray-800 font-DB_Med mt-4">ราคารวม</div>
          {products.map((product) => (
            <div key={product.Product_ID} className="flex justify-between mt-3">
              <div className="text-base text-gray-800 font-DB_Med flex flex-wrap items-center space-x-2">
                {product.Product_Name}{" "}
                {product.Noodles_Names.length > 0 &&
                  product.Noodles_Names.join(", ")}{" "}
                ({product.Meat_Names.join(", ")}) (เพิ่ม{" "}
                {product.Option_Names.length > 0 &&
                  product.Option_Names.join(", ")}{" "}
                x {quantityMap[product.Product_ID]}
              </div>
              <div className="text-base text-gray-800 font-DB_Med">
                ฿{product.Total_Price * (quantityMap[product.Product_ID] || 0)}
                .00
              </div>
            </div>
          ))}
          <div className="flex justify-between mt-3">
            <div className="text-base text-gray-800 font-DB_Med">ส่วนลด</div>
            <div className="text-base text-gray-800 font-DB_Med">฿0</div>
          </div>

          <hr className="h-px my-2 bg-gray-100 border-0 mt-3 pt-1 rounded-full"></hr>

          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-2xl text-green-600 font-DB_Med">
              ฿{calculateTotalPrice()}.00
            </div>
          </div>
          <hr className="h-px my-2 bg-gray-100 border-0 mt-3 pt-1 rounded-full"></hr>
        </section>

        <section className="mx-8 mt-3">
          <div className="text-xl text-gray-800 font-DB_Med">หมายเหตุ</div>
          <Textarea
            placeholder="ไม่มีหมายเหตุ"
            className="max-w-full pt-2 font-DB_v4"
            defaultValue={order?.Order_Detail || ""}
            isReadOnly
          />
        </section>

        {isModalOpen && (
          <Modal_CancelOrder
            setIsModalOpen={setIsModalOpen}
            orderId={cancelOrderId}
          />
        )}
      </main>

      <footer className="mt-12 pt-16">
        <div className="flex justify-center fixed inset-x-0 w-full max-w-lg -translate-x-1/2 bottom-5 left-1/2">
          {orderStatus == 1 && (
            <div>
              <button
                onClick={() => openModalCancel(params.slug)}
                className="inline-flex items-center bg-red-600 hover:bg-red-700 text-white rounded-full py-4 px-6 text-lg font-DB_Med me-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                ยกเลิกคำสั่งซื้อ
              </button>
              <button
                onClick={handleChangeStatus}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-4 px-8 text-lg font-DB_Med"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                รับออเดอร์
              </button>
            </div>
          )}
          {orderStatus == 2 && (
            <div>
              <button
                onClick={handleChangeStatus}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-4 px-8 text-lg font-DB_Med"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                จัดทำอาหารเสร็จสิ้น
              </button>
            </div>
          )}
          {orderStatus == 3 && (
            <div>
              <button
                onClick={handleChangeStatus}
                className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-4 px-8 text-lg font-DB_Med"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 mr-2"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6v.75H5.513c-.96 0-1.764.724-1.865 1.679l-1.263 12A1.875 1.875 0 0 0 4.25 22.5h15.5a1.875 1.875 0 0 0 1.865-2.071l-1.263-12a1.875 1.875 0 0 0-1.865-1.679H16.5V6a4.5 4.5 0 1 0-9 0ZM12 3a3 3 0 0 0-3 3v.75h6V6a3 3 0 0 0-3-3Zm-3 8.25a3 3 0 1 0 6 0v-.75a.75.75 0 0 1 1.5 0v.75a4.5 4.5 0 1 1-9 0v-.75a.75.75 0 0 1 1.5 0v.75Z"
                    clipRule="evenodd"
                  />
                </svg>
                ลูกค้ามารับแล้ว
              </button>
            </div>
          )}
        </div>
      </footer>
    </>
  );
}
