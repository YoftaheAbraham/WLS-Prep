import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Admin name is required" }, { status: 400 })
    }

    if (!email || typeof email !== "string" || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 400 })
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")

    // Create admin with temporary password
    const tempPassword = crypto.randomBytes(16).toString("hex").slice(0, 16)
    const hashedPassword = await bcrypt.hash(tempPassword, 10)

    const admin = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase(),
        password: hashedPassword,
        role: "ADMIN",
        invitationToken: token,
      },
    })

    return NextResponse.json({
      token,
      admin: { id: admin.id, name: admin.name, email: admin.email },
      tempPassword,
    })
  } catch (error) {
    console.error("[v0] Error creating admin:", error)
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
  }
}
