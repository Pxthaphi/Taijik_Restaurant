import liff from "@line/liff";
import { supabase } from "@/lib/supabase";

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export async function login(): Promise<Profile | null> {
  try {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
    if (!liffId) {
      console.error("LINE_LIFF_ID is not defined.");
      return null;
    }

    await liff.init({ liffId });
    if (!liff.isLoggedIn()) {
      liff.login();
      return null; // Return null ถ้าเกิด login ไม่ผ่าน ให้ทำการวน login ซ้ำ
    } else {
      const profile = await liff.getProfile();
      console.log("Login success: ", profile);
      if (profile) {
        const User_ID = profile.userId;
        const User_Name = profile.displayName;
        const User_Type = "customer";
        try {
          const { data, error } = await supabase.from("users").select("*");

          if (!error) {
            // ดึงข้อมูลจาก database ขึ้นมาเช็คว่ามีรายชื่อซ้ำมั้ย ถ้าหากไม่ซ้ำกับ database ให้ทำการเพิ่มข้อมูล
            // หากข้อมูลซ้ำ ไม่ต้องเพิ่มข้อมูลลง database
            if (data && data.length === 0) {
              const { data: newUser, error: userError } = await supabase
                .from("users")
                .insert([{ User_ID, User_Name, User_Type }]);
              if (userError) {
                throw userError;
              }
              console.log("New user added:", newUser);
            } else {
              // console.log("User already exists:", data[0]);
            }
          } else {
            // Error fetching data
            throw error;
          }
        } catch (error) {
          console.error("Error handling Supabase data:", error);
          throw error;
        }
      }
      return profile; // Return profile when logged in
    }
  } catch (error) {
    console.error("LIFF initialization or profile retrieval failed:", error);
    return null;
  }
}