import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      console.log(" User not found:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValid = await compare(password, user.password)
    if (!isValid) {
      console.log(" Invalid password for user:", email)
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set user session in cookies
    const cookieStore = await cookies()
    cookieStore.set("user", JSON.stringify({ id: user.id, email: user.email, role: user.role, name: user.name }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    console.log(" User logged in:", email, "Role:", user.role)
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name } })
  } catch (error) {
    console.error(" Login error:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}
