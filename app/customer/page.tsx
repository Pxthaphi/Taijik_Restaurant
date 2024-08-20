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
import { supabase } from "@/lib/supabase";
import Swal from 'sweetalert2';
import liff from "@line/liff";



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
                  <div className="flex items-center justify-between">
                    <div className="pt-1">
                      <div className="text-lg font-DB_Med">
                        สวัสดีคุณ {profile.displayName} 👋🏻
                      </div>
                      <div className="text-md font-DB_Med text-gray-800">
                        วันนี้จะรับประทานอะไรดีคะ?
                      </div>
                    </div>
                    <div className="ms-12">
                      <button className="flex items-center justify-center px-4 py-3 bg-gray-100 rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-100">
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
                  className="pl-10 w-full pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:border-indigo-500"
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
