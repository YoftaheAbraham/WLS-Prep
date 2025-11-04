import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import ExamList from "@/components/exam-list"

export default async function StudentPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "STUDENT") {
    redirect("/login")
  }

  const exams = await prisma.exam.findMany({
    where: { canStart: true },
    include: {
      _count: { select: { questions: true } },
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">LiqaPrep Student</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.name}</span>
            <form action="/api/auth/logout" method="POST">
              <button type="submit" className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90">
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-foreground mb-8">Available Exams</h2>
        <ExamList exams={exams} />
      </div>
    </div>
  )
}
