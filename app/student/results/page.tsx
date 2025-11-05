import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function StudentResultsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "STUDENT") {
    redirect("/login")
  }

  const results = await prisma.result.findMany({
    where: { userId: user.id },
    include: { exam: true },
    orderBy: { submittedAt: "desc" },
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LiqaPrep Student</h1>
          <div className="flex items-center gap-4">
            <Link href="/student" className="text-primary-foreground hover:underline">
              Available Exams
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90 font-medium"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-3xl font-bold text-foreground mb-6">All Results</h2>

        {results.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <p className="text-muted-foreground mb-4">No exam results yet</p>
            <Link href="/student" className="text-primary hover:underline">
              Start taking exams
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-6 hover:border-foreground/30 transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{result.exam.title}</h3>
                    <div className="flex gap-6 text-sm text-muted-foreground mb-3">
                      <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
                      <span>Time: {new Date(result.submittedAt).toLocaleTimeString()}</span>
                      <span>Duration: {result.exam.duration} minutes</span>
                    </div>
                    <div className="text-2xl font-bold text-foreground">
                      Score: <span className="text-primary">{result.score.toFixed(1)}%</span>
                    </div>
                  </div>
                  <Link
                    href={`/student/result/${result.id}`}
                    className="bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90 whitespace-nowrap ml-4"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
