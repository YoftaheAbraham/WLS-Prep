"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import AdminNav from "@/components/admin-nav"
import { Loader2 } from "lucide-react"

export default function CreateExamPage() {
  const [title, setTitle] = useState("")
  const [duration, setDuration] = useState(30)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, duration }),
      })

      if (res.ok) {
        const data = await res.json()
        router.push(`/admin/exams/${data.exam.id}`)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-8">Create New Exam</h1>

        <form onSubmit={handleCreate} className="bg-card border border-border rounded-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Exam Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Duration (minutes)</label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number.parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
              min="1"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Exam"
            )}
          </button>
        </form>
      </div>
    </div>
  )
}