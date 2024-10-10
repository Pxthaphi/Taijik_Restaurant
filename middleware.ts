import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const cookies = req.cookies.get("userType")?.value;

  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (cookies === "admin") {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/", req.url));
    }
  } else if (req.nextUrl.pathname.startsWith("/customer")) {
    if (cookies === "customer") {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/customer"],
};
