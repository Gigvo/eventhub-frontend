import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/register", "/katalog-event"];

const PROTECTED_ROUTES = [
  "/dashboard",
  "/buat-event",
  "/cari-sponsor",
  "/proposal-builder",
  "/proposal-smart-review",
  "/token-management",
  "/pengaturan",
  "/katalog-event-eo",
  "/pesan",
  "/events",
  "/proposal-masuk",
  "/kerjasama-aktif",
  "/tersimpan",
];

const AUTH_ROUTES = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const token =
    request.cookies.get("firebaseToken")?.value ||
    request.headers.get("Authorization")?.replace("Bearer ", "");

  const isAuthenticated = !!token;

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route);

  if (isPublicRoute) {
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
