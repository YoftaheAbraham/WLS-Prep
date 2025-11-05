import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id },
    })

    const questions = await prisma.question.findMany({
      where: { examId: id },
      include: { passage: true },
      orderBy: { orderIndex: "asc" },
    })

    const passages = await prisma.passage.findMany({
      where: { examId: id },
    })

    return NextResponse.json({ exam, questions, passages })
  } catch (error) {
    console.error(" Error fetching exam:", error)
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { canStart, duration, title } = body

    const updateData: any = {}

    if (canStart !== undefined) {
      updateData.canStart = canStart
    }

    if (duration !== undefined) {
      if (typeof duration !== "number" || duration < 1 || duration > 480) {
        return NextResponse.json({ error: "Duration must be between 1 and 480 minutes" }, { status: 400 })
      }
      updateData.duration = duration
    }

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 })
      }
      updateData.title = title.trim()
    }

    const exam = await prisma.exam.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ exam })
  } catch (error) {
    console.error(" Error updating exam:", error)
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 })
  }
}
