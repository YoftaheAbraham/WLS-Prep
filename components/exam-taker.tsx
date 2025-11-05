"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  questionText: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  passage?: {
    content: string
  } | null
  orderIndex: number
}

interface ExamTakerProps {
  exam: {
    id: string
    title: string
    duration: number
    questions: Question[]
  }
  userId: string
}

export default function ExamTaker({ exam, userId }: ExamTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60 + 25) // in seconds
  const [submitted, setSubmitted] = useState(false)
  const [startTime] = useState(Date.now())
  const timerRef = useRef<NodeJS.Timeout>()
  const router = useRouter()

  const handleAnswer = (answer: string) => {
    setAnswers({
      ...answers,
      [exam.questions[currentQuestion].id]: answer,
    })
  }

  const handleSubmit = async () => {
    if (submitted) return
    setSubmitted(true)

    try {
      const res = await fetch("/api/student/submit-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          userId,
          answers,
          startTime: new Date(startTime),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/student/result/${data.resultId}`)
      } else {
        setSubmitted(false)
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
      setSubmitted(false)
    }
  }

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit()
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [submitted])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const question = exam.questions[currentQuestion]

  if (!question) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground border-b border-border sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">{exam.title}</h1>
          <div className={`text-lg font-mono font-bold ${timeLeft < 300 ? "text-red-400" : ""}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {exam.questions.length}
            </span>
            <span className="text-sm text-muted-foreground">Answered: {Object.keys(answers).length}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-8 mb-8">
          {question.passage && (
            <div className="bg-secondary bg-opacity-10 border-l-4 border-secondary p-4 mb-6">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                {question.passage.content}
              </p>
            </div>
          )}

          <h2 className="text-xl font-semibold text-foreground mb-6">{question.questionText}</h2>

          <div className="space-y-3">
            {[
              { label: "A", text: question.optionA },
              { label: "B", text: question.optionB },
              { label: "C", text: question.optionC },
              { label: "D", text: question.optionD },
            ].map((option) => (
              <label
                key={option.label}
                className="flex items-center gap-3 p-3 border border-border rounded cursor-pointer hover:bg-secondary hover:bg-opacity-20"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.label}
                  checked={answers[question.id] === option.label}
                  onChange={() => handleAnswer(option.label)}
                  className="w-4 h-4"
                />
                <span className="font-mono font-semibold text-foreground">{option.label}.</span>
                <span className="text-foreground">{option.text}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-6 py-2 bg-secondary text-secondary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50"
          >
            Previous
          </button>

          <div className="flex gap-2 flex-wrap justify-center">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-10 h-10 rounded font-medium ${
                  idx === currentQuestion
                    ? "bg-primary text-primary-foreground"
                    : answers[exam.questions[idx].id]
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-border text-foreground"
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              if (currentQuestion === exam.questions.length - 1) {
                handleSubmit()
              } else {
                setCurrentQuestion(Math.min(exam.questions.length - 1, currentQuestion + 1))
              }
            }}
            disabled={submitted}
            className="px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50"
          >
            {currentQuestion === exam.questions.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  )
}
