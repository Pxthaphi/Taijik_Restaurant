"use client";
import Link from "next/link";

export default function Favorite() {
  return (
    <header className="mx-8 mt-8 flex justify-center item-center">
      <Link href="../" className="absolute py-1 px-1 top-8 left-8">
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
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
      </Link>
      <div className="font-DB_Med text-2xl pt-0.5">รายการโปรด</div>
    </header>

  );
}
