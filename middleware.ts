import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/app"];
const publicOnlyPaths = ["/login", "/signup", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("task_pilot_auth_token");

  // If the user is logged in, redirect them away from login/signup pages
  if (sessionCookie && publicOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // If the user is not logged in, redirect them away from protected pages
  if (!sessionCookie && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

// Matcher to apply the middleware to relevant pages
export const config = {
  matcher: ["/app/:path*", "/login", "/signup", "/verify"],
};
