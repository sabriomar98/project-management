import { auth } from "@/auth"
import createIntlMiddleware from "next-intl/middleware"
import { type NextRequest, NextResponse } from "next/server"

const intlMiddleware = createIntlMiddleware({
  locales: ["en", "fr"],
  defaultLocale: "fr",
  localePrefix: "as-needed",
})

export default auth(async function middleware(request: NextRequest) {
  // Handle authentication
  const session = await auth()
  const { pathname } = request.nextUrl

  // Protected routes
  const isProtectedRoute = pathname.startsWith("/dashboard")

  if (isProtectedRoute && !session) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(signInUrl)
  }

  // Redirect to dashboard if logged in and trying to access auth pages
  if (session && pathname.startsWith("/auth")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Handle internationalization
  return intlMiddleware(request)
})

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
