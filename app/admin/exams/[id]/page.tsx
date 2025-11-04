"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminNav from "@/components/admin-nav"

interface Passage {
  id: string
  content: string
}

interface Question {
  id: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctAnswer: string
  passageId?: string
}

export default function EditExamPage({ params }: { params: { id: string } }) {
  const [exam, setExam] = useState<any>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [passages, setPassages] = useState<Passage[]>([])
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: "",
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  })
  const [newPassage, setNewPassage] = useState("")
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchExam = async () => {
      const res = await fetch(`/api/admin/exams/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setExam(data.exam)
        setQuestions(data.questions || [])
        setPassages(data.passages || [])
      }
      setLoading(false)
    }
    fetchExam()
  }, [params.id])

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newQuestion.questionText.trim()) return

    try {
      const res = await fetch(`/api/admin/exams/${params.id}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      })

      if (res.ok) {
        const data = await res.json()
        setQuestions([...questions, data.question])
        setNewQuestion({
          id: "",
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddPassage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassage.trim()) return

    try {
      const res = await fetch(`/api/admin/exams/${params.id}/passages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPassage }),
      })

      if (res.ok) {
        const data = await res.json()
        setPassages([...passages, data.passage])
        setNewPassage("")
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/admin/exams/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ canStart: true }),
      })

      if (res.ok) {
        alert("Exam published successfully!")
        router.push("/admin/exams")
      }
    } catch (error) {
      console.error(error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">{exam?.title}</h1>
          <button
            onClick={handlePublish}
            className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90"
          >
            Publish Exam
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Questions Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Passage Form */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Add Passage</h2>
              <form onSubmit={handleAddPassage} className="space-y-4">
                <textarea
                  value={newPassage}
                  onChange={(e) => setNewPassage(e.target.value)}
                  placeholder="Enter passage text"
                  className="w-full px-4 py-3 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90"
                >
                  Add Passage
                </button>
              </form>
            </div>

            {/* Passages List */}
            {passages.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Passages</h2>
                <div className="space-y-3">
                  {passages.map((p) => (
                    <div key={p.id} className="bg-background border border-border rounded p-3">
                      <p className="text-sm text-foreground">{p.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Question Form */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Add Question</h2>
              <form onSubmit={handleAddQuestion} className="space-y-4">
                <textarea
                  value={newQuestion.questionText}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionText: e.target.value })}
                  placeholder="Question text"
                  className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={2}
                />

                <select
                  value={newQuestion.passageId || ""}
                  onChange={(e) => setNewQuestion({ ...newQuestion, passageId: e.target.value || undefined })}
                  className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">No passage</option>
                  {passages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.content.substring(0, 50)}...
                    </option>
                  ))}
                </select>

                {["A", "B", "C", "D"].map((opt) => (
                  <input
                    key={opt}
                    type="text"
                    value={newQuestion[`option${opt}` as keyof Question] as string}
                    onChange={(e) => setNewQuestion({ ...newQuestion, [`option${opt}`]: e.target.value })}
                    placeholder={`Option ${opt}`}
                    className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                ))}

                <select
                  value={newQuestion.correctAnswer}
                  onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                  className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="A">Correct Answer: A</option>
                  <option value="B">Correct Answer: B</option>
                  <option value="C">Correct Answer: C</option>
                  <option value="D">Correct Answer: D</option>
                </select>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90"
                >
                  Add Question
                </button>
              </form>
            </div>
          </div>

          {/* Questions List Sidebar */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Questions ({questions.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-background border border-border rounded p-3">
                  <p className="text-xs font-mono text-muted-foreground mb-1">Q{idx + 1}</p>
                  <p className="text-sm text-foreground line-clamp-2">{q.questionText}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
