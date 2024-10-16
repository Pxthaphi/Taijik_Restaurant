"use client";
import { useState, useEffect } from "react";
import Loading_Order from "./components/loading";
import Link from "next/link";
import Modal_CancelOrder from "./components/modal-cancel";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import ReviewDrawer from "./components/modal-review"; // Assuming the modal is in a components folder
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

interface PageProps {
  params: {
    slug: string;
  };
}

interface OrderProduct {
  OrderP_ID: number;
  Order_ID: string;
  Product_ID: number;
  Product_Name: string;
  Product_Qty: number;
  Product_Size: string;
  Product_Meat: number[];
  Product_Option: number[];
  Product_Noodles: number[];
  Product_Detail: string;
  Promotion_ID: number;
  Total_Price: number;
  Meat_Name?: string;
  Option_Name?: string;
  Noodles_Name?: string;
}

export default function Order_Status({ params }: PageProps) {
  const [loading, setLoading] = useState(true);
  const [statusOrder, setStatusOrder] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([]);
  const [cancelOrderId, setCancelOrderId] = useState<string>("");
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // Add a new state for tracking submission
  const [discount, setDiscount] = useState(0); // New state for discount
  const [totalPrice, setTotalPrice] = useState(0);

  let Status_text = "";
  let Status_detail = "";
  let Status_image = "";
  let Status_bgcolor = "";
  let Status_textcolor = "";

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isSubmitted) {
      setIsSheetOpen(true); // Open the Sheet when the review is successfully submitted
    }
  }, [isSubmitted]);

  useEffect(() => {
    if (!loading && statusOrder === 4) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [loading, statusOrder]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true);

        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("Order_Status, Promotion_ID")
          .eq("Order_ID", params.slug)
          .single();

        if (orderError) throw orderError;

        let promotionData = null;

        // Only query the promotions table if Promotion_ID is not null
        if (orderData.Promotion_ID) {
          const { data: promoData, error: promoError } = await supabase
            .from("promotions")
            .select("*")
            .eq("Promotion_ID", orderData.Promotion_ID)
            .single();

          if (promoError) throw promoError;
          promotionData = promoData;
        }

        const { data: orderProductsData, error: orderProductsError } =
          await supabase
            .from("order_products")
            .select("*")
            .eq("Order_ID", params.slug);

        if (orderProductsError) throw orderProductsError;

        // Continue processing order products and related data (meats, options, noodles)...
        const productIds = orderProductsData.map(
          (product) => product.Product_ID
        );
        const meatIDs = orderProductsData.flatMap(
          (item) => item.Product_Meat || []
        );
        const optionIDs = orderProductsData.flatMap(
          (item) => item.Product_Option || []
        );
        const noodleIDs = orderProductsData.flatMap(
          (item) => item.Product_Noodles || []
        );

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select("Product_ID, Product_Name")
          .in("Product_ID", productIds);

        if (productsError) throw productsError;

        const { data: meatsData, error: meatsError } = await supabase
          .from("product_meat")
          .select("*")
          .in("Meat_ID", meatIDs);

        if (meatsError) throw meatsError;

        const { data: optionsData, error: optionsError } = await supabase
          .from("product_option")
          .select("*")
          .in("Option_ID", optionIDs);

        if (optionsError) throw optionsError;

        const { data: noodlesData, error: noodlesError } = await supabase
          .from("noodles_type")
          .select("*")
          .in("Noodles_ID", noodleIDs);

        if (noodlesError) throw noodlesError;

        const enhancedOrderProducts = orderProductsData.map((product) => {
          const productInfo = productsData.find(
            (p) => p.Product_ID === product.Product_ID
          );

          const meatData = (product.Product_Meat || [])
            .map((meatId: number) => {
              const meat = meatsData.find((meat) => meat.Meat_ID === meatId);
              return meat?.Meat_Name || "";
            })
            .join(", ");

          const optionNames = (product.Product_Option || [])
            .map((optionId: number) => {
              const option = optionsData.find(
                (option) => option.Option_ID === optionId
              );
              return option?.Option_Name || "";
            })
            .join(", ");

          const noodleNames = (product.Product_Noodles || [])
            .map((noodleId: number) => {
              const noodle = noodlesData.find(
                (noodle) => noodle.Noodles_ID === noodleId
              );
              return noodle?.Noodles_Name || "";
            })
            .join(", ");

          return {
            ...product,
            Product_Name: productInfo?.Product_Name || "",
            Meat_Name: meatData,
            Option_Name: optionNames,
            Noodles_Name: noodleNames,
          };
        });

        setOrderProducts(enhancedOrderProducts);

        const calculatedTotalPrice = orderProductsData.reduce(
          (acc, product) => acc + product.Total_Price,
          0
        );
        setTotalPrice(calculatedTotalPrice);

        // Assuming you want to calculate discount based on promotionData
        setDiscount(promotionData?.Promotion_Discount || 0);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching order details:", error);
        setLoading(false);
      }
    };

    fetchOrderDetails();

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Change received!", payload);
          fetchOrderDetails();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.slug, supabase]);

  useEffect(() => {
    if (statusOrder === 4) {
      // Add delay of 8 seconds (8000 milliseconds)
      const timer = setTimeout(() => {
        setIsReviewModalOpen(true); // Open review modal when order is completed
      }, 2000);

      // Clean up the timer if the component unmounts before the timer finishes
      return () => clearTimeout(timer);
    }
  }, [statusOrder]);

  // Function to open the modal
  const openModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setIsModalOpen(true);
  };

  // // Calculate total price
  // const totalPrice = orderProducts.reduce(
  //   (acc, product) => acc + product.Total_Price,
  //   0
  // );

  if (statusOrder == 1) {
    Status_text = "รอการยืนยันคำสั่งซื้อจากทางร้าน";
    Status_detail = "กำลังรอดำเนินการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/waiting_order.png";
    Status_bgcolor = "bg-blue-200";
    Status_textcolor = "text-green-700";
  } else if (statusOrder == 2) {
    Status_text = "กำลังจัดเตรียมเมนูอาหาร";
    Status_detail = "กำลังรอดำเนินการ อาจจะใช้เวลานานกว่ากำหนดการ......";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/preparing_order.png";
    Status_bgcolor = "bg-orange-400";
    Status_textcolor = "text-green-700";
  } else if (statusOrder == 3) {
    Status_text = "เตรียมเมนูอาหารเสร็จสิ้น";
    Status_detail = "กรุณาเดินทางเข้ามารับเมนูอาหารของท่าน";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_prepare.png";
    Status_bgcolor = "bg-green-600";
    Status_textcolor = "text-green-700";
  } else if (statusOrder == 4) {
    Status_text = "คำสั่งซื้อเสร็จสิ้น";
    Status_detail = "ขอบคุณที่ใช้บริการร้านอาหารใต้จิกค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/success_order.png";
    Status_bgcolor = "bg-green-600";
    Status_textcolor = "text-green-700";
  } else if (statusOrder == 5) {
    Status_text = "ยกเลิกคำสั่งซื้อ";
    Status_detail = "ทางร้านขออภัยหากเกิดมีข้อผิดพลาดประการใด";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
    Status_bgcolor = "bg-red-600";
    Status_textcolor = "text-red-700";
  } else {
    Status_text = "เกิดข้อผิดพลาดในการสั่งอาหาร";
    Status_detail = "กรุณาลองสั่งอาหารใหม่อีกครั้งค่ะ";
    Status_image =
      "https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png";
    Status_bgcolor = "bg-orange-600";
    Status_textcolor = "text-orange-600";
  }

  if (loading) {
    return <Loading_Order />;
  }

  return (
    <>
      <header className="relative flex items-center justify-center max-w-screen overflow-hidden">
        <div className="max-w-md w-full py-36 shadow-md rounded-b-3xl overflow-hidden relative z-0">
          <div className={`absolute inset-0 ${Status_bgcolor}`}></div>
          <img
            className="absolute inset-0 w-full h-full object-cover opacity-80"
            src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/bg_order.png?t=2024-05-09T14%3A00%3A24.685Z"
            alt="Promotion background"
          />
        </div>
        <div className="absolute inset-0 left-5 mt-64 pt-6 flex items-center justify-center animate-wiggle animate-infinite animate-duration-[1500ms]">
          <img
            src={Status_image}
            alt={Status_text}
            className="h-38 transform -translate-y-1/2 "
          />
        </div>

        <div className="">
          <div className="absolute top-8 right-0 mr-6 h-full">
            {statusOrder == 1 && (
              <button
                className="inline-block bg-red-500 hover:bg-red-600 py-1.5 px-2.5 rounded-full"
                onClick={() => openModal(orderProducts[0].Order_ID)}
              >
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z"
                      clipRule="evenodd"
                    />
                  </svg>

                  <p className="text-sm font-DB_Med text-white ml-1">
                    ยกเลิกออเดอร์
                  </p>
                </div>
              </button>
            )}
          </div>
          <div className="absolute top-6 left-0 mx-6 h-full">
            <Link href="../../../">
              <div className="bg-white px-2 py-2 rounded-full">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="mb-10">
        <section className="mx-6 mt-6">
          <h1 className={`text-2xl font-DB_Med ${Status_textcolor}`}>
            {Status_text}
          </h1>
          <p className="text-base font-DB_v4 text-gray-800 mt-2">
            {Status_detail}
          </p>

          <div className="flex justify-between items-center mt-2">
            <p className="text-base font-DB_v4 text-gray-600">
              เลขคำสั่งซื้อ {params.slug}
            </p>
            <a
              href="tel:+66800498858"
              className="flex items-center justify-start bg-green-100 rounded-full p-1 w-fit"
            >
              <div className="flex items-center bg-green-600 rounded-full p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1.2em"
                  height="1.2em"
                  viewBox="0 0 24 24"
                  className="w-4 h-4 text-white pt-0.5"
                >
                  <path
                    fill="currentColor"
                    d="m16.556 12.906l-.455.453s-1.083 1.076-4.038-1.862s-1.872-4.014-1.872-4.014l.286-.286c.707-.702.774-1.83.157-2.654L9.374 2.86C8.61 1.84 7.135 1.705 6.26 2.575l-1.57 1.56c-.433.432-.723.99-.688 1.61c.09 1.587.808 5 4.812 8.982c4.247 4.222 8.232 4.39 9.861 4.238c.516-.048.964-.31 1.325-.67l1.42-1.412c.96-.953.69-2.588-.538-3.255l-1.91-1.039c-.806-.437-1.787-.309-2.417.317"
                  ></path>
                </svg>
              </div>
              <p className="text-[15px] font-DB_Med text-green-600 ml-1 mr-2">
                ติดต่อร้านอาหาร
              </p>
            </a>
          </div>
          <hr className="h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-5"></hr>
        </section>
        {orderProducts.map((product) => (
          <section key={product.OrderP_ID} className="mx-6 mt-6 my-3">
            <div className="flex justify-between item-center my-4">
              <div className="flex justify-center">
                <div className="bg-gray-200 rounded-xl px-5 py-2 flex items-center me-4">
                  <p className="text-lg text-gray-700 font-DB_v4">
                    {product.Product_Qty}
                  </p>
                </div>
                <div className="-my-0.5">
                  <h3 className="flex flex-wrap text-lg font-DB_v4 text-gray-700 items-center space-x-1">
                    <span>{product.Product_Name}</span>
                    {product.Noodles_Name && (
                      <span>{product.Noodles_Name}</span>
                    )}
                    {product.Meat_Name && <span>({product.Meat_Name})</span>}
                    {product.Product_Size && (
                      <span>{product.Product_Size}</span>
                    )}
                  </h3>

                  {product.Option_Name && (
                    <p className="text-base font-DB_v4 text-gray-500">
                      เพิ่มเติม : {product.Option_Name}
                    </p>
                  )}

                  {product.Product_Detail != "" && (
                    <p className="text-base font-DB_v4 text-gray-500">
                      เพิ่มเติม : {product.Product_Detail}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-lg text-green-600 font-DB_Med mt-2.5">
                ฿{product.Total_Price}
              </p>
            </div>
          </section>
        ))}
        <hr className="mx-6 h-px my-2 bg-gray-100 border-0 pt-1 rounded-full mt-6"></hr>

        <section className="mx-6 mt-5">
          <div className="flex justify-between mt-5 my-5">
            <div className="text-xl text-gray-800 font-DB_Med">ส่วนลด</div>
            <div className="text-xl text-red-600 font-DB_Med">-฿{discount}</div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-xl text-green-600 font-DB_Med">
              ฿{totalPrice - discount}
            </div>
          </div>
        </section>
        {/* Modal */}
        {isModalOpen && (
          <Modal_CancelOrder
            setIsModalOpen={setIsModalOpen}
            orderId={cancelOrderId}
          />
        )}
        {isReviewModalOpen && (
          <ReviewDrawer
            orderId={params.slug}
            orderProducts={orderProducts} // Assuming you have a list of products in the order
            setIsModalOpen={setIsReviewModalOpen}
            setIsSubmitted={setIsSubmitted} // Add a prop to toggle submission
          />
        )}

        {isSheetOpen && (
          <Drawer open={isSheetOpen} onClose={() => setIsSheetOpen(false)}>
            <DrawerContent>
              <div className="mx-auto w-full max-w-lg my-5">
                <DrawerHeader>
                  {/* Add image at the top */}
                  <div className="w-[10rem] h-[10rem] bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <img
                      src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/failed_order.png"
                      alt="Confirmation"
                      className="w-[8.5rem] h-auto"
                    />
                  </div>
                  <DrawerTitle className="font-DB_v4 text-2xl text-gray-800">
                    ขอบคุณสำหรับความคิดเห็นของคุณ!!
                  </DrawerTitle>
                  <DrawerDescription className="font-DB_v4 text-lg text-gray-800 mt-5">
                    ทางร้านต้องขออภัยหากเกิดมีข้อผิดพลาดประการใด
                    ขอบคุณที่ใช้บริการร้านอาหารใต้จิกค่ะ
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex justify-center mt-5 gap-5">
                  <button
                    className="bg-green-600 text-white font-DB_Med text-lg py-2 px-[10rem] rounded-xl hover:bg-green-700"
                    onClick={() => setIsSheetOpen(false)} // Close the drawer
                  >
                    เข้าใจแล้ว
                  </button>
                </div>
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </main>
      <footer className="flex justify-center fixed bottom-0 inset-x-0 mb-8">
        {statusOrder == 3 && (
          <div className="flex justify-between item-center">
            <Link
              href={`Ticket/${params.slug}`}
              className="inline-flex items-center mr-4 bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-8 text-lg font-DB_Med"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-7 h-7 mr-2"
              >
                <path
                  fill="currentColor"
                  d="M4 4h6v6H4zm16 0v6h-6V4zm-6 11h2v-2h-2v-2h2v2h2v-2h2v2h-2v2h2v3h-2v2h-2v-2h-3v2h-2v-4h3zm2 0v3h2v-3zM4 20v-6h6v6zM6 6v2h2V6zm10 0v2h2V6zM6 16v2h2v-2zm-2-5h2v2H4zm5 0h4v4h-2v-2H9zm2-5h2v4h-2zM2 2v4H0V2a2 2 0 0 1 2-2h4v2zm20-2a2 2 0 0 1 2 2v4h-2V2h-4V0zM2 18v4h4v2H2a2 2 0 0 1-2-2v-4zm20 4v-4h2v4a2 2 0 0 1-2 2h-4v-2z"
                ></path>
              </svg>
              แสกน QR เพื่อรับอาหาร
            </Link>
          </div>
        )}
        {statusOrder == 4 && (
          <div className="flex justify-between item-center">
            <Link
              href="../../product"
              className="inline-flex items-center mr-4 bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-8 text-lg font-DB_Med"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-7 h-7 mr-1"
              >
                <path
                  fill="currentColor"
                  d="M13.26 3C8.17 2.86 4 6.95 4 12H2.21c-.45 0-.67.54-.35.85l2.79 2.8c.2.2.51.2.71 0l2.79-2.8a.5.5 0 0 0-.36-.85H6c0-3.9 3.18-7.05 7.1-7c3.72.05 6.85 3.18 6.9 6.9c.05 3.91-3.1 7.1-7 7.1c-1.61 0-3.1-.55-4.28-1.48a.994.994 0 0 0-1.32.08c-.42.42-.39 1.13.08 1.49A8.858 8.858 0 0 0 13 21c5.05 0 9.14-4.17 9-9.26c-.13-4.69-4.05-8.61-8.74-8.74m-.51 5c-.41 0-.75.34-.75.75v3.68c0 .35.19.68.49.86l3.12 1.85c.36.21.82.09 1.03-.26c.21-.36.09-.82-.26-1.03l-2.88-1.71v-3.4c0-.4-.34-.74-.75-.74"
                ></path>
              </svg>
              สั่งอีกครั้ง
            </Link>
            <Link
              href="../../history"
              className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-6 text-lg font-DB_Med"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="1em"
                height="1em"
                viewBox="0 0 24 24"
                className="w-6 h-6 mr-1"
              >
                <path
                  fill="currentColor"
                  d="M3 22V3h18v19l-3-2l-3 2l-3-2l-3 2l-3-2zM17 9V7h-2v2zm-4 0V7H7v2zm0 2H7v2h6zm2 2h2v-2h-2z"
                ></path>
              </svg>
              ประวัติคำสั่งซื้อ
            </Link>
          </div>
        )}

        {(statusOrder > 4 || statusOrder === 0) && (
          <Link
            href="../../product"
            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-full py-3 px-12 text-lg font-DB_Med"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 21 21"
              className="w-6 h-6 mr-2"
            >
              <g
                fill="none"
                fillRule="evenodd"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3.578 6.487A8 8 0 1 1 2.5 10.5"></path>
                <path d="M7.5 6.5h-4v-4"></path>
              </g>
            </svg>
            สั่งอาหารอีกครั้ง
          </Link>
        )}
      </footer>
    </>
  );
}
