import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string; questionId: string }> }) {
  const { id, questionId } = await context.params
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, passageId } = body

    // Validate input
    if (!questionText?.trim() || !optionA?.trim() || !optionB?.trim() || !optionC?.trim() || !optionD?.trim()) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (!["A", "B", "C", "D"].includes(correctAnswer)) {
      return NextResponse.json({ error: "Invalid correct answer" }, { status: 400 })
    }

    const question = await prisma.question.update({
      where: { id: questionId },
      data: {
        questionText: questionText.trim(),
        optionA: optionA.trim(),
        optionB: optionB.trim(),
        optionC: optionC.trim(),
        optionD: optionD.trim(),
        correctAnswer,
        passageId: passageId || null,
      },
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error("Error updating question:", error)
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}
