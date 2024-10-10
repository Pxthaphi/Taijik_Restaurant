"use client";
import Swal from "sweetalert2";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./css/sweet_style.css";
import { Select, SelectItem, Avatar } from "@nextui-org/react";
import confetti from "canvas-confetti";
import { supabase } from "@/lib/supabase";
import { getUserID } from "@/app/auth/getUserID";
import Link from "next/link";

// Define types
interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Type?: number;
  Product_Image: string;
  Product_Detail?: string;
  Product_Price?: number;
  Product_Status?: number;
}

interface TypeItem {
  Type_ID: number;
  Type_Name: string;
  Type_Icon: string;
}

// Define History type
interface History {
  Product_ID: number;
  History_Date: string;
}

export default function Random_Food() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedProductType, setSelectedProductType] = useState<number | null>(
    null
  );
  const [excludedProducts, setExcludedProducts] = useState<number[]>([]);
  const [typeproduct, setTypeProduct] = useState<TypeItem[]>([]);
  const userID: string | null | undefined = getUserID();
  const [lastSelectedProduct, setLastSelectedProduct] =
    useState<Product | null>(null);
  const [product, setProduct] = useState<Product | null>(null); // Add product state
  const [historyProducts, setHistoryProducts] = useState<Product[]>([]); // State to store history products

  // Fetch product types from Supabase
  async function fetchTypeProducts() {
    try {
      const { data, error } = await supabase.from("product_type").select("*");

      if (error) {
        throw new Error("Error fetching type products: " + error.message);
      }

      if (data) {
        setTypeProduct(data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch product types when the component mounts
  useEffect(() => {
    fetchTypeProducts();
  }, []);

  async function getProductsFromOrdersOrProducts(
    userID: string,
    productTypeID: number
  ) {
    let { data: orderProducts, error: orderError } = await supabase
      .from("order_products")
      .select(
        "Product_ID, products (Product_Name, Product_Type, Product_Image, Product_Status)"
      )
      .eq("orders.User_ID", userID)
      .eq("products.Product_Type", productTypeID)
      .eq("products.Product_Status", 1); // เพิ่มเงื่อนไข Product_Status = 1

    if (orderError || !orderProducts || orderProducts.length === 0) {
      const { data: products, error: productError } = await supabase
        .from("products")
        .select(
          "Product_ID, Product_Name, Product_Type, Product_Image, Product_Status"
        )
        .eq("Product_Type", productTypeID)
        .eq("Product_Status", 1); // เพิ่มเงื่อนไข Product_Status = 1

      if (productError) {
        console.error("Error fetching products:", productError);
        return [];
      }
      return products as Product[];
    }

    return orderProducts.map((order) => {
      const product = order.products[0];
      return {
        Product_ID: order.Product_ID,
        Product_Name: product?.Product_Name,
        Product_Type: product?.Product_Type,
        Product_Image: product?.Product_Image,
      };
    });
  }

  // Randomly pick a product and handle null case
  function getRandomProduct(
    products: Product[],
    excludedProducts: number[],
    lastSelectedProduct: Product | null
  ): Product | null {
    let availableProducts = products.filter(
      (product) => !excludedProducts.includes(product.Product_ID)
    );

    if (availableProducts.length === 0) {
      availableProducts = products;
      setExcludedProducts([]);
    }

    let selectedProduct: Product | null = null;

    while (
      !selectedProduct ||
      selectedProduct.Product_ID === lastSelectedProduct?.Product_ID
    ) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      selectedProduct = availableProducts[randomIndex];

      if (availableProducts.length === 1) {
        break;
      }
    }

    return selectedProduct;
  }

  // Main random selection function
  async function handleRandomSelection(userID: string, productTypeID: number) {
    setLoading(true);

    let availableProducts = await getProductsFromOrdersOrProducts(
      userID,
      productTypeID
    );

    if (availableProducts.length === 0) {
      Swal.fire("ไม่มีสินค้า", "ไม่พบสินค้าที่จะสุ่ม", "warning");
      setLoading(false);
      return;
    }

    const selectedProduct = getRandomProduct(
      availableProducts,
      excludedProducts,
      lastSelectedProduct
    );

    if (!selectedProduct) {
      Swal.fire("ไม่มีสินค้า", "ไม่พบสินค้าที่จะสุ่ม", "warning");
      setLoading(false);
      return;
    }

    setExcludedProducts((prev: number[]) => [
      ...prev,
      selectedProduct.Product_ID,
    ]);
    setLastSelectedProduct(selectedProduct);
    setProduct(selectedProduct); // Set the selected product to state
    await randomFood(selectedProduct);
    setLoading(false);
  }

  // Function to show the randomization process with Swal
  async function randomFood(product: Product) {
    Swal.fire({
      title: "กำลังสุ่มเมนูอาหาร",
      text: "กรุณารอสักครู่....",
      showConfirmButton: false,
      timerProgressBar: true,
      timer: 2000,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading(Swal.getDenyButton());
      },
    }).then(() => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => {
        Swal.fire({
          html: `
        <div>
          <div class="text-3xl text-gray-700 font-DB_Med">สุ่มอาหารสำเร็จ</div>
          <div class="my-2">
            <img src="${product.Product_Image}" alt="Image of ${product.Product_Name}" class="w-full h-auto rounded-2xl my-5"/>
          </div>  
          <div class="mt-1">
            <div class="flex justify-center item-center text-gray-700 text-lg font-DB_Med">เมนูที่สุ่มได้คือ <span class="text-orange-600 mx-1">${product.Product_Name}</span></div>
          </div>
        </div>`,
          icon: "success",
          showDenyButton: true,
          showCancelButton: false,
          confirmButtonText: `
        <div class="flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 24 24">...</svg>
          <div class="text-base text-white font-DB_v4">สั่งอาหารเลย</div>
        </div>`,
          denyButtonText: `
        <div class="flex justify-center items-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="me-2" width="1em" height="1em" viewBox="0 0 21 21" stroke-width="2">...</svg>
          <div class="text-base font-DB_v4 text-white">สุ่มใหม่อีกครั้ง</div>
        </div>`,
          denyButtonColor: "#E59B2B",
          reverseButtons: true,
        }).then(async (result) => {
          if (result.isConfirmed) {
            if (userID) {
              await saveRandomHistory(userID, product.Product_ID);
              Swal.fire(
                "บันทึกแล้ว!",
                "เมนูนี้ถูกบันทึกลงประวัติการสุ่ม",
                "success"
              ).then(() => {
                router.push(`/customer/pages/product/${product.Product_ID}`);
              });
            }
          } else if (result.isDenied) {
            await handleAnimationClick();
          }
        });
      }, 100);
    });
  }

  // Save random selection to history
  async function saveRandomHistory(userID: string, productID: number) {
    const { data, error } = await supabase.from("history_random").insert([
      {
        User_ID: userID,
        Product_ID: productID,
        History_Date: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error("Error saving history:", error);
      return null;
    }

    return data;
  }

  async function fetchHistoryProducts() {
    try {
      const { data, error } = await supabase
        .from("history_random")
        .select(
          "Product_ID, products (Product_ID, Product_Name, Product_Image, Product_Detail, Product_Price, Product_Status, Product_Type)"
        )
        .eq("User_ID", userID)
        .order("History_Date", { ascending: false });

      if (error) {
        console.error("Error fetching history products:", error);
        return;
      }

      // Log the data to check structure
      console.log("Fetched history products: ", data);

      const products = data
        .map((historyItem) => historyItem.products) // This likely gives an array of products per history item
        .flat() // Flatten the array so we get a single level array
        .filter((product) => product !== undefined); // Filter out any undefined products

      console.log("Processed products: ", products);
      setHistoryProducts(products); // Set the flattened array to statedata to state
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchHistoryProducts();
    // Ensure that Supabase subscription works properly
    const channel = supabase
      .channel("realtime-historyrandom")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "history_random" },
        (payload) => {
          console.log("Change received!", payload);
          fetchHistoryProducts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel); // Clean up the subscription
    };
  }, [supabase]); // Empty array ensures it runs only once on component mount

  const goBack = () => {
    router.back();
  };

  const handleAnimationClick = async () => {
    if (!selectedProductType) {
      Swal.fire("กรุณาเลือกหมวดหมู่ก่อน", "", "warning");
      return;
    }
    if (userID) {
      await handleRandomSelection(userID, selectedProductType);
    } else {
      Swal.fire("ไม่พบผู้ใช้งาน", "โปรดเข้าสู่ระบบก่อนทำการสุ่ม", "error");
    }
  };

  return (
    <>
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
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">สุ่มเมนูอาหาร</div>
      </header>

      <section className="flex justify-center mt-12 pt-10 animate-fade-up animate-duration-[1000ms]">
        <div className="w-full max-w-sm p-4 bg-white rounded-xl shadow-lg sm:p-6">
          <div className="flex justify-center my-5">
            <div className="me-2 h-8 bg-gray-100 p-0.5 rounded-xl flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 text-orange-400 animate-rotate-y animate-infinite animate-duration-[2500ms] animate-ease-in-out"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3-3-3H4a1 1 0 1 1 0-2h3l4 4 4-4h2V5l4 3.001L17 11V9h-1l-3 3 3 3h1v-2l4 3-4 3v-2h-2l-4-4-4 4z"
                ></path>
              </svg>
            </div>

            <h5 className="mb-3 text-xl font-DB_Med text-gray-900">
              สุ่มเมนูอาหาร
            </h5>
          </div>

          <h5 className="text-lg font-DB_Med text-gray-700">
            หมวดหมู่เมนูอาหารที่ต้องการสุ่ม
          </h5>
          <p className="text-sm font-DB_v4 text-gray-500">
            เลือกหมวดหมู่ที่ต้องการสุ่ม เช่น หมวดหมู่ทั้งหมด , เมนูขายดี ,
            เมนูข้าว , เมนูเส้น หรือ เมนูต้ม เป็นต้น
          </p>

          <Select
            placeholder="กรุณาเลือกหมวดหมู่เพื่อทำการสุ่ม"
            labelPlacement="outside"
            className="pt-5"
            classNames={{
              base: "max-w-sm",
              trigger: "h-12",
            }}
            onChange={(e) => setSelectedProductType(Number(e.target.value))}
            aria-label="เลือกหมวดหมู่เพื่อทำการสุ่ม"
          >
            {typeproduct.map((type) => (
              <SelectItem key={type.Type_ID} textValue={type.Type_Name}>
                <div className="flex gap-2 items-center">
                  <Avatar
                    alt={type.Type_Name}
                    className="flex-shrink-0"
                    size="sm"
                    src={type.Type_Icon}
                  />
                  <div className="flex flex-col">
                    <span className="text-small">{type.Type_Name}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </Select>

          <div className="flex justify-center my-4 mt-8">
            <button
              className="inline-flex items-center bg-orange-400 hover:bg-orange-500 text-white rounded-3xl py-2 px-6 text-lg"
              onClick={handleAnimationClick}
              disabled={loading}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="w-7 h-7 me-2 text-white"
              >
                <path
                  fill="currentColor"
                  fillRule="evenodd"
                  d="M4 17a1 1 0 0 1 0-2h2l3-3-3-3H4a1 1 0 1 1 0-2h3l4 4 4-4h2V5l4 3.001L17 11V9h-1l-3 3 3 3h1v-2l4 3-4 3v-2h-2l-4-4-4 4z"
                ></path>
              </svg>

              <div className="font-DB_Med text-base text-white">
                กดเพื่อทำการสุ่มเมนูอาหาร
              </div>
            </button>
          </div>
        </div>
      </section>

      <section className="mx-7 mt-9 animate-fade-up animate-duration-[1500ms] py-8">
        <div className="font-DB_Med text-xl text-gray-600">ผลลัพธ์การสุ่ม</div>
        <div className="w-full items-center mt-5">
          {historyProducts.length > 0 ? (
            historyProducts.map((product) => (
              <div
                key={product.Product_ID}
                className={`relative rounded-xl overflow-hidden shadow-lg w-full md:w-1/2 lg:w-1/2 xl:w-1/2 mt-5 ${
                  product.Product_Status === 2
                    ? "bg-gray-200 opacity-50 pointer-events-none"
                    : ""
                }`}
              >
                {product.Product_Status === 2 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-5xl font-DB_Med text-red-500 opacity-100 transform -rotate-12">
                      หมด
                    </div>
                  </div>
                )}
                <Link
                  href={
                    product.Product_Status === 1
                      ? `/customer/pages/product/${product.Product_ID}`
                      : "#"
                  }
                >
                  <div className="absolute top-0 right-0 mt-2 mr-2">
                    <span className="inline-flex items-center justify-center px-2 py-0.5 ms-3 text-xs font-medium text-gray-500 bg-white rounded-full">
                      <svg
                        className="w-3 h-3 text-yellow-300"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 22 20"
                      >
                        <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                      </svg>
                      <p className="text-xs font-DB_Med ms-1 text-yellow-500">
                        5.0
                      </p>
                    </span>
                  </div>

                  <img
                    className="w-full h-24 object-cover"
                    src={`${product.Product_Image}?t=${new Date().getTime()}`}
                    alt={product.Product_Name}
                  />
                  <div className="px-3 py-2">
                    <div className="font-DB_Med text-lg">
                      {product.Product_Name}
                    </div>
                    <div className="font-DB_Med text-xs mb-1 text-gray-500">
                      {product.Product_Detail}
                    </div>
                    <div className="flex justify-between pt-2">
                      <p className="text-gray-500 text-sm font-DB_Med my-0.5">
                        15 นาที
                      </p>
                      <p className="text-base font-DB_Med text-green-600">
                        ฿{product.Product_Price}
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center mt-12 font-DB_Med">
              ไม่พบข้อมูลสินค้า
            </p>
          )}
        </div>
      </section>
    </>
  );
}
