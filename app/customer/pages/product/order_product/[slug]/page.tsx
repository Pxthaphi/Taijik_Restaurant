"use client";
import { useState, useEffect } from "react";
import Loading_Order from "./components/loading";
import Link from "next/link";
import Modal_CancelOrder from "./components/modal-cancel";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";

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
  Product_Meat: number;
  Product_Option: number;
  Product_Noodles: number;
  Product_Detail: string;
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
      setLoading(true);

      // Fetch order details including status
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("Order_Status")
        .eq("Order_ID", params.slug)
        .single();

      if (orderError) {
        console.error(orderError);
        setLoading(false);
        return;
      }

      setStatusOrder(orderData.Order_Status);

      // Fetch order products details
      const { data: orderProductsData, error: orderProductsError } =
        await supabase
          .from("order_products")
          .select("*")
          .eq("Order_ID", params.slug);

      if (orderProductsError) {
        console.error(orderProductsError);
        setLoading(false);
        return;
      }

      const productIds = orderProductsData.map((product) => product.Product_ID);
      const meatIds = orderProductsData.flatMap(
        (product) => product.Product_Meat || []
      );
      const optionIds = orderProductsData.flatMap(
        (product) => product.Product_Option || []
      ); // flatten option IDs array
      const noodleIDs = orderProductsData.flatMap(
        (product) => product.Product_Noodles || []
      );

      // Fetch product names
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("Product_ID", productIds);

      if (productsError) {
        console.error(productsError);
        setLoading(false);
        return;
      }

      // Fetch meat names
      const { data: meatData, error: meatError } = await supabase
        .from("product_meat")
        .select("*")
        .in("Meat_ID", meatIds);

      if (meatError) {
        console.error(meatError);
        setLoading(false);
        return;
      }

      // Fetch option names
      const { data: optionData, error: optionError } = await supabase
        .from("product_option")
        .select("*")
        .in("Option_ID", optionIds);

      if (optionError) {
        console.error(optionError);
        setLoading(false);
        return;
      }

      // Fetch option names
      const { data: noodlesData, error: noodlesError } = await supabase
        .from("noodles_type")
        .select("*")
        .in("Noodles_ID", noodleIDs);

      if (noodlesError) {
        console.error(noodlesError);
        setLoading(false);
        return;
      }

      // Map product names and details to order products
      const enhancedOrderProducts = orderProductsData.map((product) => {
        const productInfo = productsData.find(
          (p) => p.Product_ID === product.Product_ID
        );

        // ปรับให้ `Product_Meat` เป็น array
        const meats = product.Product_Meat.map((meatId: number) => {
          const meat = meatData.find((m) => m.Meat_ID === meatId);
          return meat ? meat.Meat_Name : "Unknown Meat";
        });

        const options = product.Product_Option.map((optionId: number) => {
          const option = optionData.find((o) => o.Option_ID === optionId);
          return option ? option.Option_Name : "Unknown Option";
        });

        const noodles = product.Product_Noodles.map((noodlesId: number) => {
          const noodle = noodlesData.find((n) => n.Noodles_ID === noodlesId);
          return noodle ? noodle.Noodles_Name : "Unknown Option";
        });

        return {
          ...product,
          Product_Name: productInfo
            ? productInfo.Product_Name
            : "Unknown Product",
          Meat_Name: meats.join(", "), // รวมชื่อเนื้อที่พบเป็น comma-separated string
          Option_Name: options.join(", "), // รวมตัวเลือกที่พบเป็น comma-separated string
          Noodles_Name: noodles.join(", "), // รวมตัวเลือกที่พบเป็น comma-separated string
        };
      });

      setOrderProducts(enhancedOrderProducts);
      setLoading(false);
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

  // Function to open the modal
  const openModal = (orderId: string) => {
    setCancelOrderId(orderId);
    setIsModalOpen(true);
  };

  // Calculate total price
  const totalPrice = orderProducts.reduce(
    (acc, product) => acc + product.Total_Price,
    0
  );

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

      <main>
        <section className="mx-6 mt-6">
          <h1 className={`text-2xl font-DB_Med ${Status_textcolor}`}>
            {Status_text}
          </h1>
          <p className="text-base font-DB_v4 text-gray-800 mt-2">
            {Status_detail}
          </p>

          <p className="text-base font-DB_v4 text-gray-600 mt-2">
            เลขคำสั่งซื้อ {params.slug}
          </p>
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
                  <h3 className="flex flex-row text-lg font-DB_v4 text-gray-700 space-x-1">
                    <span>{product.Product_Name}</span>
                    {product.Noodles_Name && <p>{product.Noodles_Name}</p>}
                    {product.Meat_Name && <p>({product.Meat_Name})</p>}
                    {product.Product_Size && <p>{product.Product_Size}</p>}
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
            <div className="text-xl text-red-600 font-DB_Med">฿0</div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="text-xl text-gray-800 font-DB_Med">
              ราคารวมสุทธิ
            </div>
            <div className="text-xl text-green-600 font-DB_Med">
              ฿{totalPrice}
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
      </main>
      <footer className="flex justify-center fixed bottom-0 inset-x-0 mb-8">
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
