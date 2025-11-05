import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name, email } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Student name is required" }, { status: 400 })
    }

    if (!email || typeof email !== "string" || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")

    // Check if student already exists
    let student = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!student) {
      student = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: "", // Will be set on signup
          role: "STUDENT",
          invitationToken: token,
        },
      })
    } else {
      // Update existing student with new token
      student = await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { invitationToken: token },
      })
    }

    return NextResponse.json({ token, student: { name: student.name, email: student.email } })
  } catch (error) {
    console.error("[v0] Error generating student invitation:", error)
    return NextResponse.json({ error: "Failed to generate invitation" }, { status: 500 })
  }
}
