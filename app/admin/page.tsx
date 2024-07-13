"use client";
import { useState, useEffect } from "react";
import EmblaCarousel from "../components/carousel";
import "../assets/css/embla.css";
import Link from "next/link";
import { GetProfile } from "../auth/GetProfile";
import Loading from "../components/loading";
import option from "./pages/components/option"

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export default function Customer() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    <option />
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    async function checkRole() {
      try {
        setLoading(true);
        const userProfile = await GetProfile();
        if (userProfile !== null) {
          setProfile(userProfile);
        }
      } catch (error) {
        console.error("An error occurred during login:", error);
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <header className="flex justify-center items-center">
        <div className="max-w-md w-full shadow-md pt- rounded-b-3xl overflow-hidden gradient-background">
          <div className="p-4 mt-5 mx-2">
            {profile.pictureUrl && (
              <div className="flex items-center mb-4">
                <img
                  className="w-20 h-20 rounded-full mr-4"
                  src={profile.pictureUrl}
                  alt="Profile"
                />
                <div>
                  <div className="flex items-center justify-center">
                    <div className="pt-1">
                      <div className="text-lg font-DB_Med">
                        สวัสดีคุณ {profile.displayName} 👋🏻
                      </div>
                      <div className="text-md font-DB_Med text-gray-800">
                        วันนี้จะรับประทานอะไรดีคะ?
                      </div>
                    </div>
                    <div className="ms-8">
                      <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100 focus:outline-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6 text-gray-700"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* <div className="text-sm">{profile.statusMessage}</div> */}
                </div>
              </div>
            )}

            <div>
              <div className="relative pt-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="ค้นหาเมนูที่คุณชอบ..."
                  className="pl-10 w-full pr-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:border-indigo-500"
                />
              </div>
              {/* <button
                  onClick={logout}
                  className="block w-full px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
                >
                  Logout
                </button> */}
            </div>
          </div>
        </div>
      </header>

      <main className="">
        {/* Promotions  */}
        <section className="mt-8 flex justify-center mx-6">
          <div className="max-w-sm">
            <div className="bg-white shadow-md rounded-2xl overflow-hidden">
              <EmblaCarousel />
            </div>
          </div>
        </section>

        {/* Menu */}
        <section className="mt-8 grid justify-center grid-cols-2 gap-4 mx-6">
          <Link
            href="admin/pages/menu"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/menu.png"
              className="w-full h-full"
              alt="เมนูอาหาร"
            />
          </Link>
          <Link
            href="admin/pages/promotion"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/promotion.png"
              className="w-full h-full"
              alt="จัดการโปรโมชั่น"
            />
          </Link>
          <Link
            href="admin/pages/listorder"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/listorder.png"
              className="w-full h-full"
              alt="รายการคำสั่งซื้อ"
            />
          </Link>
          <Link
            href="admin/pages/historyOrder"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/historyOrder.png"
              className="w-full h-full"
              alt="ประวัติคำสั่งซื้อ"
            />
          </Link>
          <Link
            href="admin/pages/blacklist"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/blacklist.png"
              className="w-full h-full"
              alt="รายชื่อ Blacklist"
            />
          </Link>
            
      <Link
        href="#"
        className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
        onClick={openModal}
      >
        <img
          src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/option.png"
          className="w-full h-full"
          alt="ตั้งค่า"
        />
      </Link>
        </section>
      </main>

      {/* <footer>
        <Navigator profile={profile} />
      </footer> */}
    </>
  );
}
