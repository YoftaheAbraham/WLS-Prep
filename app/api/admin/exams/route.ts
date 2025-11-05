import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, duration } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json({ error: "Title is required and must be a string" }, { status: 400 })
    }

    if (!duration || typeof duration !== "number" || duration < 1 || duration > 480) {
      return NextResponse.json({ error: "Duration must be a number between 1 and 480 minutes" }, { status: 400 })
    }

    const exam = await prisma.exam.create({
      data: {
        title: title.trim(),
        duration,
        canStart: false,
      },
    })

    return NextResponse.json({ exam })
  } catch (error) {
    console.error("[v0] Error creating exam:", error)
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 })
  }
}
