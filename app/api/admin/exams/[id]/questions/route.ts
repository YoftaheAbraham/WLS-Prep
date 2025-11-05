import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, passageId } = body

    if (!questionText || typeof questionText !== "string" || !questionText.trim()) {
      return NextResponse.json({ error: "Question text is required" }, { status: 400 })
    }

    if (!optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim()) {
      return NextResponse.json({ error: "All four options are required and cannot be empty" }, { status: 400 })
    }

    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      return NextResponse.json({ error: "Correct answer must be A, B, C, or D" }, { status: 400 })
    }

    const questionCount = await prisma.question.count({
      where: { examId: id },
    })

    const question = await prisma.question.create({
      data: {
        examId: id,
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        passageId: passageId || null,
        orderIndex: questionCount,
      },
      include: {
        passage: true,
      },
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error(" Error creating question:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
