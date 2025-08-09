import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 1. Define your public routes
const publicPaths = [
  "/", // Landing page
  "/login",
  "/signup",
  "/verify",
  // Add any other public paths here (e.g., /pricing, /contact)
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 2. Check if the current path is a public one
  if (publicPaths.includes(pathname)) {
    // If it's a public path, allow the request to proceed
    return NextResponse.next();
  }

  // 3. For all other (protected) routes, check for the session cookie
  const sessionCookie = request.cookies.get("task_pilot_auth_token"); // <-- Use your actual cookie name

  if (!sessionCookie) {
    // If no cookie, redirect to the login page
    const loginUrl = new URL("/login", request.url);
    // You can add a 'from' query parameter to redirect back after login
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. If the cookie exists, let the request proceed
  return NextResponse.next();
}

// The matcher prevents the middleware from running on static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
