"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"
import AdminNav from "@/components/admin-nav"

export default function ExamSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const [exam, setExam] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(0)
  const [canStart, setCanStart] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const resolvedParams = useParams()
  const examId = resolvedParams.id as string

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/admin/exams/${examId}`)
        if (res.ok) {
          const data = await res.json()
          setExam(data.exam)
          setTitle(data.exam.title)
          setDuration(data.exam.duration)
          setCanStart(data.exam.canStart)
        }
      } catch (err) {
        setError("Failed to load exam")
      }
      setLoading(false)
    }
    fetchExam()
  }, [examId])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!title.trim()) {
      setError("Title is required")
      return
    }

    if (duration < 1 || duration > 480) {
      setError("Duration must be between 1 and 480 minutes")
      return
    }

    try {
      const res = await fetch(`/api/admin/exams/${examId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          duration,
          canStart,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        setExam(data.exam)
        setSuccess("Exam settings updated successfully!")
        setTimeout(() => setSuccess(""), 3000)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to update exam")
      }
    } catch (err) {
      setError("Failed to update exam")
    }
  }

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this exam? This cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/admin/exams/${examId}/delete`, {
        method: "DELETE",
      })

      if (res.ok) {
        router.push("/admin/exams")
      } else {
        const err = await res.json()
        setError(err.error || "Failed to delete exam")
      }
    } catch (err) {
      setError("Failed to delete exam")
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-2xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="text-sm text-primary hover:underline mb-4 flex items-center gap-1"
        >
          ← Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">{exam?.title}</h1>
          <p className="text-muted-foreground">Configure exam settings</p>
        </div>

        {error && (
          <div className="bg-destructive bg-opacity-10 border border-destructive rounded p-4 mb-6 text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary bg-opacity-10 border border-primary rounded p-4 mb-6 text-primary">{success}</div>
        )}

        <form onSubmit={handleUpdate} className="bg-card border border-border rounded-lg p-6 space-y-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
            <input
              type="number"
              min="1"
              max="480"
              value={duration}
              onChange={(e) => setDuration(Number.parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-muted-foreground mt-1">1-480 minutes allowed</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="canStart"
              checked={canStart}
              onChange={(e) => setCanStart(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="canStart" className="text-sm font-medium text-foreground">
              Allow students to start this exam
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90"
          >
            Update Exam Settings
          </button>
        </form>

        <div className="border border-destructive rounded-lg p-6">
          <h2 className="text-lg font-semibold text-destructive mb-4">Danger Zone</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Delete this exam permanently. This cannot be undone. You can only delete exams that haven't started.
          </p>
          <button
            onClick={handleDelete}
            className="w-full bg-destructive text-white py-2 rounded font-medium hover:opacity-90"
          >
            Delete Exam
          </button>
        </div>
      </div>
    </div>
  )
}
