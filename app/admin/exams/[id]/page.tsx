"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
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
  passage?: Passage | null
}

interface Exam {
  id: string
  title: string
  duration: number
  canStart: boolean
}

export default function EditExamPage() {
  const params = useParams()
  const [exam, setExam] = useState<Exam | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [passages, setPassages] = useState<Passage[]>([])
  const [newQuestion, setNewQuestion] = useState<Omit<Question, "id"> & { id?: string }>({
    questionText: "",
    optionA: "",
    optionB: "",
    optionC: "",
    optionD: "",
    correctAnswer: "A",
  })
  const [newPassage, setNewPassage] = useState("")
  const [editingDuration, setEditingDuration] = useState(false)
  const [newDuration, setNewDuration] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/admin/exams/${params.id}`)
        if (res.ok) {
          const data = await res.json()
          setExam(data.exam)
          setNewDuration(data.exam.duration)
          setQuestions(data.questions || [])
          setPassages(data.passages || [])
        }
      } catch (err) {
        setError("Failed to load exam")
      }
      setLoading(false)
    }
    fetchExam()
  }, [params.id])

  const validateQuestion = () => {
    const errors: Record<string, string> = {}

    if (!newQuestion.questionText.trim()) {
      errors.questionText = "Question text is required"
    }

    if (!newQuestion.optionA.trim()) errors.optionA = "Option A is required"
    if (!newQuestion.optionB.trim()) errors.optionB = "Option B is required"
    if (!newQuestion.optionC.trim()) errors.optionC = "Option C is required"
    if (!newQuestion.optionD.trim()) errors.optionD = "Option D is required"

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateQuestion()) return

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
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        })
        setFormErrors({})
        setError("")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to add question")
      }
    } catch (err) {
      setError("Failed to add question")
    }
  }

  const handleEditQuestion = async (questionId: string) => {
    const questionToEdit = questions.find((q) => q.id === questionId)
    if (questionToEdit) {
      setNewQuestion(questionToEdit)
      setEditingQuestionId(questionId)
      // Scroll to form
      const formElement = document.querySelector("[data-question-form]")
      formElement?.scrollIntoView({ behavior: "smooth" })
    }
  }

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateQuestion() || !editingQuestionId) return

    try {
      const res = await fetch(`/api/admin/exams/${params.id}/questions/${editingQuestionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newQuestion),
      })

      if (res.ok) {
        const data = await res.json()
        setQuestions(questions.map((q) => (q.id === editingQuestionId ? data.question : q)))
        setNewQuestion({
          questionText: "",
          optionA: "",
          optionB: "",
          optionC: "",
          optionD: "",
          correctAnswer: "A",
        })
        setEditingQuestionId(null)
        setFormErrors({})
        setError("")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to update question")
      }
    } catch (err) {
      setError("Failed to update question")
    }
  }

  const handleAddPassage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassage.trim()) {
      setError("Passage content is required")
      return
    }

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
        setError("")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to add passage")
      }
    } catch (err) {
      setError("Failed to add passage")
    }
  }

  const handleUpdateDuration = async () => {
    if (newDuration < 1 || newDuration > 480) {
      setError("Duration must be between 1 and 480 minutes")
      return
    }

    try {
      const res = await fetch(`/api/admin/exams/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: newDuration }),
      })

      if (res.ok) {
        const data = await res.json()
        setExam(data.exam)
        setEditingDuration(false)
        setError("")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to update duration")
      }
    } catch (err) {
      setError("Failed to update duration")
    }
  }

  const handlePublish = async () => {
    if (questions.length === 0) {
      setError("Add at least one question before publishing")
      return
    }

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
    } catch (err) {
      setError("Failed to publish exam")
    }
  }

  if (loading) return <div>Loading...</div>

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

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{exam?.title}</h1>
            {editingDuration ? (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  max="480"
                  value={newDuration}
                  onChange={(e) => setNewDuration(Number.parseInt(e.target.value))}
                  className="px-3 py-1 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-24"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
                <button
                  onClick={handleUpdateDuration}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm hover:opacity-90"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingDuration(false)}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded text-sm hover:opacity-90"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setEditingDuration(true)}
                className="text-sm text-muted-foreground hover:text-foreground mt-2"
              >
                Duration: {exam?.duration} minutes (click to edit)
              </button>
            )}
          </div>
          <button
            onClick={handlePublish}
            className="bg-primary text-primary-foreground px-6 py-2 rounded hover:opacity-90 disabled:opacity-50"
            disabled={questions.length === 0}
          >
            Publish Exam
          </button>
        </div>

        {error && (
          <div className="bg-destructive bg-opacity-10 border border-destructive rounded p-4 mb-6 text-destructive">
            {error}
          </div>
        )}

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
                  placeholder="Enter passage text. Line breaks and spacing will be preserved."
                  className="w-full px-4 py-3 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm whitespace-pre-wrap"
                  rows={5}
                />
                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90"
                >
                  Add Passage
                </button>
              </form>
            </div>

            {/* Passages List with Better Display */}
            {passages.length > 0 && (
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">Passages ({passages.length})</h2>
                <div className="space-y-3">
                  {passages.map((p) => (
                    <div key={p.id} className="bg-background border border-border rounded p-4">
                      <p className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
                        {p.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Question Form with Live Preview */}
            <div className="bg-card border border-border rounded-lg p-6" data-question-form>
              <h2 className="text-lg font-semibold text-foreground mb-4">Add Question</h2>
              <form onSubmit={editingQuestionId ? handleUpdateQuestion : handleAddQuestion} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Question Text</label>
                  <textarea
                    value={newQuestion.questionText}
                    onChange={(e) => {
                      setNewQuestion({ ...newQuestion, questionText: e.target.value })
                      if (formErrors.questionText) setFormErrors({ ...formErrors, questionText: "" })
                    }}
                    placeholder="Enter the question"
                    className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    rows={2}
                  />
                  {formErrors.questionText && (
                    <p className="text-sm text-destructive mt-1">{formErrors.questionText}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Link to Passage (Optional)</label>
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
                </div>

                {["A", "B", "C", "D"].map((opt) => (
                  <div key={opt}>
                    <label className="block text-sm font-medium text-foreground mb-2">Option {opt}</label>
                    <input
                      type="text"
                      value={newQuestion[`option${opt}` as keyof Omit<Question, "id">] as string}
                      onChange={(e) => {
                        setNewQuestion({ ...newQuestion, [`option${opt}`]: e.target.value })
                        if (formErrors[`option${opt}`]) setFormErrors({ ...formErrors, [`option${opt}`]: "" })
                      }}
                      placeholder={`Enter option ${opt}`}
                      className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {formErrors[`option${opt}`] && (
                      <p className="text-sm text-destructive mt-1">{formErrors[`option${opt}`]}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Correct Answer</label>
                  <select
                    value={newQuestion.correctAnswer}
                    onChange={(e) => setNewQuestion({ ...newQuestion, correctAnswer: e.target.value })}
                    className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>

                {/* Live Preview */}
                <div className="bg-secondary bg-opacity-10 border border-secondary rounded p-4 mt-4">
                  <p className="text-xs font-semibold text-foreground mb-3">PREVIEW</p>
                  <h3 className="text-sm font-medium text-foreground mb-3">
                    {newQuestion.questionText || "Question preview..."}
                  </h3>
                  <div className="space-y-2">
                    {["A", "B", "C", "D"].map((opt) => (
                      <div key={opt} className="flex items-start gap-2 text-sm">
                        <span className="font-mono font-semibold">{opt}.</span>
                        <span className="text-foreground">
                          {(newQuestion[`option${opt}` as keyof Omit<Question, "id">] as string) || `Option ${opt}`}
                        </span>
                        {opt === newQuestion.correctAnswer && (
                          <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90"
                >
                  {editingQuestionId ? "Update Question" : "Add Question"}
                </button>
              </form>
            </div>

            {/* Form heading to show edit mode */}
            {editingQuestionId && (
              <div className="bg-primary bg-opacity-10 border border-primary rounded p-4 mb-6 text-primary">
                Editing Question - Click save to update or cancel to discard changes
              </div>
            )}

            {editingQuestionId && (
              <button
                onClick={() => {
                  setNewQuestion({
                    questionText: "",
                    optionA: "",
                    optionB: "",
                    optionC: "",
                    optionD: "",
                    correctAnswer: "A",
                  })
                  setEditingQuestionId(null)
                  setFormErrors({})
                }}
                className="w-full bg-secondary text-secondary-foreground py-2 rounded font-medium hover:opacity-90 mt-2"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Questions List Sidebar */}
          <div className="bg-card border border-border rounded-lg p-6 h-fit sticky top-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Questions ({questions.length})</h2>
            <div className="space-y-2 max-h-screen overflow-y-auto">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  onClick={() => handleEditQuestion(q.id)}
                  className="bg-background border border-border rounded p-3 hover:bg-secondary hover:bg-opacity-10 cursor-pointer transition"
                >
                  <p className="text-xs font-mono text-muted-foreground mb-1">Q{idx + 1}</p>
                  <p className="text-sm text-foreground line-clamp-2">{q.questionText}</p>
                  {q.passage && <p className="text-xs text-muted-foreground mt-1">Has passage</p>}
                  <p className="text-xs text-primary mt-1 font-semibold">Click to edit</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}