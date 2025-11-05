import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"
import StudentNav from "@/components/student-nav"

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
    orderBy: { createdAt: "desc" },
  })

  const userResults = await prisma.result.findMany({
    where: { userId: user.id },
    include: { exam: true },
    orderBy: { submittedAt: "desc" },
    take: 5,
  })

  return (
    <div className="min-h-screen bg-background">
      <StudentNav userName={user.name} userEmail={user.email} />

      <div className="max-w-6xl mx-auto p-6">
        {/* Available Exams Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-foreground">Available Exams</h2>
            <span className="text-sm text-muted-foreground">{exams.length} exam(s)</span>
          </div>

          {exams.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">No exams available right now</p>
              <p className="text-sm text-muted-foreground">Check back later for new exams</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-foreground/30 transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-foreground mb-2">{exam.title}</h3>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>Duration: {exam.duration} min</span>
                        <span>Questions: {exam._count.questions}</span>
                      </div>
                    </div>
                    <Link
                      href={`/student/exam/${exam.id}`}
                      className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90 whitespace-nowrap ml-4"
                    >
                      Start Exam
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results Section */}
        {userResults.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-foreground">Recent Results</h2>
              <Link href="/student/results" className="text-primary hover:underline text-sm">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {userResults.map((result) => (
                <div key={result.id} className="bg-card border border-border rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-2">{result.exam.title}</h3>
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>
                          Score: <span className="text-foreground font-semibold">{result.score.toFixed(1)}%</span>
                        </span>
                        <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link href={`/student/result/${result.id}`} className="text-primary hover:underline font-medium">
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
