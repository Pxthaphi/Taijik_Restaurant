"use client";
import { useState, useEffect } from "react";
import liff from "@line/liff";
import Loading from "./components/loading";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const login = async () => {
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
          if (userProfile) {
            const User_ID = userProfile.userId;
            const User_Name = userProfile.displayName;
            const User_Type = "customer"; // Assuming default user type is "customer"

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
                  .insert([{ User_ID, User_Name, User_Type }]);

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
              const userType = userData[0].User_Type;
              if (userType === "admin") {
                // User is an admin, redirect to admin page
                router.push(`/admin`);
              } else {
                // User is not an admin, redirect to customer page
                router.push(`/customer`);
              }
            }
          }
        }
      } catch (error) {
        console.error(
          "LIFF initialization or profile retrieval failed:",
          error
        );
        // Handle error
      } finally {
        setLoading(false);
      }
    };
    login();
  }, [router]);

  if (loading) {
    return <Loading />;
  }
  return null;
}
