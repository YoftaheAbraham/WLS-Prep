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
      <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0">
          <h1 className="text-2xl font-bold text-center sm:text-left">WLSPrep Student</h1>
          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-3">
            <Link
              href="/student"
              className="text-white hover:underline text-sm sm:text-base"
            >
              Available Exams
            </Link>
            <form action="/api/auth/logout" method="POST">
              <button
                type="submit"
                className="px-3 py-2 bg-primary-foreground text-primary rounded hover:opacity-90 font-medium text-sm sm:text-base"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-4 sm:p-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center sm:text-left">
          All Results
        </h2>

        {results.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 sm:p-8 text-center">
            <p className="text-muted-foreground mb-4 text-sm sm:text-base">No exam results yet</p>
            <Link href="/student" className="text-primary hover:underline text-sm sm:text-base">
              Start taking exams
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((result) => (
              <div
                key={result.id}
                className="bg-card border border-border rounded-lg p-4 sm:p-6 hover:border-foreground/30 transition"
              >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2 text-center md:text-left">
                      {result.exam.title}
                    </h3>

                    <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-6 text-xs sm:text-sm text-muted-foreground mb-3 text-center md:text-left">
                      <span>Date: {new Date(result.submittedAt).toLocaleDateString()}</span>
                      <span>Time: {new Date(result.submittedAt).toLocaleTimeString()}</span>
                      <span>Duration: {result.exam.duration} minutes</span>
                    </div>

                    <div className="text-xl sm:text-2xl font-bold text-foreground text-center md:text-left">
                      Score: <span className="text-primary">{result.score.toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="flex justify-center md:justify-end">
                    <Link
                      href={`/student/result/${result.id}`}
                      className="bg-primary text-primary-foreground px-4 sm:px-6 py-2 rounded font-medium hover:opacity-90 text-sm sm:text-base w-full sm:w-auto text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
