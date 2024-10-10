"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Dayjs } from "dayjs";
import PickerWithButtonField from "./components/timepicker";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import { getUserID } from "@/app/auth/getUserID";
import Swal from "sweetalert2";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"; // Adjust the path if necessary
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

// Extend dayjs with plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
dayjs.extend(timezone);
dayjs.extend(utc);

interface Time {
  ResTime_On: Time;
  ResTime_Off: Time;
}

interface Product {
  Product_ID: string;
  Product_Name: string;
  Product_Size: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string;
}

interface CartItem {
  User_ID: string;
  Product_ID: string;
  Product_Qty: number;
  Product_Size: string;
  Product_Meat: string[];
  Product_Option: string[];
  Product_Noodles: string[];
  Product_Detail: string;
  Total_Price: number;
}

interface Meat {
  Meat_ID: string;
  Meat_Name: string;
}

interface FoodOption {
  Option_ID: string;
  Option_Name: string;
}

interface ProductType {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

interface MergedProduct extends CartItem {
  Product_Name: string;
  Product_Image: string;
  Meat_Name: string[];
  Option_Names: string[];
  Noodles_Name: string[];
}

// Define the structure of a Promotion
interface Promotion {
  Promotion_ID: number;
  Promotion_Name: string;
  Promotion_Detail: string;
  Promotion_Discount: number;
  Promotion_Timestart: string;
  Promotion_Timestop: string;
  Promotion_Status: number;
  Promotion_Images: string;
}

export default function Order_Product() {
  const router = useRouter();
  const [quantityMap, setQuantityMap] = useState<{
    [productId: string]: number;
  }>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState<string>("");
  const [optionOrder, setOptionOrder] = useState<string>("");
  const [orderDetail, setOrderDetail] = useState<string>("");
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [producttype, setProductType] = useState<ProductType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [orderIDCounter, setOrderIDCounter] = useState<number>(1); // State for Order_ID counter
  const promotionID = 1; // replace with actual logic to get

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState("");
  const [promotions, setPromotions] = useState<Promotion[]>([]); // Type promotions state as an array of Promotion objects
  const [availableCoupons, setAvailableCoupons] = useState(0);

  const fetchRestaurantTimes = async () => {
    try {
      const { data, error } = await supabase
        .from("time")
        .select("ResTime_On, ResTime_Off")
        .single();

      if (error) {
        console.error("Error fetching restaurant times:", error);
        return;
      }

      if (data) {
        const currentTime = dayjs.utc(); // เวลาปัจจุบันใน UTC

        // เวลาเปิดและปิดร้านที่ได้จากฐานข้อมูล
        const timeOpenFromDB = data.ResTime_On.replace("+00", ""); // ลบ +00 ออก
        const timeCloseFromDB = data.ResTime_Off.replace("+00", ""); // ลบ +00 ออก

        // สร้างเวลาเปิดและปิดใหม่โดยใช้ชั่วโมงและนาทีเท่านั้น
        const timeOpen = dayjs
          .utc(`${currentTime.format("YYYY-MM-DD")}T${timeOpenFromDB}Z`)
          .set("year", 2000)
          .set("month", 0)
          .set("date", 1);
        let timeClose = dayjs
          .utc(`${currentTime.format("YYYY-MM-DD")}T${timeCloseFromDB}Z`)
          .set("year", 2000)
          .set("month", 0)
          .set("date", 1);

        // แปลงเวลาปัจจุบันให้เหลือแค่ชั่วโมงและนาที
        const currentTimeFixed = currentTime
          .set("year", 2000)
          .set("month", 0)
          .set("date", 1);

        // กรณีที่เวลาปิดข้ามวัน
        let isOpen;
        if (timeClose.isBefore(timeOpen)) {
          // ถ้าเวลาปิดน้อยกว่าเวลาเปิด แปลว่าข้ามวัน
          isOpen =
            currentTimeFixed.isSameOrAfter(timeOpen) ||
            currentTimeFixed.isBefore(timeClose);
        } else {
          // กรณีที่ไม่ข้ามวัน
          isOpen =
            currentTimeFixed.isSameOrAfter(timeOpen) &&
            currentTimeFixed.isSameOrBefore(timeClose);
        }

        console.log("Current Time (UTC):", currentTimeFixed.format("HH:mm")); // แสดงเวลาปัจจุบันในรูปแบบ HH:mm
        console.log("Time Open (UTC):", timeOpen.format("HH:mm")); // แสดงเวลาเปิดร้าน
        console.log("Time Close (UTC):", timeClose.format("HH:mm")); // แสดงเวลาปิดร้าน
        console.log("Is Open:", isOpen);

        if (!isOpen) {
          Swal.fire({
            icon: "info",
            title: "ร้านปิดอยู่",
            text: "ขณะนี้ร้านไม่ได้เปิดให้บริการ กรุณากลับมาสั่งใหม่ในช่วงเวลาร้านเปิดอีกครั้ง",
            timer: 3000,
            showConfirmButton: false,
          }).then(() => {
            setTimeout(() => {
              router.push("../../");
            }, 3000); // Navigate after 2 seconds
          });
        }
      }
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  useEffect(() => {
    fetchRestaurantTimes();
  }, []);

  useEffect(() => {
    const fetchLastOrderID = async () => {
      try {
        const { data: lastOrder, error } = await supabase
          .from("orders")
          .select("Order_ID")
          .order("Order_ID", { ascending: false })
          .limit(1);

        if (error) throw error;

        if (lastOrder && lastOrder.length > 0) {
          const lastOrderID = parseInt(
            lastOrder[0]?.Order_ID?.split("-")[1] || "0"
          );
          setOrderIDCounter(lastOrderID + 1);
        }
      } catch (error) {
        console.error("Error fetching last Order_ID: ", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error fetching last Order_ID",
        });
      }
    };

    fetchLastOrderID();
  }, []);

  // Generate Order_ID with leading zeros
  const Order_ID = `TK-${orderIDCounter.toString().padStart(8, "0")}`;

  async function fetchType() {
    try {
      const { data, error } = await supabase.from("product_type").select("*");

      if (error) throw error;

      setProductType(data as ProductType[]);
      console.table(data);
    } catch (error) {
      setError((error as PostgrestError).message);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: (error as PostgrestError).message,
      });
    }
  }

