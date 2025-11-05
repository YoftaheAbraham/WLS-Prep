import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"
import Link from "next/link"

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const user = await getCurrentUser()

  if (!user || user.role !== "STUDENT") {
    redirect("/login")
  }

  const result = await prisma.result.findUnique({
    where: { id },
    include: {
      exam: true,
      user: true,
      answers: true,
    },
  })

  if (!result || result.userId !== user.id) {
    redirect("/student")
  }

  // Get all results for this exam to determine ranking
  const allResults = await prisma.result.findMany({
    where: { examId: result.examId },
    include: { user: true },
    orderBy: { score: "desc" },
  })

  const userRank = allResults.findIndex((r) => r.id === result.id) + 1

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">WLSPrep Student</h1>
          <Link href="/student" className="text-white hover:underline">
            Back to Exams
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-2">
        <div className="bg-card border border-border rounded-lg p-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{result.exam.title} - Results</h1>

          <div className="flex flex-wrap gap-4 mb-8">
            <div className="bg-secondary bg-opacity-10 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Score</p>
              <p className="text-4xl font-bold text-foreground">{result.score.toFixed(1)}%</p>
            </div>

            <div className="bg-secondary bg-opacity-10 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Your Rank</p>
              <p className="text-4xl font-bold text-foreground">#{userRank}</p>
            </div>

            <div className="bg-secondary bg-opacity-10 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Students</p>
              <p className="text-4xl font-bold text-foreground">{allResults.length}</p>
            </div>
          </div>

          <h2 className="text-xl font-semibold text-foreground mb-4">Student Rankings</h2>
          <div className="space-y-2">
            {allResults.slice(0, 10).map((res, idx) => (
              <div
                key={res.id}
                className={`flex justify-between items-center p-4 rounded ${res.id === result.id ? "bg-primary text-primary-foreground" : "bg-secondary bg-opacity-10"
                  }`}
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold text-lg">{idx + 1}</span>
                  <span>{res.user.name}</span>
                </div>
                <span className="font-bold">{res.score.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/student"
          className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded font-medium hover:opacity-90"
        >
          Take Another Exam
        </Link>
      </div>
    </div>
  )
}
