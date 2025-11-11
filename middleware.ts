import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("user")?.value

  // If no cookie or invalid JSON, just continue
  if (!userCookie) return NextResponse.next()

  let user: { role?: string } | null = null
  try {
    user = JSON.parse(userCookie)
  } catch {
    return NextResponse.next()
  }

  // Redirect only from /, /login, or /signup
  const pathname = request.nextUrl.pathname
  const isAuthPage = ["/", "/login", "/signup"].includes(pathname)

  if (isAuthPage && user?.role) {
    const redirectUrl = new URL(
      user.role === "ADMIN" ? "/admin" : "/student",
      request.url
    )
    return NextResponse.redirect(redirectUrl)
  }
  return NextResponse.next()
}

export const config = {
  matcher: ["/", "/login", "/signup"],
}
