import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, parseSessionCookie } from "@/lib/session";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/products",
  "/orders",
  "/customers",
  "/feedback",
  "/email",
  "/admin-accounts",
  "/servers",
  "/domains",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSessionCookie(
    request.cookies.get(SESSION_COOKIE)?.value,
  );

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/products/:path*",
    "/orders/:path*",
    "/customers/:path*",
    "/feedback/:path*",
    "/email/:path*",
    "/admin-accounts/:path*",
    "/servers/:path*",
    "/domains/:path*",
  ],
};
