"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Users from "./components/users";

export default function Blacklist() {
  const router = useRouter();

  const goBack = () => {
    router.push('../');
  };
  return (
    <>
      <header className="mx-8 mt-8 flex justify-center item-center">
        <div className="absolute py-1 px-1 top-8 left-8" onClick={goBack}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7 cursor-pointer"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </div>
        <div className="font-DB_Med text-2xl pt-0.5">รายชื่อลูกค้า</div>
      </header>

      <section>
        
      </section>

      <section className="px-8 mt-8">
        <Users />
      </section>
    </>
  );
}
