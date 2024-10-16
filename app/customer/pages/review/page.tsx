"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, Tab } from "@nextui-org/react";
import { Card, Progress } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { FaStar } from "react-icons/fa"; // Using react-icons for star icons
import { supabase } from "@/lib/supabase";
import Loading from "../../../components/loading";


interface Review {
  Review_ID: number;
  Product_Name: string;
  Review_Detail: string;
  Review_Star: number;
  Review_Time: string;
  User_Name: string;
  User_Picture: string;
}

export default function Review() {
  const router = useRouter();
  const [state, setState] = useState({
    selected: "aboutRes",
    color: "primary" as "primary" | "warning" | "success" | "danger",
    textColor: "",
    loading: true,
    error: null as string | null,
  });
  const [rating, setRating] = useState<number | null>(null); // ค่า rating ที่เลือก
  const [hover, setHover] = useState<number | null>(null); // ค่า hover ขณะชี้ที่ดาว
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch reviews from Supabase
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);

      // Query to get reviews and join user and product details
      const { data, error } = await supabase
        .from("reviews")
        .select(
          `
            Review_ID,
            Review_Detail,
            Review_Star,
            Review_Time,
            products!inner ( Product_Name ),
            users!inner ( User_Name, User_Picture )
        `
        )
        .order("Review_Time", { ascending: false });

      if (error) {
        setError("Error fetching reviews.");
        console.error("Error fetching reviews:", error);
      } else if (data) {
        console.table(data);

        // Flatten the structure to directly store User_Name, User_Picture, and Product_Name in the review object
        const formattedData = data.map((review: any) => ({
          Review_ID: review.Review_ID,
          Review_Detail: review.Review_Detail,
          Review_Star: review.Review_Star,
          Review_Time: review.Review_Time,
          Product_Name: review.products?.Product_Name || "Unknown Product", // Directly access the product name
          User_Name: review.users?.User_Name || "Unknown User", // Directly access the user name
          User_Picture: review.users?.User_Picture || "", // Directly access the user picture
        }));

        setReviews(formattedData);
      }

      setLoading(false);
    };

    fetchReviews();
  }, []);

  // Function for rating selection
  const handleRatingClick = (star: number) => {
    setRating(rating === star ? null : star);
  };

  const handleTabChange = (key: any) => {
    setState((prevState) => ({ ...prevState, selected: key }));
  };

  const MapAPi = process.env.NEXT_PUBLIC_Map_API;

  const getStatus = (tab: string) => {
    switch (tab) {
      case "aboutRes":
        return 1;
      case "review":
        return 2;
      default:
        return 1;
    }
  };

  useEffect(() => {
    setState((prevState) => ({ ...prevState, loading: true, error: null }));

    switch (state.selected) {
      case "aboutRes":
        setState((prevState) => ({
          ...prevState,
          color: "success",
          textColor: "text-green-500",
        }));
        break;
      case "review":
        setState((prevState) => ({
          ...prevState,
          color: "success",
          textColor: "text-green-500",
        }));
        break;
      default:
        setState((prevState) => ({
          ...prevState,
          color: "success",
          textColor: "text-green-500",
        }));
    }
  }, [state.selected]);

  // Loading and error handling
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <p>{error}</p>;
  }

  const navigateBack = () => {
    router.back();
  };

  return (
    <>
      <header className="p-4 shadow-md bg-white">
        <div className="flex items-center justify-between ">
          <div
            onClick={navigateBack}
            className="cursor-pointer text-gray-700 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6 me-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            <h1 className="font-DB_Med text-xl ml-2">รายละเอียดร้านอาหาร</h1>
          </div>
        </div>
        <div className="mt-6">
          <Tabs
            variant="underlined"
            selectedKey={state.selected}
            onSelectionChange={handleTabChange}
            fullWidth
            className="me-8 flex justify-between font-DB_Med text-xl"
            color={state.color}
          >
            <Tab key="aboutRes" title="เกี่ยวกับร้าน" className="text-lg" />
            <Tab key="review" title="รีวิว" className="text-lg" />
          </Tabs>
        </div>
      </header>

      <section className="mt-6 mx-6">
        <div className="mt-6">
          {state.selected === "aboutRes" && (
            <div>
              <div className="mt-4 rounded-xl ">
                <iframe
                  className="w-full h-60 rounded-2xl"
                  src={`https://www.google.com/maps/embed/v1/place?q=ร้านครัวพี่บ้านน้อง&key=${MapAPi}`}
                ></iframe>
              </div>
              <div className="mt-5">
                <h2 className="font-DB_Med text-2xl text-gray-700 ml-2">
                  ร้านอาหารใต้จิก
                </h2>
                <a
                  href="tel:+66800498858"
                  className="flex items-center justify-start bg-green-100 rounded-full mt-3 p-1 w-fit"
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
              <div className="rounded-xl mt-5 bg-white p-4 shadow-md">
                {/* Restaurant Name Section */}
                <div className="flex justify-start items-center">
                  <div className="bg-green-100 rounded-full p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1em"
                      height="1em"
                      viewBox="0 0 24 24"
                      className="text-green-500 w-6 h-6"
                    >
                      <path
                        fill="currentColor"
                        d="M12 14c2.206 0 4-1.794 4-4s-1.794-4-4-4s-4 1.794-4 4s1.794 4 4 4m0-6c1.103 0 2 .897 2 2s-.897 2-2 2s-2-.897-2-2s.897-2 2-2"
                      ></path>
                      <path
                        fill="currentColor"
                        d="M11.42 21.814a1 1 0 0 0 1.16 0C12.884 21.599 20.029 16.44 20 10c0-4.411-3.589-8-8-8S4 5.589 4 9.995c-.029 6.445 7.116 11.604 7.42 11.819M12 4c3.309 0 6 2.691 6 6.005c.021 4.438-4.388 8.423-6 9.73c-1.611-1.308-6.021-5.294-6-9.735c0-3.309 2.691-6 6-6"
                      ></path>
                    </svg>
                  </div>
                  <h2 className="font-DB_Med text-xl text-gray-700 ml-2">
                    ข้อมูลที่อยู่ร้าน
                  </h2>
                </div>

                {/* Address Section */}
                <p className="px-9 mt-2 text-sm text-gray-600 font-DB_Med">
                  142/1 อำเภอ ป่าพะยอม พัทลุง 93210
                </p>

                {/* Contact and Working Hours */}
                <div className="mt-4">
                  <div className="flex items-center justify-start">
                    <div className="bg-green-100 rounded-full p-1">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                        className="text-green-500 w-5 h-5"
                      >
                        <g fill="none">
                          <path
                            fill="currentColor"
                            d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2m0 4a1 1 0 0 0-1 1v5a1 1 0 0 0 .293.707l3 3a1 1 0 0 0 1.414-1.414L13 11.586V7a1 1 0 0 0-1-1"
                          ></path>
                        </g>
                      </svg>
                    </div>
                    <p className="font-DB_Med text-xl text-gray-700 ml-2">
                      เวลาทำการ
                    </p>
                  </div>
                  <p className="px-9 mt-2 text-sm text-gray-600 font-DB_Med">
                    ทุกวัน เวลา 05:30 - 11:30 น.
                  </p>
                </div>
              </div>
            </div>
          )}

          {state.selected === "review" && (
            <>
              <div className="flex justify-center">
                <Card className="max-w-full shadow-lg p-6 w-full">
                  <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-DB_Med text-green-600">
                      รีวิว ร้านใต้จิก
                    </h1>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="text-[4rem] font-DB_Med">4.8</span>
                    <span className="text-lg text-gray-500 ml-3 font-DB_Med mt-8">
                      จาก 297 เรตติ้ง
                    </span>
                  </div>
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-[1rem]">
                        ⭐⭐⭐⭐⭐
                      </span>
                      <Progress value={(267 / 297) * 100} color="success" />
                      <span className="ml-[0.9rem] font-DB_Med">267</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-[2.4rem]">
                        ⭐⭐⭐⭐
                      </span>
                      <Progress value={(11 / 297) * 100} color="success" />
                      <span className="ml-[1.3rem] font-DB_Med">11</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-[3.8rem]">
                        ⭐⭐⭐
                      </span>
                      <Progress value={(5 / 297) * 100} color="success" />
                      <span className="ml-7 font-DB_Med">5</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-[5.1rem]">⭐⭐</span>
                      <Progress value={(6 / 297) * 100} color="warning" />
                      <span className="ml-7 font-DB_Med">6</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-500 mr-[6.5rem]">⭐</span>
                      <Progress value={(8 / 297) * 100} color="danger" />
                      <span className="ml-7 font-DB_Med">8</span>
                    </div>
                  </div>

                  {/* <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      คุณภาพอาหารดี 93
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      ถูกสุขลักษณะ 76
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      บรรจุภัณฑ์เหมาะสม 97
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      ปริมาณคุ้มค่า 78
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      รสชาติถูกปาก 85
                    </div>
                    <div className="bg-gray-100 rounded-full p-2 text-center text-xs font-DB_Med">
                      ออเดอร์ถูกต้อง 81
                    </div>
                  </div> */}
                </Card>
              </div>
              <div className="flex flex-col justify-center items-center space-y-4 py-5">
                <div className="flex justify-center items-center space-x-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRatingClick(star)} // เลือกหรือยกเลิกการเลือก
                      onMouseEnter={() => setHover(star)} // จัดการ hover
                      onMouseLeave={() => setHover(null)} // จัดการ mouse leave
                      className={`flex items-center justify-center w-12 h-9 border-2 rounded-2xl p-1 ${
                        hover === star || rating === star // กำหนดให้ดาวที่ hover หรือเลือกเปลี่ยนสี
                          ? "bg-yellow-100 border-yellow-500"
                          : "bg-gray-50 border-gray-100"
                      }`}
                    >
                      <span className="text-gray-700 font-bold mr-2">
                        {star}
                      </span>
                      <FaStar
                        className={`${
                          hover === star || rating === star // กำหนดให้ไอคอนดาวเปลี่ยนสีเมื่อถูก hover หรือเลือก
                            ? "text-yellow-500"
                            : "text-gray-400"
                        } text-xl`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              {reviews.map((review) => (
                <div key={review.Review_ID} className="mt-3 my-5">
                  <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-full text-gray-600">
                    <div className="flex justify-between items-center space-x-4">
                      <div className="flex">
                        {/* Avatar Section */}
                        {review.User_Picture ? (
                          <img
                            className="w-12 h-12 rounded-full"
                            src={review.User_Picture}
                            alt={review.User_Name}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200" />
                        )}
                        <div className="items-start ml-3">
                          <h4 className="text-lg font-semibold font-DB_Med">
                            {review.User_Name || "Unknown User"}
                          </h4>
                          <p className="text-sm text-gray-400 font-DB_Med">
                            {new Date(review.Review_Time).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="ml-auto">
                        {/* Star Rating Section */}
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                i < review.Review_Star
                                  ? "text-yellow-400 text-xl"
                                  : "text-gray-400 text-xl"
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {/* Review Content */}
                    <div className="mt-4">
                      {review.Product_Name ? (
                        <div className="flex items-center justify-start bg-green-100 rounded-full mt-3 p-1 w-fit">
                          <div className="flex items-center bg-green-600 rounded-full p-1">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="1em"
                              height="1em"
                              viewBox="0 0 20 20"
                              className="w-4 h-4 text-white"
                            >
                              <path
                                fill="currentColor"
                                d="M4.505 2h-.013a.5.5 0 0 0-.176.036a.5.5 0 0 0-.31.388C3.99 2.518 3.5 5.595 3.5 7c0 .95.442 1.797 1.13 2.345c.25.201.37.419.37.601v.5q0 .027-.003.054c-.027.26-.151 1.429-.268 2.631C4.614 14.316 4.5 15.581 4.5 16a2 2 0 1 0 4 0c0-.42-.114-1.684-.229-2.869a302 302 0 0 0-.268-2.63L8 10.446v-.5c0-.183.12-.4.37-.601A3 3 0 0 0 9.5 7c0-1.408-.493-4.499-.506-4.577a.5.5 0 0 0-.355-.403A.5.5 0 0 0 8.51 2h-.02h.001a.505.505 0 0 0-.501.505v4a.495.495 0 0 1-.99.021V2.5a.5.5 0 0 0-1 0v4l.001.032a.495.495 0 0 1-.99-.027V2.506A.506.506 0 0 0 4.506 2M11 6.5A4.5 4.5 0 0 1 15.5 2a.5.5 0 0 1 .5.5v6.978l.02.224a626 626 0 0 1 .228 2.696c.124 1.507.252 3.161.252 3.602a2 2 0 1 1-4 0c0-.44.128-2.095.252-3.602c.062-.761.125-1.497.172-2.042l.03-.356H12.5A1.5 1.5 0 0 1 11 8.5zM8.495 2h-.004z"
                              ></path>
                            </svg>
                          </div>
                          <p className="text-[15px] font-DB_Med text-green-600 ml-2 mr-2">
                            <p className="font-DB_Med">{review.Product_Name}</p>
                          </p>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 font-DB_Med">
                          Unknown Product
                        </p>
                      )}
                      <p className="text-gray-400 text-sm mt-2 font-DB_Med">
                        {review.Review_Detail}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </section>
    </>
  );
}
