import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only guard /dashboard routes
  if (!pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  const role = request.cookies.get("role")?.value;
  const token = request.cookies.get("token")?.value;

  // Root /dashboard redirect
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (role === "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "VENDOR") {
      return NextResponse.redirect(new URL("/dashboard/vendor", request.url));
    }
    if (role === "USER") {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }
    return NextResponse.redirect(new URL(`/sign-in?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  // If token and role exist in cookies, enforce edge boundaries
  if (token && role) {
    if (pathname.startsWith("/dashboard/admin") && role !== "ADMIN") {
      const target = role === "VENDOR" ? "/dashboard/vendor" : "/dashboard/customer";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname.startsWith("/dashboard/vendor") && role !== "VENDOR") {
      const target = role === "ADMIN" ? "/dashboard/admin" : "/dashboard/customer";
      return NextResponse.redirect(new URL(target, request.url));
    }

    if (pathname.startsWith("/dashboard/customer") && role !== "USER") {
      const target = role === "ADMIN" ? "/dashboard/admin" : "/dashboard/vendor";
      return NextResponse.redirect(new URL(target, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
