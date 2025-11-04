import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const role = req.cookies.get("role")?.value;

  const isAuthFree =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/logout") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico");

  if (isAuthFree) {
    return NextResponse.next();
  }

  if (role === "admin") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/freepik")) {
    return new NextResponse(
      JSON.stringify({ error: "Unauthorized", ok: false }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" }
      }
    );
  }

  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)"
  ]
};
