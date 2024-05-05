"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState, Fragment } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import Link from "next/link";

interface PageProps {
  params: {
    slug: string;
    // Add other properties if needed
  };
}

interface Product {
  Product_ID: number;
  Product_Name: string;
  Product_Detail: string;
  Product_Price: number;
  Product_Image: string; // Added Product_Image field
}

export default function Product_Detail({ params }: PageProps) {
  const router = useRouter();
  const [isAnimation, setIsAnimation] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  // Define state to hold the total price
  const [totalPrice, setTotalPrice] = useState<number>(0);

  // Function to calculate total price
  const calculateTotalPrice = (price: number) => {
    return price * quantity;
  };

  // Update total price whenever the quantity changes
  useEffect(() => {
    if (products.length > 0) {
      const pricePerItem = products[0].Product_Price;
      const newTotalPrice = calculateTotalPrice(pricePerItem);
      setTotalPrice(newTotalPrice);
    }
  }, [quantity, products]);

  const incrementQuantity = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAnimationClick = () => {
    setIsAnimation(!isAnimation);
  };

  const goBack = () => {
    router.back();
  };

  // Function to fetch products from Supabase
  async function fetchProducts() {
    setLoading(true);
    try {
      // Fetch necessary columns including Product_Image
      const { data, error } = await supabase
        .from("products")
        .select(
          "Product_ID, Product_Name, Product_Detail, Product_Price, Product_Image"
        )
        .eq("Product_ID", params.slug);

      if (error) {
        throw error;
      } else {
        setProducts(data as Product[]);
        console.log(data);
      }
    } catch (error) {
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []); // Run once on component mount

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

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (products.length === 0) {
    return <p>No products available</p>;
  }

  return (
    <>
      {products.map((product) => (
        <Fragment key={product.Product_ID}>
          <header className="relative">
            <div className="w-full h-64">
              <img
                className="w-full h-full object-cover"
                src={product.Product_Image}
                alt={product.Product_Name}
              />
            </div>
            {/* Menu header */}
            <div className="flex justify-center item-center">
              {/* Back button */}
              <div
                className="absolute top-8 left-8 py-1 px-1 item-center bg-gray-50 rounded-full"
                onClick={goBack}
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

              {/* favorite button*/}
              <div
                className="absolute top-8 right-8 bg-gray-50 rounded-full p-2"
                onClick={handleAnimationClick}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill={isAnimation ? "#FF8291" : "none"}
                  stroke={isAnimation ? "#FF8291" : "currentColor"}
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`w-6 h-6 ${isAnimation ? "animate-jump" : ""}`}
                >
                  <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
                </svg>
              </div>
            </div>
          </header>

          <section>
            <div className="mx-8 mt-8">
              {/* <div>ID : {params.slug}</div> */}
              <div className="flex items-center justify-between">
                <div className="font-DB_Med text-2xl">
                  {product.Product_Name}
                </div>
                <div className="inline-block bg-green-600 text-white text-base font-DB_Med py-1 px-3 rounded-2xl">
                  ฿{product.Product_Price}
                </div>
              </div>
              <div className="flex items-center justify-between mt-6">
                <div className="pt-2">
                  <div className="font-DB_v4 text-sm">จำนวนดาว</div>

                  <div className="flex items-center pt-1">
                    <svg
                      className="w-4 h-4 text-yellow-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 ms-1 text-yellow-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 ms-1 text-yellow-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 ms-1 text-yellow-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                    <svg
                      className="w-4 h-4 ms-1 text-gray-300 dark:text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="font-DB_v4 text-sm">รีวิว</div>
                  <a
                    href="#"
                    className="text-sm font-DB_v4 text-gray-700 underline hover:no-underline"
                  >
                    73 review
                  </a>
                </div>
                <div className="pt-2">
                  <div className="font-DB_v4 text-sm">ระยะเวลาทำ</div>
                  <div className="flex items-center pt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <p className="font-DB_v4 text-sm">15-30 นาที</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </Fragment>
      ))}

      <section>
        <div className="mx-8 mt-8">
          <div className="font-DB_Med text-xl">ขนาด</div>
          <div className="pt-2">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="size_radio"
                  type="radio"
                  value="ธรรมดา"
                  name="size_radio"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  ธรรมดา
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿0
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="size_radio"
                  type="radio"
                  value="พิเศษ"
                  name="size_radio"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  พิเศษ
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿10
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-8 mt-8">
          <div className="font-DB_Med text-xl">เลือกเนื้อสัตว์</div>
          <div className="pt-2">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="meat_type"
                  type="radio"
                  value="ไก่"
                  name="meat_type"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  ไก่
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿0
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="meat_type"
                  type="radio"
                  value="หมู"
                  name="meat_type"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  หมู
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿0
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="meat_type"
                  type="radio"
                  value="ทะเล"
                  name="meat_type"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  ทะเล
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿10
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-8 mt-8">
          <div className="font-DB_Med text-xl">เพิ่มเติม</div>
          <div className="pt-2">
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="option_add"
                  type="radio"
                  value="ไข่ดาว"
                  name="option_add"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  ไข่ดาว
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿5
              </div>
            </div>
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="option_add"
                  type="radio"
                  value="ไข่เจียว"
                  name="option_add"
                  className="w-4 h-4 accent-green-500"
                />
                <label className="ms-3 font-DB_v4 text-base text-gray-900">
                  ไข่เจียว
                </label>
              </div>
              <div className="text-right text-sm font-DB_Med text-white bg-green-600 py-1 px-3 rounded-2xl">
                ฿5
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7 pb-12">
        <div className="max-w-sm mx-8">
          <div className="text-lg font-DB_Med">รายละเอียดเพิ่มเติม</div>
          <textarea
            id="textarea-label"
            className="mt-5 py-4 px-4 block w-full border border-gray-300 bg-gray-50 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"
            placeholder="เช่น ไม่เอาผัก"
          />
        </div>
      </section>

      <div className="m-12"></div>

      <footer className="fixed bottom-4 left-0 right-0 flex justify-center mt-12 ">
        <div className="me-5 pt-1">
          {/* Input Number */}
          <div
            className="py-2.5 px-3 inline-block bg-white border border-gray-200 rounded-xl"
            data-hs-input-number=""
          >
            <div className="flex items-center gap-x-2.5">
              <button
                type="button"
                onClick={decrementQuantity}
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
                value={quantity}
                readOnly
                data-hs-input-number-input=""
              />
              <button
                type="button"
                onClick={incrementQuantity}
                className="size-6 inline-flex justify-center items-center gap-x-2 text-sm font-medium rounded-md border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none "
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

        <Link
          href="order_product"
          className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white rounded-3xl py-3 px-10 text-lg font-DB_Med"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 mr-2"
          >
            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
          </svg>
          เพิ่มลงตะกร้า ฿{totalPrice}
        </Link>
      </footer>
    </>
  );
}
