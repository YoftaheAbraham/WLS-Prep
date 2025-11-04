import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, invitationToken, role } = await request.json()

    // Check if email already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }

    // If student, validate invitation token
    if (role === "STUDENT") {
      const student = await prisma.user.findUnique({
        where: { invitationToken },
      })
      if (!student) {
        return NextResponse.json({ error: "Invalid invitation token" }, { status: 400 })
      }
    }

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "STUDENT",
        invitationToken: role === "ADMIN" ? invitationToken : undefined,
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
