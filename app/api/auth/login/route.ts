import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set user session in cookies (simplified - use proper JWT in production)
    const cookieStore = await cookies()
    cookieStore.set("user", JSON.stringify({ id: user.id, email: user.email, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
