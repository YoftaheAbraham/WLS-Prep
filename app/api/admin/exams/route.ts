import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { title, duration } = await request.json()

    const exam = await prisma.exam.create({
      data: { title, duration, canStart: false },
    })

    return NextResponse.json({ exam })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
