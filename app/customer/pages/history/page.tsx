"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { supabase } from "@/lib/supabase";
import { getUserID } from "@/app/auth/getUserID";
import Link from "next/link";

interface FetchedOrder {
  Order_ID: string;
  Order_Datetime: string;
  Order_Status: number;
  Promotion_ID: number | null; // Add this field, assuming it's a number or can be null
}

interface ProductDetail {
  Product_ID: number;
  Product_Name: string;
  Product_Qty: number;
  Product_Size: string;
  Meat_Name: string[]; // Updated to be an array
  Option_Names: string[]; // Updated to be an array
  Noodle_Names: string[];
  Total_Price: number;
}

interface Order extends FetchedOrder {
  products: ProductDetail[];
  totalPrice: number; // Already exists or calculated
  finalPrice: number; // Add this field for final price after discount
}

export default function HistoryOrder() {
  const router = useRouter();
  const [state, setState] = useState({
    selected: "pending",
    color: "primary" as "primary" | "warning" | "success" | "danger",
    textColor: "",
    orders: [] as Order[],
    loading: true,
    error: null as string | null,
    orderStatus: 1, // Initial order status, adjust as needed
  });

  const handleTabChange = (key: any) => {
    setState((prevState) => ({ ...prevState, selected: key }));
  };

  const getStatus = (tab: string) => {
    switch (tab) {
      case "pending":
        return 1;
      case "processing":
        return 2;
      case "completed":
        return [3, 4];
      case "cancelled":
        return 5;
      default:
        return 1;
    }
  };

  const fetchOrders = async (status: string) => {
    try {
      const userID = await getUserID();
      const statusValues = getStatus(status);

      let ordersQuery = supabase
        .from("orders")
        .select("Order_ID, Order_Datetime, Order_Status, Promotion_ID") // Add Promotion_ID here
        .eq("User_ID", userID);

      if (Array.isArray(statusValues)) {
        ordersQuery = ordersQuery.in("Order_Status", statusValues);
      } else {
        ordersQuery = ordersQuery.eq("Order_Status", statusValues);
      }

      const { data: orders, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        setState((prevState) => ({
          ...prevState,
          orders: [],
          orderStatus: 0,
          loading: false,
        }));
        return;
      }

      const orderIds = orders.map((order: FetchedOrder) => order.Order_ID);
      const promotionIds = orders
        .map((order: FetchedOrder) => order.Promotion_ID)
        .filter((id) => id !== null); // Filter out null Promotion_IDs

      const [
        { data: orderProducts, error: orderProductsError },
        { data: products, error: productsError },
        { data: productMeats, error: productMeatsError },
        { data: productOptions, error: productOptionsError },
        { data: noodlesData, error: noodlesError },
        { data: promotions, error: promotionsError }, // Fetch promotions data
      ] = await Promise.all([
        supabase.from("order_products").select("*").in("Order_ID", orderIds),
        supabase.from("products").select("*"),
        supabase.from("product_meat").select("*"),
        supabase.from("product_option").select("*"),
        supabase.from("noodles_type").select("*"),
        // Only query promotions if promotionIds is not empty
        promotionIds.length > 0
          ? supabase
              .from("promotions")
              .select("*")
              .in("Promotion_ID", promotionIds)
          : { data: [], error: null }, // If no promotions, return empty array
      ]);

      if (orderProductsError) throw orderProductsError;
      if (productsError) throw productsError;
      if (productMeatsError) throw productMeatsError;
      if (productOptionsError) throw productOptionsError;
      if (noodlesError) throw noodlesError;
      if (promotionsError) throw promotionsError;

      const enrichedOrders = orders.map((order: FetchedOrder) => {
        const orderProductsForOrder = orderProducts.filter(
          (op: any) => op.Order_ID === order.Order_ID
        );

        // Check if Order_Promotion is null, and handle it
        const promotion = order.Promotion_ID
          ? promotions.find(
              (promo: any) => promo.Promotion_ID === order.Promotion_ID
            )
          : null;

        const productsWithDetails = orderProductsForOrder.map((op: any) => {
          const product = products.find(
            (p: any) => p.Product_ID === op.Product_ID
          );

          const meatNames = Array.isArray(op.Product_Meat)
            ? op.Product_Meat.map((meatID: any) => {
                const meat = productMeats.find(
                  (m: any) => m.Meat_ID === meatID
                );
                return meat ? meat.Meat_Name : "No meat";
              }).join(", ")
            : "No meat";

          const optionNames = Array.isArray(op.Product_Option)
            ? op.Product_Option.map((optionID: bigint) => {
                const option = productOptions.find(
                  (o: any) => o.Option_ID === optionID
                );
                return option ? option.Option_Name : "No option";
              }).join(", ")
            : "No options";

          const noodleNames = Array.isArray(op.Product_Noodles)
            ? op.Product_Noodles.map((noodleID: bigint) => {
                const noodle = noodlesData.find(
                  (n: any) => n.Noodles_ID === noodleID
                );
                return noodle ? noodle.Noodles_Name : "No noodles";
              }).join(", ")
            : "No noodles";

          return {
            Product_ID: product?.Product_ID,
            Product_Name: product?.Product_Name,
            Product_Qty: op.Product_Qty,
            Product_Size: op.Product_Size || "N/A",
            Meat_Name: meatNames,
            Option_Names: optionNames,
            Noodle_Names: noodleNames,
            Total_Price: op.Total_Price,
          };
        });

        const totalPrice = productsWithDetails.reduce(
          (total, product) => total + product.Total_Price,
          0
        );

        // Apply discount if promotion exists, otherwise discount is 0
        const discount = promotion ? promotion.Discount || 0 : 0;
        const finalPrice = totalPrice - discount;

        return {
          ...order,
          products: productsWithDetails,
          totalPrice,
          finalPrice, // Use finalPrice here for displaying the correct price
          promotion, // Include promotion data if needed
        };
      });

      setState((prevState) => ({
        ...prevState,
        orders: enrichedOrders, // Assign enrichedOrders here
        orderStatus: enrichedOrders[0]?.Order_Status || 0,
        loading: false,
      }));
    } catch (error) {
      console.error(error);
      setState((prevState) => ({
        ...prevState,
        error: "Failed to fetch orders",
        loading: false,
      }));
    }
  };

  useEffect(() => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    fetchOrders(state.selected);

    switch (state.selected) {
      case "pending":
        setState((prevState) => ({
          ...prevState,
          color: "primary",
          textColor: "text-sky-500",
        }));
        break;
      case "processing":
        setState((prevState) => ({
          ...prevState,
          color: "warning",
          textColor: "text-orange-500",
        }));
        break;
      case "completed":
        setState((prevState) => ({
          ...prevState,
          color: "success",
          textColor: "text-green-500",
        }));
        break;
      case "cancelled":
        setState((prevState) => ({
          ...prevState,
          color: "danger",
          textColor: "text-red-500",
        }));
        break;
      default:
        setState((prevState) => ({
          ...prevState,
          color: "primary",
          textColor: "text-sky-500",
        }));
    }
  }, [state.selected]);

  useEffect(() => {
    fetchOrders(state.selected);

    const channel = supabase
      .channel("realtime-orders")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        (payload) => {
          console.log("Change received!", payload);
          fetchOrders(state.selected);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]); // Run once on component mount

  const navigateBack = () => {
    router.back();
  };

  return (
    <>
      <header className="mx-8 mt-8 flex justify-center items-center">
        <div
          onClick={navigateBack}
          className="absolute py-1 px-1 top-8 left-8 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">ประวัติคำสั่งซื้อ</div>
      </header>
      <section className="mx-4 mt-8">
        <Tabs
          variant="underlined"
          className="me-8 flex justify-between font-DB_Med"
          selectedKey={state.selected}
          onSelectionChange={handleTabChange}
          fullWidth
          color={state.color}
        >
          <Tab
            key="pending"
            title="รอยืนยัน"
            className="flex-1 text-center text-lg"
          />
          <Tab
            key="processing"
            title="กำลังดำเนินการ"
            className="flex-1 text-center text-lg"
          />
          <Tab
            key="completed"
            title="เสร็จสิ้น"
            className="flex-1 text-center text-lg"
          />
          <Tab
            key="cancelled"
            title="ยกเลิกคำสั่งซื้อ"
            className="flex-1 text-center text-lg"
          />
        </Tabs>
        {state.loading && (
          <p className="mx-4 mt-8 flex flex-col items-center justify-center h-[36rem]">
            กำลังโหลด...
          </p>
        )}
        {state.error && (
          <p className="mx-4 mt-8 flex flex-col items-center justify-center h-[36rem]">
            {state.error}
          </p>
        )}
        {!state.loading && !state.error && state.orders.length === 0 && (
          <div className="mx-4 mt-8 flex flex-col items-center justify-center h-[32rem]">
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/preparing_order.png"
              alt="No orders"
              className="h-[10rem] animate-wiggle animate-infinite animate-duration-[1200ms] animate-ease-in-out"
            />
            <p className="mt-5 text-lg font-DB_v4 text-center">
              ไม่มีคำสั่งซื้อของคุณ{" "}
              <Link href={"product"} className="font-DB_Med text-green-600">
                สั่งเลยตอนนี้!!
              </Link>
            </p>
          </div>
        )}
        <section className="mt-8">
          {!state.loading && !state.error && state.orders.length > 0 && (
            <div className="">
              {state.selected === "pending" && (
                <OrderStatus
                  status="รอการยืนยันออเดอร์"
                  textColor={state.textColor}
                  orders={state.orders}
                />
              )}
              {state.selected === "processing" && (
                <OrderStatus
                  status="กำลังดำเนินการ"
                  textColor={state.textColor}
                  orders={state.orders}
                />
              )}
              {state.selected === "completed" && (
                <OrderStatus
                  status={
                    state.orderStatus === 3
                      ? "เตรียมเมนูอาหารเสร็จสิ้น"
                      : state.orderStatus === 4
                      ? "คำสั่งซื้อเสร็จสิ้น"
                      : ""
                  }
                  textColor={state.textColor}
                  orders={state.orders}
                />
              )}

              {state.selected === "cancelled" && (
                <OrderStatus
                  status="ยกเลิกคำสั่งซื้อ"
                  textColor={state.textColor}
                  orders={state.orders}
                />
              )}
            </div>
          )}
        </section>
      </section>
    </>
  );
}

