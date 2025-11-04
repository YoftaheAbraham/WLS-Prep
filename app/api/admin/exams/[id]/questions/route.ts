import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { questionText, optionA, optionB, optionC, optionD, correctAnswer, passageId } = await request.json()

    const questionCount = await prisma.question.count({
      where: { examId: params.id },
    })

    const question = await prisma.question.create({
      data: {
        examId: params.id,
        questionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctAnswer,
        passageId: passageId || undefined,
        orderIndex: questionCount,
      },
    })

    return NextResponse.json({ question })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
