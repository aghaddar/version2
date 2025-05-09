import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect old auth paths to new ones
  if (pathname === "/login") {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (pathname === "/signup") {
    return NextResponse.redirect(new URL("/auth/signup", request.url))
  }

  if (pathname === "/forgot-password") {
    return NextResponse.redirect(new URL("/auth/forgot-password", request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/login", "/signup", "/forgot-password"],
}