  useEffect(() => {
    const fetchProductsFromCart = async () => {
      try {
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select(
            "User_ID, Product_ID, Product_Qty, Product_Size, Product_Meat, Product_Option, Product_Detail, Total_Price, Product_Noodles"
          )
          .eq("User_ID", getUserID());

        if (cartError) throw cartError;

        if (cartData.length === 0) {
          router.push("../product");
          return;
        }

        const initialQuantityMap: { [productId: string]: number } = {};
        cartData.forEach((item) => {
          initialQuantityMap[item.Product_ID] = item.Product_Qty;
        });
        setQuantityMap(initialQuantityMap);

        const productIDs = cartData.map((item) => item.Product_ID);
        const meatIDs = cartData.flatMap((item) => item.Product_Meat || []);
        const optionIDs = cartData.flatMap((item) => item.Product_Option || []);
        const noodleIDs = cartData.flatMap(
          (item) => item.Product_Noodles || []
        );

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("Product_ID, Product_Name, Product_Image")
          .in("Product_ID", productIDs);

        if (productsError) throw productsError;

        const { data: meatsData, error: meatsError } = await supabase
          .from("product_meat")
          .select("*")
          .in("Meat_ID", meatIDs)
          .order("Meat_ID");

        if (meatsError) throw meatsError;

        const { data: optionsData, error: optionsError } = await supabase
          .from("product_option")
          .select("*")
          .in("Option_ID", optionIDs)
          .order("Option_ID");

        if (optionsError) throw optionsError;

        const { data: noodlesData, error: noodlesError } = await supabase
          .from("noodles_type")
          .select("*")
          .in("Noodles_ID", noodleIDs)
          .order("Noodles_ID");

        if (noodlesError) throw noodlesError;

        const mergedProducts = cartData.map((cartItem) => {
          const productData = productsData.find(
            (product) => product.Product_ID === cartItem.Product_ID
          );

          const meatData = (cartItem.Product_Meat || [])
            .map((meatId: string) => {
              const meat = meatsData.find((meat) => meat.Meat_ID === meatId);
              return meat?.Meat_Name || "";
            })
            .join(", ");

          const optionNames = (cartItem.Product_Option || [])
            .map((optionId: string) => {
              const option = optionsData.find(
                (option) => option.Option_ID === optionId
              );
              return option?.Option_Name || "";
            })
            .join(", ");

          const noodleName = (cartItem.Product_Noodles || [])
            .map((noodlesId: string) => {
              const noodles = noodlesData.find(
                (noodles) => noodles.Noodles_ID === noodlesId
              );
              return noodles?.Noodles_Name || "";
            })
            .join(", ");

          return {
            ...cartItem,
            Product_Name: productData?.Product_Name || "",
            Product_Image: productData?.Product_Image || "",
            Meat_Name: meatData,
            Option_Names: optionNames,
            Noodles_Name: noodleName,
          };
        });

        setProducts(mergedProducts as MergedProduct[]);
      } catch (error) {
        setError((error as Error).message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: (error as Error).message,
        });
      }
    };

    fetchProductsFromCart();
    fetchType();

    const channel = supabase
      .channel("realtime-cart")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart" },
        (payload) => {
          fetchProductsFromCart();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  useEffect(() => {
    const fetchPromotions = async () => {
      const { data, error } = await supabase
        .from("promotions")
        .select(
          "Promotion_ID, Promotion_Name, Promotion_Detail, Promotion_Discount, Promotion_Timestart, Promotion_Timestop, Promotion_Status, Promotion_Images"
        );

      if (error) {
        console.error("Error fetching promotions:", error);
      } else {
        setPromotions(data);
      }
    };

    fetchPromotions();
  }, []);

  const applyPromotion = () => {
    const promo = promotions.find(
      (promotion) => promotion.Promotion_Name === selectedPromo
    );
    if (promo) {
      Swal.fire({
        icon: "success",
        title: "ใช้งานส่วนลดสำเร็จ",
        text: `คุณได้เลือกใช้ส่วนลด : ${promo.Promotion_Name} ซึ่งได้ส่วนลด ${promo.Promotion_Discount} บาท.`,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#31A728FF",
      });
      setIsOpen(false); // Close the promotion dialog
    } else {
      Swal.fire({
        icon: "error",
        title: "ข้อผิดพลาด",
        text: "ส่วนลดที่เลือกไม่ถูกต้อง.",
      });
    }
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    if (newValue) {
      setSelectedTimeDisplay(newValue.format("HH:mm"));
      console.log("Selected time:", newValue.format("HH:mm"));
    }
  };

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
  };

  const incrementQuantity = async (productId: string) => {
    const updatedQuantity = (quantityMap[productId] || 0) + 1;
    setQuantityMap((prev) => ({
      ...prev,
      [productId]: updatedQuantity,
    }));

    try {
      const { data, error } = await supabase
        .from("cart")
        .update({ Product_Qty: updatedQuantity })
        .eq("User_ID", getUserID())
        .eq("Product_ID", productId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error updating product quantity: ", error);
    }
  };

  const decrementQuantity = async (productId: string) => {
    const updatedQuantity = Math.max((quantityMap[productId] || 0) - 1, 0);
    setQuantityMap((prev) => ({
      ...prev,
      [productId]: updatedQuantity,
    }));

    try {
      if (updatedQuantity === 0) {
        const { data, error } = await supabase
          .from("cart")
          .delete()
          .eq("User_ID", getUserID())
          .eq("Product_ID", productId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("cart")
          .update({ Product_Qty: updatedQuantity })
          .eq("User_ID", getUserID())
          .eq("Product_ID", productId);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error("Error updating/deleting product: ", error);
    }
  };

  const calculateTotalPrice = () => {
    let totalPrice = 0;
    products.forEach((product) => {
      const quantity = quantityMap[product.Product_ID] || 0;
      totalPrice += product.Total_Price * quantity;
    });

    if (selectedPromo) {
      const promo = promotions.find(
        (promotion) => promotion.Promotion_Name === selectedPromo
      );
      if (promo) {
        totalPrice -= promo.Promotion_Discount;
      }
    }

    return totalPrice < 0 ? 0 : totalPrice;
  };

  const calculateDiscount = () => {
    // คำนวณส่วนลดจากโปรโมชั่นที่เลือก
    // ตัวอย่างการคำนวณ
    const selectedPromotion = promotions.find(
      (promo) => promo.Promotion_Name === selectedPromo
    );
    return selectedPromotion ? selectedPromotion.Promotion_Discount : 0;
  };

  const handleOrderClick = () => {
    setIsSheetOpen(true); // Open the confirmation sheet
  };

  const confirmOrder = () => {
    insetOrder(); // Call the function to insert the order
    setIsSheetOpen(false); // Close the sheet after confirming
  };

  const insetOrder = async () => {
    // ตรวจสอบข้อมูลที่จำเป็น
    if (!selectedOption || !selectedTimeDisplay) {
      Swal.fire({
        icon: "error",
        title: "ผิดพลาด",
        text: "กรุณาเลือกเวลาที่จะมารับ หรือ กินที่ร้านก่อน",
      });
      return;
    }

    // Get current timestamp
    const now = new Date().toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
    });

    try {
      const totalPrice = calculateTotalPrice();
      // Insert into orders table
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            Order_ID: Order_ID,
            User_ID: getUserID(),
            Order_Datetime: now,
            Receive_Time: selectedTimeDisplay,
            Order_Status: 1,
            Order_Detail: "",
            Promotion_ID: selectedPromo ? parseInt(selectedPromo) : null,
            Order_Option: optionOrder,
          },
        ])
        .single();

      if (orderError) {
        console.error("Error adding product to Order:", orderError.message);
        return;
      }

      // Prepare data for order_products
      const orderProductsData = products.map((product) => ({
        Order_ID: Order_ID,
        Product_ID: product.Product_ID,
        Product_Qty: quantityMap[product.Product_ID] || 0,
        Product_Size: product.Product_Size || "",
        Product_Meat: product.Product_Meat?.length
          ? product.Product_Meat
          : "{}", // Handle array properly
        Product_Option: product.Product_Option?.length
          ? product.Product_Option
          : "{}",
        Product_Noodles: product.Product_Noodles?.length
          ? product.Product_Noodles
          : "{}",
        Product_Detail: product.Product_Detail || "",
        Total_Price: totalPrice || 0,
      }));

      // Insert into order_products table
      const { data: orderProductsInsertData, error: orderProductsInsertError } =
        await supabase.from("order_products").insert(orderProductsData);

      if (orderProductsInsertError) {
        console.error(
          "Error adding products to Order Products:",
          orderProductsInsertError.message
        );
        return;
      }

      // Prepare data for queue table
      const queueData = {
        Order_ID: Order_ID,
        Queue_Time: now, // Assuming this is the time when the order is queued
      };

      // Insert into queue table
      const { data: queueInsertData, error: queueInsertError } = await supabase
        .from("queue")
        .insert(queueData)
        .single();

      if (queueInsertError) {
        console.error("Error adding order to Queue:", queueInsertError.message);
        return;
      }

      // Delete from cart table
      const { data: cartDeleteData, error: cartDeleteError } = await supabase
        .from("cart")
        .delete()
        .eq("User_ID", getUserID());

      if (cartDeleteError) {
        console.error("Error deleting cart items:", cartDeleteError.message);
        return;
      }

      console.log("Product added to Order successfully:", orderData);

      setOrderIDCounter((prevCounter) => prevCounter + 1);

      Swal.fire({
        icon: "success",
        title: "การสั่งซื้อสำเร็จ",
        text: "คุณสั่งซื้อสินค้าเรียบร้อยแล้ว",
        showConfirmButton: false,
        timer: 2000,
      }).then(() => {
        setTimeout(() => {
          router.push(`product/order_product/${Order_ID}`);
        }, 3000); // Navigate after 2 seconds
      });

      // Send Flex Message
      sendOrderNotification();
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  const sendOrderNotification = async () => {
    const userId = getUserID();

    if (!userId) {
      console.error("User ID is not available");
      return;
    }

    // สร้างรายการอาหาร
    const orderItems = products.map((product) => {
      const quantity = quantityMap[product.Product_ID] || 1; // ค่าเริ่มต้นเป็น 1 ถ้าจำนวนไม่ระบุ
      const meatText = product.Meat_Name ? ` (${product.Meat_Name})` : "";
      const optionsText = product.Option_Names
        ? ` (เพิ่ม ${product.Option_Names})`
        : "";
      const noodlesText = product.Noodles_Name
        ? ` (เส้น: ${product.Noodles_Name.join(", ")})`
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
        altText: `ร้านอาหารใต้จิก : คำสั่งซื้อ [${Order_ID}] | สถานะคำสั่งซื้อ รอการยืนยันจากทางร้าน`,
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
                    weight: "bold",
                  },
                  {
                    type: "text",
                    text: `${Order_ID}`, // ตรวจสอบว่า Order_ID มีค่าก่อนใช้
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
                  uri: `https://liff.line.me/2004539512-7wZyNkj0/customer/pages/product/order_product/${Order_ID}`,
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

  useEffect(() => {
    if (selectedOption == "options1") {
      setOptionOrder("กินที่ร้าน");
    } else {
      setOptionOrder("ใส่กล่องกลับบ้าน");
    }
    console.log("ตัวเลือก : ", selectedOption);
    console.log("ตัวเลือกการสั่ง : ", optionOrder);
  }, [selectedOption, optionOrder]);

  const goBack = () => router.push("../product");

  return (
    <>
      <main className="">
        <header className="mx-8 mt-8 flex justify-center item-center">
          <div className="absolute py-1 px-1 top-8 left-8" onClick={goBack}>
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
          <div className="font-DB_Med text-2xl pt-0.5">สรุปคำสั่งซื้อ</div>
        </header>

        <section className="flex justify-center items-center pt-2 mt-5">
          <div className="flex">
            <div className="flex bg-gray-100 hover:bg-gray-200 rounded-full transition p-1">
              <nav className="flex space-x-1" aria-label="Tabs" role="tablist">
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-full hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options1" ? "active" : ""
                  }`}
                  id="segment-item-1"
                  data-hs-tab="#segment-1"
                  aria-controls="segment-1"
                  role="tab"
                  onClick={() => handleOptionSelect("options1")}
                >
                  <p className="text-base font-DB_v4">กินที่ร้าน</p>
                  {selectedOption === "options1" && (
                    <PickerWithButtonField onChange={handleTimeChange} />
                  )}
                </button>
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-full hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options2" ? "active" : ""
                  }`}
                  id="segment-item-2"
                  data-hs-tab="#segment-2"
                  aria-controls="segment-2"
                  role="tab"
                  onClick={() => handleOptionSelect("options2")}
                >
                  <p className="text-base font-DB_v4">ใส่กล่องกลับบ้าน</p>
                  {selectedOption === "options2" && (
                    <PickerWithButtonField onChange={handleTimeChange} />
                  )}
                </button>
              </nav>
            </div>
          </div>
        </section>

        {products.map((product) => (
          <section key={product.Product_ID} className="mt-6 mx-8">
            <div className="max-w-full my-2">
              <div className="rounded-2xl flex items-center">
                <div className="w-1/3 ms-2">
                  <img
                    className="w-[9rem] h-[7rem] object-cover rounded-xl shadow-lg"
                    src={`${product.Product_Image}?t=${new Date().getTime()}`}
                    alt="Product Image"
                  />
                </div>
                <div className="w-1/2 ms-6 pt-1">
                  <h3 className="text-lg font-DB_Med text-gray-700 flex flex-wrap">
                    {product.Product_Name}
                  </h3>
                  <span className="text-sm font-DB_Med flex flex-wrap items-center mt-1 space-x-2">
                    {product.Noodles_Name && <p>{product.Noodles_Name}</p>}
                    {product.Meat_Name && <p>({product.Meat_Name})</p>}
                    {product.Product_Size && <p>{product.Product_Size}</p>}
                  </span>

                  {product.Option_Names && (
                    <p className="text-sm text-gray-500 font-DB_v4 mt-2">
                      ตัวเลือกเพิ่มเติม: {product.Option_Names}
                    </p>
                  )}
                  {product.Product_Detail && (
                    <p className="text-sm text-gray-500 font-DB_v4">
                      รายละเอียดเพิ่มเติม: {product.Product_Detail}
                    </p>
                  )}
                  <div className="flex justify-between mt-4 gap-x-6">
                    <h3 className="text-lg font-DB_Med text-green-600 pt-2">
                      ฿{product.Total_Price}
                    </h3>
                    <div className="ms-12 pt-1">
                      {/* Input Number */}
                      <div className="py-1.5 px-2 inline-block bg-white border border-gray-200 rounded-xl">
                        <div className="flex items-center gap-x-1">
                          <button
                            type="button"
                            onClick={() =>
                              decrementQuantity(product.Product_ID)
                            }
                            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <svg
                              className="flex-shrink-0 size-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14"></path>
                            </svg>
                          </button>
                          <input
                            className="p-0 w-6 bg-transparent border-0 text-gray-800 text-center focus:ring-0"
                            type="text"
                            value={quantityMap[product.Product_ID] || 0}
                            readOnly
                          />
                          <button
                            type="button"
                            onClick={() =>
                              incrementQuantity(product.Product_ID)
                            }
                            disabled={quantityMap[product.Product_ID] >= 99}
                            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                          >
                            <svg
                              className="flex-shrink-0 size-3.5"
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14"></path>
                              <path d="M12 5v14"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                      {/* End Input Number */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        <hr className="mx-8 h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>

        <section className="mx-8 mt-5">
          <div className="flex justify-between">
            <div className="flex justify-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-8 h-8 text-green-600"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="m10.647 18.646l-5.293-5.292a.5.5 0 0 1 0-.708l6.5-6.5A.5.5 0 0 1 12.207 6h3.586l.069.005Q15.929 6 16 6a2 2 0 0 1 1.995 2.139l.005.068v3.586a.5.5 0 0 1-.146.353l-6.5 6.5a.5.5 0 0 1-.707 0M12 9.672a.5.5 0 0 0-1 0v5.656a.5.5 0 1 0 1 0zm-1.914 2.12a1 1 0 1 1-1.415 1.415a1 1 0 0 1 1.415-1.414m4.243 1.415a1 1 0 1 0-1.415-1.414a1 1 0 0 0 1.415 1.414"
                  clipRule="evenodd"
                ></path>
              </svg>
              <div className="text-lg font-DB_Med">คูปอง</div>
            </div>
            <div className="">
              <div className="relative flex items-center justify-between rounded-full shadow-sm">
                <Button
                  onClick={() => setIsOpen(true)}
                  variant={"outline"}
                  className={cn(
                    "rounded-xl px-5 py-3 w-full bg-white border hover:bg-gray-100 text-gray-800 flex justify-between"
                  )}
                >
                  {selectedPromo ? (
                    <span className="text-gray-800 font-DB_Med">
                      {selectedPromo} {/* Display selected coupon name here */}
                    </span>
                  ) : (
                    <span className="text-gray-500 font-DB_Med">ใช้คูปอง</span>
                  )}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5 text-gray-500"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          {/* Modal dialog for selecting coupons */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[24rem] mx-auto px-8 py-6 rounded-xl bg-white shadow-lg">
              <DialogHeader>
                <div className="flex items-center space-x-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1em"
                    height="1em"
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-green-600"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="m10.647 18.646l-5.293-5.292a.5.5 0 0 1 0-.708l6.5-6.5A.5.5 0 0 1 12.207 6h3.586l.069.005Q15.929 6 16 6a2 2 0 0 1 1.995 2.139l.005.068v3.586a.5.5 0 0 1-.146.353l-6.5 6.5a.5.5 0 0 1-.707 0M12 9.672a.5.5 0 0 0-1 0v5.656a.5.5 0 1 0 1 0zm-1.914 2.12a1 1 0 1 1-1.415 1.415a1 1 0 0 1 1.415-1.414m4.243 1.415a1 1 0 1 0-1.415-1.414a1 1 0 0 0 1.415 1.414"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  <DialogTitle className="font-DB_Med text-2xl">
                    รายการโค้ดส่วนลด
                  </DialogTitle>
                </div>
                <DialogDescription className="flex justify-start font-DB_v4 text-lg mx-1 mt-3">
                  เลือกโค้ดส่วนลดได้ตามความต้องการ
                </DialogDescription>
              </DialogHeader>

              {/* Promotion options */}
              <div className="space-y-4">
                {promotions.map((promo) => (
                  <div
                    key={promo.Promotion_ID}
                    className={`p-2 border rounded-xl flex items-center justify-between ${
                      selectedPromo === promo.Promotion_Name
                        ? "border-green-500 bg-green-50"
                        : "border-gray-200"
                    } cursor-pointer`}
                    onClick={() => setSelectedPromo(promo.Promotion_Name)}
                  >
                    <div>
                      <p className="text-lg font-DB_Med">
                        {promo.Promotion_Name}
                      </p>
                      <p className="text-sm font-DB_Med text-gray-500">
                        รายละเอียด : {promo.Promotion_Detail}
                      </p>
                      <p className="text-sm font-DB_Med text-red-600">
                        ส่วนลด: {promo.Promotion_Discount} บาท
                      </p>
                      <p className="text-sm font-DB_Med text-gray-400">
                        หมดอายุวันที่ {promo.Promotion_Timestop}
                      </p>
                    </div>
                    {selectedPromo === promo.Promotion_Name && (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 text-green-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Modal footer */}
              <DialogFooter className="flex justify-between items-center mt-6 space-x-4">
                <Button
                  onClick={applyPromotion}
                  disabled={!selectedPromo}
                  className="bg-green-600 hover:bg-green-700 font-DB_Med text-white text-lg rounded-xl w-full py-6"
                >
                  ใช้โค้ดส่วนลด
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </section>

        <section className="mx-8 mt-5">
          <div className="text-xl text-gray-800 font-DB_Med mt-4">ราคารวม</div>
          {products.map((product) => {
            const quantity = quantityMap[product.Product_ID] || 0;
            const productTotalPrice = product.Total_Price * quantity;

            return (
              <div
                key={product.Product_ID}
                className="flex justify-between mt-3"
              >
                <div className="text-base text-gray-800 font-DB_Med">
                  {product.Product_Name}{" "}
                  <span className="text-sm">({product.Meat_Name})</span>{" "}
                  {product.Option_Names && (
                    <span className="text-sm">
                      (เพิ่ม {product.Option_Names})
                    </span>
                  )}{" "}
                  x {quantity}
                </div>
                <div className="text-base text-gray-800 font-DB_Med">
                  ฿{productTotalPrice}.00
                </div>
              </div>
            );
          })}

          <div className="flex justify-between mt-3">
            <div className="text-base text-gray-800 font-DB_Med">ส่วนลด</div>
            <div className="text-base text-red-600 font-DB_Med">
              -฿{calculateDiscount()}.00
            </div>
          </div>

          <hr className="h-px my-2 bg-gray-100 border-0 mt-3 pt-1 rounded-full" />

          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-2xl text-green-600 font-DB_Med">
              ฿{calculateTotalPrice()}.00
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-16">
        <div className="flex justify-center fixed inset-x-0 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2">
          <button
            onClick={handleOrderClick}
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-12 text-lg font-DB_Med"
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
            สั่งอาหารเลย
          </button>

          {isSheetOpen && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetContent side={"bottom"} className="rounded-2xl px-4">
                <SheetHeader>
                  {/* Add image at the top */}
                  <div className="w-[10rem] h-[10rem] bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img
                      src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/loading_order.png"
                      alt="Confirmation"
                      className="w-[8.5rem] h-auto"
                    />
                  </div>
                  <SheetTitle className="font-DB_v4 text-2xl text-gray-800">
                    ยืนยันการสั่งอาหาร
                  </SheetTitle>
                  <SheetDescription className="font-DB_v4 text-lg text-gray-800 mt-5">
                    คุณแน่ใจหรือว่าต้องการสั่งอาหาร?
                  </SheetDescription>
                </SheetHeader>
                <div className="flex justify-center mt-5 gap-5">
                  <button
                    className="bg-gray-300 text-black font-DB_Med text-lg py-2 px-10 rounded-xl"
                    onClick={() => setIsSheetOpen(false)} // Close without confirming
                  >
                    ยกเลิก
                  </button>
                  <button
                    className="bg-green-600 text-white font-DB_Med text-lg py-2 px-10 rounded-xl"
                    onClick={confirmOrder} // Confirm the order
                  >
                    ยืนยัน
                  </button>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </footer>
    </>
  );
}
