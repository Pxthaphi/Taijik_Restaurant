"use client";
import { useState, useEffect } from "react";
import Product_Hot from "./components/product_hot";
import EmblaCarousel from "../components/carousel";
import Link from "next/link";
import { GetProfile } from "../auth/GetProfile";
import Loading from "../components/loading";
import Navigator from "./components/footer";
import ModalTelphone from "./components/modal-telephone";
import { getUserID } from "@/app/auth/getUserID";
import { getUserType } from "@/app/auth/GetType";
import { supabase } from "@/lib/supabase";
import Swal from 'sweetalert2';
import liff from "@line/liff";
import { Badge, Button } from "@nextui-org/react";

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export default function Customer() {
  const [profile, setProfile] = useState<Profile>({});
  const [loading, setLoading] = useState(true);
  const [telephone, setTelephone] = useState("");

  useEffect(() => {
    async function checkUser() {
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
  
    async function checkTelephone() {
      try {
        const { data, error: userError } = await supabase
          .from("users")
          .select("Tel_Phone")
          .eq("User_ID", getUserID())
          .single();
  
        if (userError) {
          throw userError;
        }
  
        setTelephone(data?.Tel_Phone || "");
      } catch (error) {
        console.error("An error occurred fetching the telephone number:", error);
      }
    }
  
    async function checkBlacklist() {
      try {
        const { data, error: userError } = await supabase
          .from("users")
          .select("User_Ticket")
          .eq("User_ID", getUserID())
          .single();
  
        if (userError) {
          throw userError;
        }
  
        const userTicket = data?.User_Ticket;
  
        if (userTicket > 2) {
          Swal.fire({
            title: 'ติด Blacklist',
            text: 'คุณติด Blacklist แล้ว หากต้องการใช้บริการใหม่อีกครั้ง กรุณาไปยืนยันที่หน้าร้าน!!',
            icon: 'warning',
            timer: 5000,
            timerProgressBar: true,
            showConfirmButton: false
          }).then(() => {
            setTimeout(() => {
              liff.closeWindow();
            }, 5000);
          });
          
        }else if (userTicket != 0){
          const total = 3 - userTicket;
          Swal.fire({
            title: 'เตือน!!',
            html: `คุณติด Blacklist แล้วจำนวน ${userTicket} ครั้ง<br>คุณเหลือโอกาสอีก ${total} ครั้ง`,
            icon: 'warning',
            showConfirmButton: true,
            confirmButtonColor: '#36A71C',
            confirmButtonText: 'ตกลง'
          });
        }
      } catch (error) {
        console.error("An error occurred fetching the blacklist:", error);
      }
    }

    console.log("type user : ",getUserType());
  
    checkUser();
    checkTelephone();
    checkBlacklist();
  }, []);
  

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
                        วันนี้จะรับประทานเมนูอะไรดี?
                      </div>
                    </div>
                    <div className="ms-8">
                      <Badge content="99+" shape="circle" color="danger" className="border text-xs mt-1 mx-0.5">
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
            </div>
          </div>
        </div>
      </header>

      <main className="animate-fade-up animate-duration-[1000ms]">
        {telephone == "" && <ModalTelphone />}

        {/* Promotions  */}
        <section className="mt-8 flex justify-center mx-6">
          <div className="max-w-sm">
            <div className="bg-white shadow-md rounded-2xl overflow-hidden">
              <EmblaCarousel />
            </div>
          </div>
        </section>

        {/* Menu */}
        <section className="mt-8 flex justify-center gap-4 mx-6">
          <Link
            href="customer/pages/product"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              className="w-full h-full"
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/order.png"
              alt="สั่งอาหาร"
            />
          </Link>
          <Link
            href="customer/pages/random"
            className="flex-1 max-w-sm bg-white shadow-md rounded-3xl overflow-hidden"
          >
            <img
              src="https://fsdtjdvawodatbcuizsw.supabase.co/storage/v1/object/public/Promotions/component/random.png"
              className="w-full h-full"
              alt="สุ่มอาหาร"
            />
          </Link>
        </section>

        {/* Show Product Hot */}
        <section>
          <div className="flex items-center justify-between mx-6 mt-7">
            <div className="font-DB_Med text-2xl animate-wiggle animate-duration-[1000ms] animate-infinite animate-ease-in-out">
              เมนูขายดี🔥
            </div>
            <Link
              href="customer/pages/product"
              className="inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-DB_Med py-1 px-3 rounded-2xl"
            >
              ดูทั้งหมด
            </Link>
          </div>

          <div className="mx-6 mt-6">
            <Product_Hot />
          </div>
        </section>
      </main>

      <footer className="mt-12 pt-12">
        <Navigator profile={profile} />
      </footer>
    </>
  );
}
