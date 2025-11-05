"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import AdminNav from "@/components/admin-nav"

interface Exam {
  id: string
  title: string
  duration: number
  canStart: boolean
}

interface StudentResult {
  id: string
  userId: string
  user: { name: string; email: string }
  score: number
  submittedAt: string
  answers: Array<{
    id: string
    questionId: string
    selectedAnswer: string
    isCorrect: boolean
    question: {
      questionText: string
      optionA: string
      optionB: string
      optionC: string
      optionD: string
      correctAnswer: string
    }
  }>
}

export default function ExamResultsPage() {
  const params = useParams()
  const router = useRouter()
  const examId = params.id as string

  const [exam, setExam] = useState<Exam | null>(null)
  const [results, setResults] = useState<StudentResult[]>([])
  const [selectedResult, setSelectedResult] = useState<StudentResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/admin/exams/${examId}/results`)
        if (res.ok) {
          const data = await res.json()
          setExam(data.exam)
          setResults(data.results || [])
        } else {
          setError("Failed to load results")
        }
      } catch (err) {
        setError("Failed to load results")
      }
      setLoading(false)
    }
    fetchResults()
  }, [examId])

  if (loading) return <div className="p-6">Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-foreground mb-2">{exam?.title}</h1>
        <p className="text-muted-foreground mb-6">
          Total Results: {results.length} | Average Score:{" "}
          {results.length > 0 ? (results.reduce((sum, r) => sum + r.score, 0) / results.length).toFixed(1) : 0}%
        </p>

        {error && (
          <div className="bg-destructive bg-opacity-10 border border-destructive rounded p-4 mb-6 text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Results List */}
          <div className="lg:col-span-1 bg-card border border-border rounded-lg p-6 h-fit sticky top-20">
            <h2 className="text-lg font-semibold text-foreground mb-4">Student Results</h2>
            <div className="space-y-2 max-h-screen overflow-y-auto">
              {results.length === 0 ? (
                <p className="text-sm text-muted-foreground">No results yet</p>
              ) : (
                results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => setSelectedResult(result)}
                    className={`w-full text-left bg-background border border-border rounded p-3 hover:bg-secondary hover:bg-opacity-10 transition ${
                      selectedResult?.id === result.id ? "border-primary" : ""
                    }`}
                  >
                    <p className="text-sm font-semibold text-foreground">{result.user.name}</p>
                    <p className="text-xs text-muted-foreground">{result.user.email}</p>
                    <p className="text-sm font-bold text-primary mt-1">{result.score.toFixed(1)}%</p>
                    <p className="text-xs text-muted-foreground">{new Date(result.submittedAt).toLocaleDateString()}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detailed Result View */}
          <div className="lg:col-span-2">
            {selectedResult ? (
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">{selectedResult.user.name}</h2>
                    <p className="text-muted-foreground">{selectedResult.user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-primary">{selectedResult.score.toFixed(1)}%</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedResult.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedResult.answers.map((answer, idx) => (
                    <div
                      key={answer.id}
                      className={`border rounded p-4 ${
                        answer.isCorrect
                          ? "border-primary bg-primary bg-opacity-5"
                          : "border-destructive bg-destructive bg-opacity-5"
                      }`}
                    >
                      <p className="text-sm font-mono text-muted-foreground mb-2">Q{idx + 1}</p>
                      <h3 className="text-sm font-semibold text-foreground mb-3">{answer.question.questionText}</h3>

                      <div className="space-y-2 text-sm mb-3">
                        {["A", "B", "C", "D"].map((opt) => {
                          const optionKey = `option${opt}` as keyof typeof answer.question
                          const isSelected = answer.selectedAnswer === opt
                          const isCorrect = answer.question.correctAnswer === opt

                          return (
                            <div
                              key={opt}
                              className={`p-2 rounded ${
                                isSelected && isCorrect
                                  ? "bg-primary text-primary-foreground"
                                  : isSelected && !isCorrect
                                    ? "bg-destructive text-destructive-foreground"
                                    : isCorrect
                                      ? "bg-primary bg-opacity-20"
                                      : ""
                              }`}
                            >
                              <span className="font-mono font-semibold">{opt}.</span> {answer.question[optionKey]}
                              {isSelected && !isCorrect && " (Selected - Wrong)"}
                              {isCorrect && " (Correct Answer)"}
                            </div>
                          )
                        })}
                      </div>

                      <p className={`text-xs font-semibold ${answer.isCorrect ? "text-primary" : "text-destructive"}`}>
                        {answer.isCorrect ? "✓ Correct" : "✗ Incorrect"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">Select a student result to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}