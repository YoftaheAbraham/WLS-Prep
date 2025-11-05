"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

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

interface ExamSessionData {
  examId: string
  userId: string
  answers: Record<string, string>
  startTime: number
  currentQuestion: number
  timeLeft: number
}

export default function ExamTaker({ exam, userId }: ExamTakerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [timeLeft, setTimeLeft] = useState(exam.duration * 60 + 30) // 30 seconds buffer for fetching
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())
  const [isLoading, setIsLoading] = useState(true)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submitRef = useRef(false)
  const answersRef = useRef<Record<string, string>>({})
  const router = useRouter()
  const [warningQuestionId, setWarningQuestionId] = useState<string | null>(null)

  // Storage key for this exam session
  const storageKey = `exam-session-${exam.id}-${userId}`

  // Load exam session from localStorage on mount
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(storageKey)
      if (savedSession) {
        const sessionData: ExamSessionData = JSON.parse(savedSession)
        
        // Validate that the saved session matches current exam
        if (sessionData.examId === exam.id && sessionData.userId === userId) {
          setAnswers(sessionData.answers)
          answersRef.current = sessionData.answers
          setCurrentQuestion(sessionData.currentQuestion)
          setStartTime(sessionData.startTime)
          
          // Calculate time left based on elapsed time
          const elapsedSeconds = Math.floor((Date.now() - sessionData.startTime) / 1000)
          const calculatedTimeLeft = Math.max(0, exam.duration * 60 - elapsedSeconds + 30)
          setTimeLeft(calculatedTimeLeft)
        }
      }
    } catch (error) {
      console.error("Error loading exam session from localStorage:", error)
      // If there's an error loading, start fresh but keep the buffer time
      setTimeLeft(exam.duration * 60 + 30)
    } finally {
      setIsLoading(false)
    }
  }, [exam.id, userId, exam.duration, storageKey])

  // Save exam session to localStorage whenever relevant data changes
  useEffect(() => {
    if (isLoading) return // Don't save while loading

    const sessionData: ExamSessionData = {
      examId: exam.id,
      userId,
      answers: answersRef.current,
      startTime,
      currentQuestion,
      timeLeft
    }

    try {
      localStorage.setItem(storageKey, JSON.stringify(sessionData))
    } catch (error) {
      console.error("Error saving exam session to localStorage:", error)
    }
  }, [answers, currentQuestion, timeLeft, startTime, exam.id, userId, storageKey, isLoading])

  // Clear localStorage when exam is submitted
  const clearExamSession = () => {
    try {
      localStorage.removeItem(storageKey)
    } catch (error) {
      console.error("Error clearing exam session from localStorage:", error)
    }
  }

  // Update handleAnswer to clear warning automatically
  const handleAnswer = (answer: string) => {
    const questionId = exam.questions[currentQuestion].id
    setAnswers(prev => {
      const newAnswers = { ...prev, [questionId]: answer }
      answersRef.current = newAnswers // update ref
      return newAnswers
    })

    if (warningQuestionId === questionId) {
      setWarningQuestionId(null)
    }

    const remaining = exam.questions.filter(q => !answersRef.current[q.id] && q.id !== questionId)
    if (remaining.length === 0) {
      setCurrentQuestion(exam.questions.length - 1)
    }
  }

  const handleSubmit = async (forceSubmit = false) => {
    const currentAnswers = answersRef.current
    const unanswered = exam.questions.filter(q => !currentAnswers[q.id])

    if (unanswered.length > 0 && !forceSubmit) {
      const firstUnanswered = unanswered[0]
      setCurrentQuestion(exam.questions.findIndex(q => q.id === firstUnanswered.id))
      setWarningQuestionId(firstUnanswered.id)
      window.scrollTo({ top: 0, behavior: "smooth" })
      return
    }

    if (submitRef.current || isSubmitting) return
    submitRef.current = true
    setIsSubmitting(true)

    try {
      const res = await fetch("/api/student/submit-exam", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examId: exam.id,
          userId,
          answers: currentAnswers, // use the latest from ref
          startTime: new Date(startTime),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setSubmitted(true)
        clearExamSession() // Clear localStorage on successful submission
        router.push(`/student/result/${data.resultId}`)
      } else {
        submitRef.current = false
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Submit error:", error)
      submitRef.current = false
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isLoading) return // Don't start timer while loading

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmit(true) // force submission
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isLoading]) // Add isLoading as dependency

  // Clean up localStorage on component unmount if not submitted
  useEffect(() => {
    return () => {
      if (!submitted && timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [submitted])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const question = exam.questions[currentQuestion]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2">Loading your exam session...</span>
      </div>
    )
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-black text-white border-b border-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-wrap gap-4">
          <h1 className="text-lg sm:text-xl font-bold">{exam.title}</h1>
          <div className={`text-base sm:text-lg font-mono font-bold ${timeLeft < 300 ? "text-red-400" : ""}`}>
            {minutes}:{seconds.toString().padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <span className="text-xs sm:text-sm text-muted-foreground">
              Question {currentQuestion + 1} of {exam.questions.length}
            </span>
            <span className="text-xs sm:text-sm text-muted-foreground">Answered: {Object.keys(answers).length}</span>
          </div>
          <div className="w-full bg-border rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / exam.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {warningQuestionId === question.id && (
          <div className="text-red-500 font-semibold mb-4">
            You haven't answered this question yet!
          </div>
        )}
        <div className="bg-card border border-border rounded-lg p-4 sm:p-8 mb-8">

          {question.passage && (
            <div className="bg-secondary bg-opacity-10 border-l-4 border-secondary p-3 sm:p-4 mb-6 overflow-x-auto">
              <p className="text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono">
                {question.passage.content}
              </p>
            </div>
          )}

          <h2 className="text-base sm:text-xl font-semibold text-foreground mb-6">
            <p className="whitespace-pre-wrap">
              {question.questionText.split(/({{.*?}})/g).map((part, idx) => {
                if (part.startsWith("{{") && part.endsWith("}}")) {
                  // remove the curly braces and style as small text
                  const content = part.slice(2, -2)
                  return (
                    <span key={idx} className="text-xs text-muted-foreground ml-1">
                      {content}
                    </span>
                  )
                }
                return <span key={idx}>{part}</span>
              })}
            </p>
          </h2>

          <div className="space-y-3">
            {[
              { label: "A", text: question.optionA },
              { label: "B", text: question.optionB },
              { label: "C", text: question.optionC },
              { label: "D", text: question.optionD },
            ].map((option) => (
              <label
                key={option.label}
                className="flex items-start gap-3 p-3 border border-border rounded cursor-pointer hover:bg-secondary hover:bg-opacity-20"
              >
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option.label}
                  checked={answers[question.id] === option.label}
                  onChange={() => handleAnswer(option.label)}
                  className="w-4 h-4 mt-1"
                />
                <div className="flex-1">
                  <span className="font-mono font-semibold text-foreground">{option.label}.</span>
                  <span className="text-foreground ml-2">{option.text}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="px-4 sm:px-6 py-2 bg-secondary text-secondary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50 order-2 sm:order-1"
          >
            Previous
          </button>

          <div className="flex gap-2 flex-wrap justify-center order-3 sm:order-2">
            {exam.questions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentQuestion(idx)}
                className={`w-8 h-8 sm:w-10 sm:h-10 rounded font-medium text-sm ${idx === currentQuestion
                  ? "bg-primary text-primary-foreground"
                  : answers[exam.questions[idx].id]
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-gray-400 text-foreground"
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
            disabled={submitted || isSubmitting}
            className="px-4 sm:px-6 py-2 bg-primary text-primary-foreground rounded font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-3"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Submitting...</span>
              </>
            ) : currentQuestion === exam.questions.length - 1 ? (
              "Submit"
            ) : (
              "Next"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
