"use client";
import { useState, useEffect } from "react";
import liff from "@line/liff";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Cookies from 'js-cookie';


interface Profile {
  userId?: string;
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkRole = async () => {
      setLoading(true);
      try {
        const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
        if (!liffId) {
          throw new Error("LINE_LIFF_ID is not defined.");
        }
    
        await liff.init({ liffId });
        if (!liff.isLoggedIn()) {
          liff.login();
        } else {
          const userProfile = await liff.getProfile();
    
          const { data, error } = await supabase
            .from("users")
            .select("User_Type")
            .eq("User_ID", userProfile.userId)
            .single();
    
          if (error) {
            throw error;
          }
    
          if (data.User_Type === "admin") {
            router.push(`/admin`);
          } else {
            router.push(`/customer`);
          }
        }
      } catch (error) {
        console.error("LIFF initialization or profile retrieval failed:", error);
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    

    checkRole();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  return null;
}
