"use client";
import { useState, useEffect } from "react";
import { getUserID } from "@/app/auth/getUserID";
import { supabase } from "@/lib/supabase";
import Navigator from "./components/footer";


interface Profile {
  pictureUrl?: string;
  displayName?: string;
  telPhone?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<Profile>({});

  async function getProfile() {
    try {
      const { data, error: userError } = await supabase
        .from("users")
        .select("User_Name, User_Picture, Tel_Phone")
        .eq("User_ID", getUserID())
        .single();

      if (userError) {
        throw userError;
      }

      setProfile({
        displayName: data?.User_Name || "Unknown User",
        pictureUrl: data?.User_Picture || "/default-avatar.png", // Default image if none is provided
        telPhone: data?.Tel_Phone || "No phone number available",
      });
    } catch (error) {
      console.error("An error occurred fetching the profile:", error);
    }
  }

  useEffect(() => {
    getProfile();
  }, []);

  return (
    <>
      <header className="min-h-screen bg-white flex flex-col items-center">
        <div className="relative w-full">
          {/* Profile Background */}
          <div className="absolute -top-10 left-0 w-full h-[200px] bg-blue-300 profile-background py-[8rem] rounded-b-3xl"></div>

          {/* Profile Section */}
          <div className="relative bg-white shadow-md rounded-b-3xl p-6 mt-[10rem] max-w-full z-10">
            <div className="flex justify-center -mt-[60px]">
              <img
                src={profile.pictureUrl}
                alt="Profile"
                className="rounded-full h-24 w-24 border-4 border-white shadow-lg"
              />
            </div>
            <div className="text-center mt-4">
              <h2 className="text-2xl font-DB_Med">{profile.displayName}</h2>
              <p className="text-gray-500 font-DB_Med mt-2">เบอร์โทร {profile.telPhone}</p>
            </div>
          </div>
        </div>
      </header>

      <section className="mx-8 mt-8">

      </section>

      <footer className="mt-12 pt-12">
        <Navigator profile={profile} />
      </footer>
    </>
  );
}
