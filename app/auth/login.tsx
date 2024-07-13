import liff from "@line/liff";
import { supabase } from "@/lib/supabase";
import Cookies from "js-cookie";


export async function login() {
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
      if (userProfile) {
        const User_ID = userProfile.userId;
        const User_Name = userProfile.displayName;
        const User_Picture = userProfile.pictureUrl;
        const User_Type = "customer"; // Assuming default user type is "customer"

        Cookies.set("UserID", User_ID);

        // Check if the user already exists in the database
        const { data: existingUser, error: userError } = await supabase
          .from("users")
          .select("*")
          .eq("User_ID", User_ID);

        if (userError) {
          console.error("Error checking existing user:", userError);
          throw userError;
        }

        if (existingUser && existingUser.length > 0) {
          console.log("User already exists:", existingUser[0]);
        } else {
          // User does not exist, insert the user into the database
          try {
            const { data, error } = await supabase
              .from("users")
              .insert([{ User_ID, User_Name, User_Type, User_Picture }]);

            console.log("New user added:", data);
          } catch (insertError) {
            console.error("Error handling Supabase data:", insertError);
            throw insertError;
          }
        }

        const { data: userData, error: userFetchError } = await supabase
          .from("users")
          .select("User_Type")
          .eq("User_ID", User_ID);

        if (userFetchError) {
          console.error("Error fetching user data:", userFetchError);
          throw userFetchError;
        }

        if (userData && userData.length > 0) {
          return userData[0].User_Type;
        }
      }
    }
  } catch (error) {
    console.error("LIFF initialization or profile retrieval failed:", error);
    // Handle error
  }
}
