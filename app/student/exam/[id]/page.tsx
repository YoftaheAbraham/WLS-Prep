import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ExamTaker from "@/components/exam-taker"
import Link from "next/link"

export default async function ExamPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== "STUDENT") {
    redirect("/login")
  }

  const exam = await prisma.exam.findUnique({
    where: { id },
    include: {
      questions: {
        include: { passage: true },
        orderBy: { orderIndex: "asc" },
      },
    },
  })

  if (!exam) {
    redirect("/student")
  }

  if (exam.questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">No Questions Available</h1>
          <p className="text-muted-foreground mb-6">
            This exam doesn't have any questions yet. Please try another exam.
          </p>
          <Link
            href="/student"
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    )
  }

  // Check if already submitted
  const existingResult = await prisma.result.findFirst({
    where: {
      userId: user.id,
      examId: exam.id,
    },
  })

  if (existingResult) {
    redirect(`/student/result/${existingResult.id}`)
  }

  return <ExamTaker exam={exam} userId={user.id} />
}
