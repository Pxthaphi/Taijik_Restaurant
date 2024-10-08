"use client";
import { useState, useEffect } from "react";
import EmblaCarousel from "../components/carousel";
import "../assets/css/embla.css";
import Link from "next/link";
import { GetProfile } from "../auth/GetProfile";
import Loading from "../components/loading";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge, Button } from "@nextui-org/react";
import DialogDemo from "./pages/components/modal-dialog";
import { Tektur } from "next/font/google";

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export default function Customer() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const openModal = () => {
    setIsModalOpen(true);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <header className="flex justify-center items-center">
        <div className="max-w-md w-full shadow-md rounded-b-3xl overflow-hidden gradient-background">
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
                        วันนี้เป็นอย่างไรบ้าง เหนื่อยมั้ย?
                      </div>
                    </div>
                    <div className="ms-8">
                      <Badge
                        content="99+"
                        shape="circle"
                        color="danger"
                        className="border text-xs mt-1 mx-0.5"
                      >
                        <Button
                          radius="full"
                          isIconOnly
                          aria-label="more than 99 notifications"
                          variant="light"
                          className="text-white"
                        >
                          <svg
                            fill="none"
                            height="24"
                            viewBox="0 0 24 24"
                            width="24"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 mt-2"
                          >
                            <path
                              clipRule="evenodd"
                              d="M18.707 8.796c0 1.256.332 1.997 1.063 2.85.553.628.73 1.435.73 2.31 0 .874-.287 1.704-.863 2.378a4.537 4.537 0 01-2.9 1.413c-1.571.134-3.143.247-4.736.247-1.595 0-3.166-.068-4.737-.247a4.532 4.532 0 01-2.9-1.413 3.616 3.616 0 01-.864-2.378c0-.875.178-1.682.73-2.31.754-.854 1.064-1.594 1.064-2.85V8.37c0-1.682.42-2.781 1.283-3.858C7.861 2.942 9.919 2 11.956 2h.09c2.08 0 4.204.987 5.466 2.625.82 1.054 1.195 2.108 1.195 3.745v.426zM9.074 20.061c0-.504.462-.734.89-.833.5-.106 3.545-.106 4.045 0 .428.099.89.33.89.833-.025.48-.306.904-.695 1.174a3.635 3.635 0 01-1.713.731 3.795 3.795 0 01-1.008 0 3.618 3.618 0 01-1.714-.732c-.39-.269-.67-.694-.695-1.173z"
                              fill="currentColor"
                              fillRule="evenodd"
                            />
                          </svg>
                        </Button>
                      </Badge>
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
              className="w-full h-full object-cover"
              alt="เมนูอาหาร"
            />
          </Link>
          <Link
            href="admin/pages/promotion"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/promotion.png"
              className="w-full h-full object-cover"
              alt="จัดการโปรโมชั่น"
            />
          </Link>
          <Link
            href="admin/pages/listorder"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/listorder.png"
              className="w-full h-full object-cover"
              alt="รายการคำสั่งซื้อ"
            />
          </Link>
          <Link
            href="admin/pages/historyOrder"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/historyOrder.png"
              className="w-full h-full object-cover"
              alt="ประวัติคำสั่งซื้อ"
            />
          </Link>
          <Link
            href="admin/pages/blacklist"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/blacklist.png"
              className="w-full h-full object-cover"
              alt="รายชื่อ Blacklist"
            />
          </Link>

          <Button
            onClick={() => openModal()}
            className="flex-1 w-full h-full bg-white shadow-md rounded-3xl overflow-hidden p-0"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/option.png"
              className="w-full h-full object-cover"
              alt="ตั้งค่า"
            />
          </Button>

          {isModalOpen && <DialogDemo setIsModalOpen={setIsModalOpen} />}

          <Sheet>
            <SheetTrigger>Open</SheetTrigger>
            <SheetContent side={"bottom"} className="rounded-t-2xl">
              <SheetHeader>
                <SheetTitle>Are you absolutely sure?</SheetTitle>
                <SheetDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </SheetDescription>
              </SheetHeader>
            </SheetContent>
          </Sheet>
        </section>
      </main>

      {/* <footer>
        <Navigator profile={profile} />
      </footer> */}
    </>
  );
}
