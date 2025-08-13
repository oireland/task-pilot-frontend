import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define your protected and public routes
const protectedPaths = ["/app", "/app/settings"];
const publicOnlyPaths = ["/login", "/signup", "/verify"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("task_pilot_auth_token");

  // --- Redirect logged-in users from public-only pages ---
  if (sessionCookie && publicOnlyPaths.includes(pathname)) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  // --- Redirect logged-out users from protected pages ---
  if (!sessionCookie && protectedPaths.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow the request to proceed
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