function OrderStatus({
  status,
  textColor,
  orders,
}: {
  status: string;
  textColor: string;
  orders: Order[];
}) {
  // Function to format datetime in Thai locale without adding 543 to the year
  const formatDateTimeThai = (datetime: string) => {
    const [datePart, timePart] = datetime.split(" ");
    const [day, month, year] = datePart.split("/");

    const monthsInThai = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    const formattedDate = `${parseInt(day)} ${
      monthsInThai[parseInt(month) - 1]
    } ${year}`;

    const formattedTime = new Date(`1970-01-01T${timePart}`).toLocaleTimeString(
      "th-TH",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    return `${formattedDate} ${formattedTime} น.`;
  };
  return (
    <div>
      {orders.map((order) => (
        <Link
          key={order.Order_ID}
          href={`product/order_product/${order.Order_ID}`}
          className="border p-2 rounded-2xl shadow-md flex flex-col mb-4"
        >
          <div className="flex justify-between items-center mb-2 mt-2">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex justify-center items-center mr-4">
                {/* Placeholder for any icon or image */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="1em"
                  height="1em"
                  viewBox="0 0 512 512"
                  className="h-9 w-9"
                >
                  <path
                    fill="#2b3b47"
                    d="M478.251 307.661c-7.935-.173-13.957 3.19-18.637 8.436C450.252 398.14 411.545 481 259.499 481C109.661 481 65.62 394.48 53.748 315.873c-4.652-5.117-10.612-8.383-18.432-8.212c-40.275.88-41.762-67.195-1.487-68.075c20.862 0 44.929-52.357 92.864-71.393l-22.105 84.631l-6.175 4.042h316.743l-6.175-4.042l-22.105-84.631c47.935 19.036 72.002 71.393 92.864 71.393c40.273.879 38.786 68.954-1.489 68.075"
                  ></path>
                  <path
                    fill="#597b91"
                    d="M462.446 256.865c0 63.313-92.393 114.639-206.366 114.639S49.715 320.178 49.715 256.865s92.393-114.639 206.366-114.639s206.365 51.326 206.365 114.639"
                  ></path>
                  <path
                    fill="#f9e7c0"
                    d="M437.204 271.745c0 50.78-81.092 91.946-181.123 91.946S74.957 322.526 74.957 271.745s81.092-91.946 181.123-91.946s181.124 41.166 181.124 91.946"
                  ></path>
                  <path
                    fill="#2aba34"
                    d="M263.988 174.248c7.694-23.254-7.551-20.958-20.198 3.705a18.908 18.908 0 0 0-.485-.061c7.171-23.129-9.621-19.125-22.351 8.522c7.644-21.068-5.303-20.509-18.356-4.583c2.765-16.364-11.652-11.24-23.151 12.879c-5.273-.923-7.484 2.209-4.319 8.938a60.67 60.67 0 0 0-2.642 1.054c-16.687-13.402-27.58-9.484-14.473 8.089l-.238.165c-19.602-19.687-35.078-17.99-22.464.257c-.228.069-.46.147-.698.233c-18.554-17.695-32.673-15.849-21.198 1.284c-3.157.23-6.891.772-11.315 1.714c-32.527 6.922-20.605 21.051 11.611 15.529c-14.832 19.492.331 22.274 20.306 3.059c.148.075.294.146.439.216c-14.297 19.544 2.885 21.213 23.907-.797c-14.074 17.441-1.648 21.119 15.871 10.298c-8.81 16.192 11.042 14.203 32.393-11.693c6.138-.078 13.903-1.226 22.825-3.972c0 0 2.089-3.822.849-7.071c10.459.333 11.609-6.721-4.205-16.684c26.408 13.881 41.983 7.255 23.56-6.319c.193-.14.388-.289.584-.447c23.296 10.706 36.05 4.373 19.631-8.102c2.911-1.244 6.266-2.969 10.144-5.297c28.513-17.117 12.647-26.606-16.027-10.916m-119.913 49.586l.056-.072l.248.253l-.091.088zm23.192.061c.085-.114.171-.223.256-.338l-.002-.014c.248.241.492.471.735.7c-.146.124-.292.249-.438.376a85.74 85.74 0 0 0-.551-.724m47.939-25.112c.253.171.504.338.756.505c-.044.135-.089.267-.132.402l.006.013c-.313-.147-.618-.285-.923-.423c.098-.164.196-.329.293-.497m22.421-7.157l.289.184l-.03.086c-.107-.055-.21-.105-.317-.158zm-25.586 26.609c-1.544-1.239-3.389-2.543-5.544-3.901a90.996 90.996 0 0 0 7.649 3.594c-.674.087-1.379.191-2.105.307"
                  ></path>
                  <path
                    fill="#f9f9f7"
                    d="M336.375 200.704c42 0 42 42.645 0 42.645s-42-42.645 0-42.645m31.5 92.364c42 0 42-42.645 0-42.645s-42 42.645 0 42.645m-21.5 41.65c42 0 42-42.645 0-42.645s-42 42.645 0 42.645"
                  ></path>
                  <path
                    fill="#ff473e"
                    d="M320.68 281.5a5.372 5.372 0 0 1-6.947 1.451l-.433-.246l-2.442-1.385c-.799-.413-1.811-.868-2.936-1.418c-1.177-.476-2.493-1.037-3.969-1.55c-1.496-.476-3.088-1.037-4.844-1.422c-1.719-.494-3.596-.754-5.496-1.115l-2.929-.321c-.983-.14-1.987-.159-2.993-.185l-1.511-.051l-.757-.027l-.758.038l-3.026.135c-1.004.077-1.996.25-2.983.362l-1.474.186l-1.438.321c-.951.219-1.899.394-2.819.627l-2.67.85c-.436.141-.872.262-1.295.411l-1.226.528l-2.362.996c-1.494.738-2.849 1.546-4.126 2.205c-1.114.751-2.065 1.436-2.949 2.007l-.637.417l-.739.603l-1.302 1.062l-2.471 2.016c-4.288 3.498-10.6 2.858-14.098-1.43c-3.498-4.288-2.858-10.6 1.43-14.098c.311-.254.634-.486.965-.697l.058-.035l2.702-1.693a1264.415 1264.415 0 0 0 2.232-1.398l1.134-.607c1.567-.823 3.349-1.774 5.275-2.693c1.901-.734 3.929-1.588 6.122-2.329l3.434-.969l1.771-.488c.604-.132 1.222-.233 1.839-.35l3.76-.673c1.277-.16 2.576-.249 3.877-.37l1.957-.165l1.97-.011c1.314.01 2.632-.031 3.94.034l3.905.316l.969.082l.957.149l1.9.302c1.261.197 2.508.391 3.714.709c1.211.29 2.407.559 3.571.863c.27.085.535.166.802.249c-1.159-1.145-2.493-2.211-3.812-3.354l-2.372-1.749c-.779-.615-1.638-1.135-2.495-1.664l-1.281-.804l-.641-.403l-.674-.348l-2.685-1.403c-.906-.438-1.851-.787-2.761-1.186l-1.368-.58l-1.404-.445c-.932-.289-1.84-.614-2.752-.874l-2.736-.606c-.447-.097-.886-.212-1.326-.296l-1.326-.159l-2.543-.325c-1.663-.112-3.241-.095-4.675-.166c-1.341.09-2.507.204-3.558.254l-.761.04l-.942.15l-1.659.264l-3.149.501c-5.465.87-10.601-2.854-11.471-8.319c-.87-5.465 2.854-10.601 8.319-11.471c.397-.063.792-.102 1.184-.118l.068-.001l3.186-.106l1.679-.056l.953-.032l1.286.045c1.769.076 3.787.149 5.914.322c2.013.321 4.195.601 6.463 1.062l3.456.888l1.777.468c.589.189 1.173.412 1.766.621l3.589 1.308c1.184.503 2.353 1.079 3.538 1.628l1.775.841l1.709.98c1.131.669 2.291 1.295 3.39 2.009l3.218 2.235l.796.558l.753.609l1.491 1.216c.991.804 1.972 1.598 2.855 2.479c.901.859 1.801 1.693 2.654 2.54c1.624 1.782 3.236 3.447 4.561 5.206c1.408 1.681 2.564 3.414 3.651 4.983c1.056 1.596 1.931 3.128 2.714 4.469c.714 1.401 1.352 2.599 1.831 3.621l1.394 3.286c.2.472.323.957.383 1.442l2.304 1.727a5.37 5.37 0 0 1 1.08 7.52"
                  ></path>
                  <path
                    fill="#e2af8d"
                    d="M233.776 342.505c-31.657-8.718-11.5-76.618 23.59-72.893s97.201 106.158-23.59 72.893M205.635 277.9c14.777-32.045-64.199-57.756-82.605-30.564c-70.229 103.753 67.829 62.609 82.605 30.564"
                  ></path>
                  <path
                    fill="#d19878"
                    d="M177.42 346.598c-31.657-8.718-11.5-76.618 23.59-72.893c35.091 3.725 97.201 106.158-23.59 72.893"
                  ></path>
                  <path
                    fill="#d7f4f7"
                    d="m234.442 12.492l1.718.173c1.137.188 2.681.083 5.002 1.036c1.12.41 2.489.777 3.638 1.569c1.195.747 2.641 1.431 3.787 2.639l1.9 1.763c.645.62 1.119 1.401 1.708 2.141c1.245 1.463 2.025 3.278 2.933 5.158c1.481 3.834 2.559 8.36 2.036 13.19c-.465 4.781-2.074 9.934-5.502 14.325c-3.307 4.462-8.59 7.811-14.15 9.086l-2.098.516c-.257.1-1.064.232-1.57.348l-1.734.358l-1.275.414c-1.674.471-3.555 1.401-5.182 2.309c-3.27 1.957-6.125 4.627-8.11 7.923c-1.963 3.282-3.443 6.94-3.962 10.723c-.555 3.756-.534 7.54.186 11.006c.722 3.459 1.94 6.631 3.539 9.303a27.836 27.836 0 0 0 5.52 6.539c1.96 1.726 4.001 2.862 5.705 3.794c1.76.803 3.191 1.464 4.219 1.754l1.561.552l.139.049a1.416 1.416 0 0 1-.554 2.747l-1.794-.105c-1.18-.048-2.906-.271-5.095-.773c-2.145-.609-4.85-1.376-7.607-3.06c-2.782-1.602-5.747-3.893-8.288-7.044c-5.164-6.185-8.644-15.737-7.652-25.966c.456-5.084 1.897-10.381 4.742-15.143c2.761-4.789 6.917-8.969 11.773-11.938c2.545-1.365 4.978-2.515 7.882-3.302l2.133-.581l1.741-.322c.647-.128 1.008-.167 1.888-.369l1.321-.32c3.508-.789 6.694-2.315 8.864-4.96c2.195-2.562 3.705-5.741 4.388-9.03c.689-3.312.368-6.595-.249-9.525c-.461-1.416-.834-2.841-1.544-4.014c-.327-.598-.549-1.273-.937-1.793l-1.15-1.528c-.66-1.104-1.681-1.711-2.44-2.523c-.773-.865-1.629-1.238-2.372-1.748c-1.361-1.071-3.126-1.577-4.131-1.988l-1.604-.638a1.427 1.427 0 0 1-.798-1.854a1.434 1.434 0 0 1 1.475-.891m-82.477 52.819a2.176 2.176 0 0 0-3.003-.666l-1.149.732c-.755.564-1.834.973-3.259 2.293l-2.32 2.088l-2.361 2.667c-1.553 2.024-3.098 4.489-4.462 7.392c-1.196 2.949-2.278 6.299-2.712 9.991c-.597 3.686-.302 7.665.364 11.721c.695 4.079 2.336 8.12 4.523 11.944c1.199 1.85 2.403 3.736 3.933 5.388c.725.859 1.451 1.723 2.308 2.456l2.225 1.983c1.287 1.194 3.127 2.63 3.664 3.51c.843.858 1.663 2.135 2.493 3.335c1.434 2.533 2.673 5.14 3.396 7.874c.663 2.724 1.183 5.46 1.149 8.106c.096 2.648-.185 5.178-.657 7.507c-.343 1.119-.489 2.294-.857 3.326c-.388 1.019-.703 2.039-1.094 2.958l-1.172 2.589c-.449.75-.867 1.455-1.229 2.122c-.693 1.366-1.525 2.222-1.955 2.962l-.728 1.087l-.189.281a2.171 2.171 0 0 0 2.807 3.134s.454-.237 1.305-.678c.818-.491 2.193-1.055 3.582-2.239c.728-.557 1.554-1.176 2.389-1.924l2.515-2.636c1.665-2.012 3.311-4.508 4.744-7.471c1.223-3.016 2.45-6.438 2.831-10.234c.565-3.777.285-7.868-.532-11.986c-.844-4.131-2.603-8.217-4.97-11.988c-1.287-1.819-2.528-3.644-4.329-5.442c-1.815-2.04-3.044-2.814-4.523-4.14l-2.015-1.7c-.62-.429-1.123-.976-1.639-1.512c-1.113-1.003-1.971-2.22-2.889-3.388c-1.614-2.481-2.972-5.134-3.843-7.92c-.814-2.785-1.321-5.632-1.317-8.369c-.149-2.754.277-5.355.775-7.75c.572-2.38 1.351-4.524 2.232-6.364l1.327-2.557l1.298-1.958c.658-1.229 1.784-2.239 2.278-2.907l.884-1.035a2.176 2.176 0 0 0 .182-2.582m195.515 0a2.176 2.176 0 0 0-3.003-.666l-1.149.732c-.755.564-1.834.973-3.259 2.293l-2.32 2.088l-2.361 2.667c-1.553 2.024-3.098 4.489-4.462 7.392c-1.196 2.949-2.278 6.299-2.712 9.991c-.597 3.686-.302 7.665.364 11.721c.695 4.079 2.336 8.12 4.523 11.944c1.199 1.85 2.403 3.736 3.933 5.388c.725.859 1.451 1.723 2.308 2.456l2.225 1.983c1.287 1.194 3.127 2.63 3.664 3.51c.843.858 1.663 2.135 2.493 3.335c1.434 2.533 2.673 5.14 3.396 7.874c.663 2.724 1.183 5.46 1.149 8.106c.096 2.648-.185 5.178-.657 7.507c-.343 1.119-.489 2.294-.857 3.326c-.388 1.019-.703 2.039-1.094 2.958l-1.172 2.589c-.449.75-.867 1.455-1.229 2.122c-.693 1.366-1.525 2.222-1.955 2.962l-.728 1.087l-.189.281a2.171 2.171 0 0 0 2.807 3.134s.454-.237 1.305-.678c.818-.491 2.193-1.055 3.582-2.239c.728-.557 1.554-1.176 2.389-1.924l2.515-2.636c1.665-2.012 3.311-4.508 4.744-7.471c1.223-3.016 2.45-6.438 2.831-10.234c.565-3.777.285-7.868-.532-11.986c-.844-4.131-2.603-8.217-4.97-11.988c-1.287-1.819-2.528-3.644-4.329-5.442c-1.815-2.04-3.044-2.814-4.523-4.14l-2.015-1.7c-.62-.429-1.123-.976-1.639-1.512c-1.113-1.003-1.971-2.22-2.889-3.388c-1.614-2.481-2.972-5.134-3.843-7.92c-.814-2.785-1.321-5.632-1.317-8.369c-.149-2.754.277-5.355.775-7.75c.572-2.38 1.351-4.524 2.232-6.364l1.327-2.557l1.298-1.958c.658-1.229 1.784-2.239 2.278-2.907l.884-1.035a2.178 2.178 0 0 0 .182-2.582m-71.82 98.975a1.36 1.36 0 0 0 .312-1.897l-.496-.691c-.284-.443-.896-1.132-1.278-1.931c-.489-.753-.967-1.77-1.479-2.94c-.429-1.186-.87-2.516-.985-3.98c-.241-1.44-.082-3.001.271-4.54c.351-1.547 1.067-3.085 2.077-4.51a17.383 17.383 0 0 1 3.838-3.92c.373-.299.752-.594 1.186-.84l1.503-.964c1.003-.718 1.825-1.108 3.08-2.367c2.399-2.182 3.783-4.396 5.098-6.853c1.272-2.416 1.953-4.984 2.434-7.454c.485-2.479.47-4.925.308-7.202c-.186-2.284-.697-4.404-1.338-6.294a22.929 22.929 0 0 0-2.39-4.889c-.91-1.352-1.806-2.436-2.68-3.216c-.761-.852-1.614-1.296-2.088-1.66l-.765-.521a1.348 1.348 0 0 0-1.953 1.744l.116.22l.377.715c.202.498.664 1.057.981 1.961c.37.858.804 1.871 1.113 3.11c.338 1.214.657 2.591.791 4.128c.245 1.507.204 3.186.167 4.919c-.037 1.746-.379 3.553-.74 5.382c-.406 1.825-1.063 3.628-1.856 5.339c-.781 1.625-1.966 3.424-3.033 4.412c-.317.498-1.537 1.314-2.378 2.016l-.044.034c-.06.042.456-.306.225-.15l-.026.019l-.103.074l-.204.148l-.409.297l-.81.596c-.549.377-1.059.823-1.558 1.279c-2.039 1.74-3.801 3.856-5.028 6.208c-1.236 2.326-2.112 4.825-2.261 7.282c-.159 2.432.045 4.753.712 6.716c.604 1.985 1.538 3.597 2.392 4.953c.958 1.281 1.855 2.335 2.713 3.135c.825.864 1.471 1.21 1.913 1.589l.676.516a1.36 1.36 0 0 0 1.619.027"
                  ></path>
                </svg>
              </div>
              <div>
                <div className={`text-md font-DB_Med ${textColor}`}>
                  {status} | {order.Order_ID}
                </div>
                <div className="text-gray-600 font-DB_v4">
                  {order.products.map((product, index) => (
                    <div key={product.Product_ID} className="mb-1 text-sm">
                      {product.Product_Name}
                      {product.Meat_Name && ` (${product.Meat_Name})`} x{" "}
                      {product.Product_Qty} <br />
                      (ขนาด {product.Product_Size}
                      {product.Noodle_Names && `, เส้น ${product.Noodle_Names}`}
                      {product.Option_Names &&
                        `, เพิ่ม ${product.Option_Names}`}
                      ){index < order.products.length - 1 && ", "}
                    </div>
                  ))}
                </div>

                <p className="font-DB_v4 text-sm">
                  เวลาที่สั่ง : {formatDateTimeThai(order.Order_Datetime)}
                </p>
              </div>
            </div>
            <div className="text-green-500 text-xl font-DB_Med">
              ฿{order.finalPrice.toFixed(2)}{" "}
              {/* Use finalPrice instead of calculating from products */}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
