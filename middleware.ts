import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const pathname = req.nextUrl.pathname;

    if (pathname.startsWith("/dashboard") && token?.role === "spectator") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/workshops") && token?.role === "spectator") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/admin") && token?.role !== "architect") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname === "/" || pathname === "/login" || pathname === "/register" || pathname.startsWith("/events") || pathname.startsWith("/gamejams") || pathname.startsWith("/resources")) {
          return true;
        }
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/user/:path*",
    "/workshops/:path*",
    "/admin/:path*",
  ],
};
