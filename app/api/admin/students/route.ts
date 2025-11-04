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
    const { name, email } = await request.json()

    // Generate invitation token
    const token = crypto.randomBytes(32).toString("hex")

    // Check if student already exists
    let student = await prisma.user.findUnique({ where: { email } })

    if (!student) {
      student = await prisma.user.create({
        data: {
          name,
          email,
          password: "", // Will be set on signup
          role: "STUDENT",
          invitationToken: token,
        },
      })
    } else {
      // Update existing student with new token
      student = await prisma.user.update({
        where: { email },
        data: { invitationToken: token },
      })
    }

    return NextResponse.json({ token, student })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to generate invitation" }, { status: 500 })
  }
}
