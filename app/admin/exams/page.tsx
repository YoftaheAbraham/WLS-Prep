import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import AdminNav from "@/components/admin-nav"
import Link from "next/link"

interface Exam {
  id: string
  title: string
  duration: number
  canStart: boolean
  createdAt: Date
  _count: {
    questions: number
    results: number
  }
}

export default async function ExamsPage() {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  const exams: Exam[] = await prisma.exam.findMany({
    include: { _count: { select: { questions: true, results: true } } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Manage Exams</h1>
          <Link
            href="/admin/exams/new"
            className="bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
          >
            Create New Exam
          </Link>
        </div>

        <div className="space-y-4">
          {exams.length === 0 ? (
            <p className="text-muted-foreground">No exams yet. Create one to get started.</p>
          ) : (
            exams.map((exam) => (
              <div key={exam.id} className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-foreground mb-2">{exam.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      Duration: {exam.duration} min | Questions: {exam._count.questions} | Results:{" "}
                      {exam._count.results} | Status: {exam.canStart ? "Enabled" : "Disabled"}
                    </p>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/exams/${exam.id}`}
                        className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:opacity-90"
                      >
                        Edit Questions
                      </Link>
                      <Link
                        href={`/admin/exams/${exam.id}/results`}
                        className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:opacity-90"
                      >
                        View Results
                      </Link>
                      <Link
                        href={`/admin/exams/${exam.id}/settings`}
                        className="text-sm bg-secondary text-secondary-foreground px-3 py-1 rounded hover:opacity-90"
                      >
                        Settings
                      </Link>
                    </div>
                  </div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={exam.canStart} readOnly className="w-4 h-4" />
                    <span className="text-sm text-foreground">Enabled</span>
                  </label>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
