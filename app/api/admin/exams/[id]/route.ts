import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: params.id },
    })

    const questions = await prisma.question.findMany({
      where: { examId: params.id },
      orderBy: { orderIndex: "asc" },
    })

    const passages = await prisma.passage.findMany({
      where: { examId: params.id },
    })

    return NextResponse.json({ exam, questions, passages })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch exam" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { canStart } = await request.json()

    const exam = await prisma.exam.update({
      where: { id: params.id },
      data: { canStart },
    })

    return NextResponse.json({ exam })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update exam" }, { status: 500 })
  }
}
