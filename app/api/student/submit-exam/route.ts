import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { examId, answers, startTime } = await request.json()

    console.log({ examId, answers, startTime });
    

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: true },
    })

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 })
    }

    // Check timer limit + 5 minutes bonus (5 * 60 * 1000 ms)
    const start = new Date(startTime).getTime()
    const now = Date.now()
    const examDurationMs = exam.duration * 60 * 1000
    const bonusMs = 5 * 60 * 1000
    if (now - start > examDurationMs + bonusMs) {
      return NextResponse.json({ error: "Time limit exceeded" }, { status: 400 })
    }

    // Calculate score (unanswered = incorrect)
    let correctCount = 0
    const answerRecords = []

    for (const question of exam.questions) {
      const userAnswer = answers[question.id] || "" // "" if unanswered
      const isCorrect = userAnswer === question.correctAnswer

      if (isCorrect) correctCount++

      answerRecords.push({
        questionId: question.id,
        selectedAnswer: userAnswer,
        isCorrect,
      })
    }

    const score = (correctCount / exam.questions.length) * 100

    const result = await prisma.result.create({
      data: {
        userId: user.id,
        examId,
        score,
        startTime: new Date(startTime),
        endTime: new Date(),
        answers: {
          create: answerRecords,
        },
      },
    })

    return NextResponse.json({ resultId: result.id })
  } catch (error) {
    console.error("[v0] Submit error:", error)
    return NextResponse.json({ error: "Failed to submit exam" }, { status: 500 })
  }
}


