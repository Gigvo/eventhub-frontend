import { NextRequest, NextResponse } from "next/server";

// Define public routes (accessible without authentication)
const PUBLIC_ROUTES = ["/", "/login", "/register", "/katalog-event"];

// Define protected routes (requires authentication)
const PROTECTED_ROUTES = [
  "/dashboard",
  "/buat-event",
  "/cari-sponsor",
  "/proposal-builder",
  "/proposal-smart-review",
  "/token-management",
];

// Routes that should redirect to dashboard if already authenticated
const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Get Firebase ID token from cookies or Authorization header
  const token =
    request.cookies.get("firebaseToken")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  const isAuthenticated = !!token;

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Check if current route is protected
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Check if current route is auth route
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  // Allow public routes for everyone
  if (isPublicRoute) {
    // If authenticated user tries to access auth pages, redirect to dashboard
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Block protected routes if not authenticated
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Allow everything else if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
