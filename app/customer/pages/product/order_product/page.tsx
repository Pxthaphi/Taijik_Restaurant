"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import PickerWithButtonField from "./components/timepicker";
import { supabase } from "@/lib/supabase";
import { getUserID } from "@/app/auth/getUserID";

interface Product {
  User_ID: string;
  Product_ID: string;
  Product_Qty: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string;
}

export default function Order_Product() {
  const router = useRouter();
  const [quantityMap, setQuantityMap] = useState<{
    [productId: string]: number;
  }>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTimeDisplay, setSelectedTimeDisplay] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const Order_ID = "TK-0000-11111";

  useEffect(() => {
    const fetchProductsFromCart = async () => {
      try {
        const { data: cartData, error: cartError } = await supabase
          .from("cart")
          .select("User_ID, Product_ID, Product_Qty")
          .eq("User_ID", getUserID());

        if (cartError) throw cartError;

        // Check if cartData is empty
      if (cartData.length === 0) {
        // Navigate back to product page
        router.push('../product');
        return;
      }

        const initialQuantityMap: { [productId: string]: number } = {};
        cartData.forEach((item) => {
          initialQuantityMap[item.Product_ID] = item.Product_Qty;
        });
        setQuantityMap(initialQuantityMap);

        const productIDs = cartData.map((item) => item.Product_ID);

        const { data: productsData, error: productsError } = await supabase
          .from("products")
          .select(
            "Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image"
          )
          .in("Product_ID", productIDs);

        if (productsError) throw productsError;

        setProducts(productsData as Product[]);

        console.log("Cart Data:");
        console.table(cartData);

        console.log("Products Data:");
        console.table(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      }
    };

    fetchProductsFromCart();

    const channel = supabase
      .channel("realtime-cart")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "cart" },
        (payload) => {
          console.log("Change received!", payload);
          fetchProductsFromCart()
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel)
    };
  }, [supabase]);

  const handleCloseTimePicker = () => {
    console.log("Selected time:", selectedTimeDisplay);
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
      totalPrice += product.Product_Price * quantity;
    });
    return totalPrice;
  };

  const goBack = () => router.push('../product');

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
            <div className="flex bg-gray-100 hover:bg-gray-200 rounded-lg transition p-1">
              <nav className="flex space-x-1" aria-label="Tabs" role="tablist">
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-lg hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options1" ? "active" : ""
                  }`}
                  id="segment-item-1"
                  data-hs-tab="#segment-1"
                  aria-controls="segment-1"
                  role="tab"
                  onClick={() => handleOptionSelect("options1")}
                >
                  <p className="text-base font-DB_v4">กินที่ร้าน</p>
                  {selectedOption === "options1" && selectedTimeDisplay && (
                    <p className="text-base font-DB_v4 text-orange-500">
                      ({selectedTimeDisplay})
                    </p>
                  )}
                  {selectedOption === "options1" && <PickerWithButtonField />}
                </button>
                <button
                  type="button"
                  className={`hs-tab-active:bg-white hs-tab-active:text-gray-700 py-3 px-4 inline-flex items-center gap-x-2 bg-transparent text-sm font-medium rounded-lg hover:text-gray-700 hover:hover:text-blue-600 disabled:opacity-50 disabled:pointer-events-none ${
                    selectedOption === "options2" ? "active" : ""
                  }`}
                  id="segment-item-2"
                  data-hs-tab="#segment-2"
                  aria-controls="segment-2"
                  role="tab"
                  onClick={() => handleOptionSelect("options2")}
                >
                  <p className="text-base font-DB_v4">ใส่กล่องกลับบ้าน</p>
                  {selectedOption === "options2" && selectedTimeDisplay && (
                    <p className="text-base font-DB_v4 text-orange-500">
                      ({selectedTimeDisplay})
                    </p>
                  )}
                  {selectedOption === "options2" && <PickerWithButtonField />}
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
                    className="w-18 h-18 object-cover rounded-xl"
                    src={product.Product_Image}
                    alt="Product Image"
                  />
                </div>
                <div className="w-1/2 ms-6 pt-1">
                  <h3 className="text-lg font-DB_Med text-gray-700">
                    {product.Product_Name}
                  </h3>
                  <p className="text-sm text-gray-500 font-DB_v4">
                    {product.Product_Detail}
                  </p>
                  <div className="flex justify-between mt-4 gap-x-6">
                    <h3 className="text-lg font-DB_Med text-green-600 pt-2">
                      ฿{product.Product_Price}
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
                            data-hs-input-number-decrement=""
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
                            data-hs-input-number-input=""
                          />
                          <button
                            type="button"
                            onClick={() =>
                              incrementQuantity(product.Product_ID)
                            }
                            disabled={quantityMap[product.Product_ID] >= 99}
                            className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none"
                            data-hs-input-number-increment=""
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
          <div className="text-lg font-DB_Med">ใช้คูปองส่วนลด</div>

          <div className="pt-3">
            <div className="relative flex rounded-full shadow-sm">
              <input
                type="text"
                id="hs-trailing-button-add-on-with-icon-and-button"
                name="hs-trailing-button-add-on-with-icon-and-button"
                placeholder="ใส่รหัสคูปองเพื่อใช้ส่วนลด"
                className="py-3 px-6 ps-11 block w-full border border-gray-200 shadow-sm rounded-s-full text-sm"
              />
              <div className="absolute inset-y-0 start-0 flex items-center pointer-events-none z-20 ps-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-6 h-6 text-gray-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.25 2.25a3 3 0 0 0-3 3v4.318a3 3 0 0 0 .879 2.121l9.58 9.581c.92.92 2.39 1.186 3.548.428a18.849 18.849 0 0 0 5.441-5.44c.758-1.16.492-2.629-.428-3.548l-9.58-9.581a3 3 0 0 0-2.122-.879H5.25ZM6.375 7.5a1.125 1.125 0 1 0 0-2.25 1.125 1.125 0 0 0 0 2.25Z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <button
                type="button"
                className="py-2 px-6 rounded-e-full border border-transparent bg-green-600 hover:bg-green-700"
              >
                <p className="text-xs font_DB_Med text-white">ใช้งานโค้ด</p>
              </button>
            </div>
          </div>

          <div className="text-xs text-red-500 font-DB_v4 mt-4">
            * คุณมีคูปองที่สามารถใช้ได้จำนวน 2 คูปอง
          </div>
        </section>

        <section className="mx-8 mt-5">
          <div className="text-xl text-gray-800 font-DB_Med mt-4">ราคารวม</div>
          {products.map((product) => (
            <div key={product.Product_ID} className="flex justify-between mt-3">
              <div className="text-base text-gray-800 font-DB_Med">
                {product.Product_Name} x {quantityMap[product.Product_ID]}
              </div>
              <div className="text-base text-gray-800 font-DB_Med">
                ฿
                {product.Product_Price * (quantityMap[product.Product_ID] || 0)}
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
        </section>
      </main>

      <footer className="mt-12 pt-16">
        <div className="flex justify-center fixed inset-x-0 w-full h-16 max-w-lg -translate-x-1/2 bottom-4 left-1/2">
          <Link
            href={`order_product/${Order_ID}`}
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
          </Link>
        </div>
      </footer>
    </>
  );
}
