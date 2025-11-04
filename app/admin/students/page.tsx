"use client"

import type React from "react"

import { useState } from "react"
import AdminNav from "@/components/admin-nav"

export default function AddStudentsPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [token, setToken] = useState("")
  const [invitations, setInvitations] = useState<Array<{ email: string; token: string }>>([])
  const [loading, setLoading] = useState(false)

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      if (res.ok) {
        const data = await res.json()
        setInvitations([...invitations, { email, token: data.token }])
        setEmail("")
        setName("")
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
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-8">Add Students</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleAddStudent} className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Generate Invitation</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Student Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate Invitation"}
            </button>
          </form>

          {/* Invitations List */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Generated Invitations</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {invitations.length === 0 ? (
                <p className="text-sm text-muted-foreground">No invitations generated yet</p>
              ) : (
                invitations.map((inv, idx) => (
                  <div key={idx} className="bg-background border border-border rounded p-3">
                    <p className="text-sm font-medium text-foreground">{inv.email}</p>
                    <p className="text-xs text-muted-foreground break-all font-mono mt-2">{inv.token}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
