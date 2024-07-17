"use client";
import { useRouter } from "next/navigation";
import { Textarea } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Modal_CancelOrder from "./components/modal-cancel";
import Swal from "sweetalert2";

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
  Product_Meat: number;
  Product_Option: number;
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
  Meat_Name: string;
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
  Meat_Name: string;
  Option_Names: string[];
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
  const [orderStatusName, setOrderStatusName] = useState<string>("");
  const [orderStatus, setOrderStatus] = useState(1);
  const [products, setProducts] = useState<MergedProduct[]>([]);
  const [quantityMap, setQuantityMap] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string>("");

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
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("Order_ID", params.slug)
        .single();

      if (orderError) {
        console.error(orderError);
        return;
      }

      // Type orderData to ensure Order_Status is a valid key of statusNames
      const typedOrderData = orderData as Order;

      // Fetch user data based on User_ID from the order
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("User_Name")
        .eq("User_ID", typedOrderData.User_ID)
        .single();

      if (userError) {
        console.error(userError);
        return;
      }

      setUserName(userData?.User_Name || "");

      // Set order status name based on Order_Status
      setOrderStatusName(statusNames[typedOrderData.Order_Status] || "");
      setOrderStatus(typedOrderData.Order_Status);

      const { data: orderProductsData, error: orderProductsError } =
        await supabase
          .from("order_products")
          .select("*")
          .eq("Order_ID", params.slug);

      if (orderProductsError) {
        console.error(orderProductsError);
        return;
      }

      const productIds = orderProductsData.map((op) => op.Product_ID);
      const meatIds = orderProductsData.map((op) => op.Product_Meat);
      const optionIds = orderProductsData.map((op) => op.Product_Option);

      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .in("Product_ID", productIds);

      if (productsError) {
        console.error(productsError);
        return;
      }

      const { data: meatsData, error: meatsError } = await supabase
        .from("product_meat")
        .select("*")
        .in("Meat_ID", meatIds);

      if (meatsError) {
        console.error(meatsError);
        return;
      }

      const { data: optionsData, error: optionsError } = await supabase
        .from("product_option")
        .select("*")
        .in("Option_ID", optionIds);

      if (optionsError) {
        console.error(optionsError);
        return;
      }

      const mergedProducts = orderProductsData.map(
        (orderProduct: OrderProduct) => {
          const product = productsData.find(
            (p) => p.Product_ID === orderProduct.Product_ID
          );
          const meatData = meatsData.find(
            (meat) => meat.Meat_ID === orderProduct.Product_Meat
          );

          // Convert Product_Option from number to array of numbers
          const productOptionIds = Array.isArray(orderProduct.Product_Option)
            ? orderProduct.Product_Option
            : [orderProduct.Product_Option];

          const optionNames = optionsData
            .filter((opt) => productOptionIds.includes(opt.Option_ID))
            .map((opt) => opt.Option_Name);

          return {
            ...orderProduct,
            Product_Name: product?.Product_Name || "",
            Product_Image: product?.Product_Image || "",
            Meat_Name: meatData?.Meat_Name || "",
            Option_Names: optionNames, // Ensure optionNames is always an array
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
      setLoading(false);
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
  }, [params.slug, supabase]);

  const openModalCancel = (orderId: string) => {
    setCancelOrderId(orderId);
    setIsModalOpen(true);
  };
  const handleChangeStauts = async () => {
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
          const { data, error } = await supabase
            .from("orders")
            .update({ Order_Status: orderStatus + 1 })
            .eq("Order_ID", params.slug);

          if (error) {
            throw error;
          }

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
            <p className="text-lg font-DB_Med">{userName}</p>
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
                    src={product.Product_Image}
                    alt="Product Image"
                  />
                </div>
                <div className="w-1/2 ms-4 pt-1">
                  <h3 className="text-lg font-DB_Med text-gray-700">
                    {product.Product_Name} ({product.Meat_Name})
                  </h3>
                  {product.Option_Names.length > 0 && (
                    <p className="text-sm text-gray-500 font-DB_v4">
                      ตัวเลือกเพิ่มเติม: {product.Option_Names.join(", ")}
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
              <div className="text-base text-gray-800 font-DB_Med">
                {product.Product_Name} ({product.Meat_Name}) (เพิ่ม{" "}
                {product.Option_Names.join(", ")}) x{" "}
                {quantityMap[product.Product_ID]}
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
            placeholder=""
            className="max-w-full pt-2 font-DB_v4"
            defaultValue=""
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
                onClick={handleChangeStauts}
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
                onClick={handleChangeStauts}
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
                onClick={handleChangeStauts}
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
