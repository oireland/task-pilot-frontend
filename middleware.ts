import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/app"];
const publicOnlyPaths = ["/login", "/signup", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- 1. Log all cookies to see what the server receives ---
  console.log("Middleware running for path:", pathname);
  console.log("Cookies received:", request.cookies.getAll());

  const sessionCookie = request.cookies.get("task_pilot_auth_token");

  // Also log the specific cookie we're looking for
  console.log("Auth token cookie:", sessionCookie);

  // If the user is logged in, redirect them away from login/signup pages
  if (sessionCookie && publicOnlyPaths.includes(pathname)) {
    console.log("User is logged in, redirecting from public page to /app");
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // If the user is not logged in, redirect them away from protected pages
  if (!sessionCookie && protectedPaths.some((p) => pathname.startsWith(p))) {
    console.log(
      "User is not logged in, redirecting from protected page to /login"
    );
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  console.log("Allowing request to proceed.");
  return NextResponse.next();
}

// Matcher to apply the middleware to relevant pages
export const config = {
  matcher: ["/app/:path*", "/login", "/signup", "/verify"],
};
