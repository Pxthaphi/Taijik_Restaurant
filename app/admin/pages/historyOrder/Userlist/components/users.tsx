import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { PostgrestError } from "@supabase/supabase-js";
import OptionUsers from "./opiton";

// Define the User interface
interface User {
  User_ID: string;
  User_Name: string;
  User_Type: string;
  User_Picture: string;
  User_Ticket: number;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch users from Supabase
  async function fetchUsers() {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("User_Type", "customer")
        .order("User_ID");

      if (error) {
        throw error;
      } else {
        setUsers(data as User[]);
        console.table(data);
      }
    } catch (error) {
      setError((error as PostgrestError).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel("realtime-users")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("Change received!", payload);
          fetchUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []); // Run once on component mount

  if (loading) {
    return (
      <div className="text-center">
        <div role="status">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-orange-400"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (users.length === 0) {
    return <p>ไม่พบผู้ใช้</p>;
  }

  return (
    <div className="grid justify-center grid-cols-2 gap-4">
      {users.map((user) => (
        <UserCard key={user.User_ID} user={user} />
      ))}
    </div>
  );
}

function UserCard({ user }: { user: User }) {
  return (
    <div>
      <div className="bg-white border rounded-xl shadow-sm sm:flex">
        <div className="flex-shrink-0 relative w-full rounded-t-xl overflow-hidden pt-[40%] sm:rounded-s-xl sm:max-w-60 md:rounded-se-none md:max-w-xs">
          <img
            className="absolute top-0 start-0 w-full h-full object-cover"
            src={user.User_Picture}
            alt={user.User_Name}
          />{" "}
          <div className="w-full h-full bg-gray-200"></div>
        </div>
        <div className="flex flex-wrap w-full">
          <div className="p-4 flex flex-col h-full w-full sm:p-7">
            <h3 className="text-xl font-bold text-gray-800">
              {user.User_Name}
            </h3>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-DB_Med">ประเภทผู้ใช้</p>
              <p className="text-base">
                {user.User_Type == "customer" && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-DB_Med bg-green-100 text-green-800">
                    ลูกค้า
                  </span>
                )}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm font-DB_Med">สถานะ Blacklist</p>
              <p className="text-base">
                {user.User_Ticket == 3 && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-DB_Med bg-orange-500 text-white">
                    ติด Blacklist
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-DB_Med bg-green-100 text-green-800">
                  ปกติ
                </span>
              </p>
            </div>
            {/* <div className="mt-5 flex justify-end space-x-4">
              <OptionUsers userId={user.User_ID} />
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
