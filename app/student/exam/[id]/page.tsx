import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ExamTaker from "@/components/exam-taker"

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
