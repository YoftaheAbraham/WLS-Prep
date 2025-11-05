"use client"

import type React from "react"

import { useState } from "react"
import AdminNav from "@/components/admin-nav"

export default function AddAdminsPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [admins, setAdmins] = useState<Array<{ email: string; token: string; tempPassword: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = "Admin name is required"
    }

    if (!email.trim()) {
      errors.email = "Email is required"
    } else if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.email = "Please enter a valid email"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    setError("")
    setSuccess("")

    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      })

      if (res.ok) {
        const data = await res.json()
        setAdmins([...admins, { email, token: data.token, tempPassword: data.tempPassword }])
        setEmail("")
        setName("")
        setFormErrors({})
        setSuccess(`Admin account created for ${email}`)
      } else {
        const err = await res.json()
        setError(err.error || "Failed to create admin")
      }
    } catch (err) {
      setError("Failed to create admin")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setSuccess(`${type} copied to clipboard!`)
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add Admin</h1>
        <p className="text-muted-foreground mb-8">Create new admin accounts with invitation tokens</p>

        {error && (
          <div className="bg-destructive bg-opacity-10 border border-destructive rounded p-4 mb-6 text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-primary bg-opacity-10 border border-primary rounded p-4 mb-6 text-primary">{success}</div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleAddAdmin} className="bg-card border border-border rounded-lg p-6 space-y-4 h-fit">
            <h2 className="text-lg font-semibold text-foreground">Create Admin Account</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (formErrors.name) setFormErrors({ ...formErrors, name: "" })
                }}
                className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.name && <p className="text-sm text-destructive mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (formErrors.email) setFormErrors({ ...formErrors, email: "" })
                }}
                className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Admin"}
            </button>
          </form>

          {/* Created Admins List */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Created Admins ({admins.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {admins.length === 0 ? (
                <p className="text-sm text-muted-foreground">No admins created yet</p>
              ) : (
                admins.map((admin, idx) => (
                  <div key={idx} className="bg-background border border-border rounded p-3">
                    <p className="text-sm font-medium text-foreground">{admin.email}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-muted-foreground">Temp Password:</p>
                      <p className="text-xs text-muted-foreground break-all font-mono bg-secondary bg-opacity-20 p-2 rounded">
                        {admin.tempPassword}
                      </p>
                      <button
                        onClick={() => copyToClipboard(admin.tempPassword, "Password")}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy Password
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">Invitation Token:</p>
                      <p className="text-xs text-muted-foreground break-all font-mono bg-secondary bg-opacity-20 p-2 rounded mt-1">
                        {admin.token}
                      </p>
                      <button
                        onClick={() => copyToClipboard(admin.token, "Token")}
                        className="text-xs text-primary hover:underline"
                      >
                        Copy Token
                      </button>
                    </div>
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
