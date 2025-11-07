// proxy.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PROTECTED_PREFIXES = ["/dashboard"]

export default async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const isLoggedIn = !!token
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = pathname.startsWith("/auth")

  if (isProtected && !isLoggedIn) {
    const url = new URL("/auth/signin", request.url)
    url.searchParams.set("callbackUrl", pathname + search)
    return NextResponse.redirect(url)
  }

  if (isLoggedIn && isAuthPage) {
    const cb = request.nextUrl.searchParams.get("callbackUrl") || "/dashboard"
    return NextResponse.redirect(new URL(cb, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|svg|gif|webp)).*)",
  ],
}
