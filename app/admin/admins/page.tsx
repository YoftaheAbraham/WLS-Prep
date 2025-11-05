"use client"

import type React from "react"

import { useState } from "react"
import AdminNav from "@/components/admin-nav"
import Link from "next/link"

interface AdminInvitation {
  id: string
  email: string
  name: string
  token?: string
  tempPassword?: string
  createdAt: string
  expiresAt: string
}

export default function AddAdminsPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [admins, setAdmins] = useState<AdminInvitation[]>([])
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

      const data = await res.json()
      console.log("API Response:", data)

      if (res.ok) {
        // Handle the new response structure
        if (data.success && data.data) {
          const newAdmin = {
            ...data.data.invitation,
            token: data.data.token || "Token not available",
            tempPassword: data.data.tempPassword || "Password not available"
          }
          
          setAdmins(prev => [newAdmin, ...prev])
          setEmail("")
          setName("")
          setFormErrors({})
          setSuccess(data.message || `Admin invitation created for ${email}`)
        } else {
          setError("Invalid response format from server")
        }
      } else {
        setError(data.error || "Failed to create admin invitation")
      }
    } catch (err) {
      setError("Failed to create admin invitation. Please check your connection.")
      console.error("[AddAdmins] Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setSuccess(`${type} copied to clipboard!`)
    setTimeout(() => setSuccess(""), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Add Admin</h1>
        <p className="text-muted-foreground mb-8">
          Create new admin accounts with invitation tokens and temporary passwords
        </p>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError("")}
              className="text-destructive hover:text-destructive/80 transition-colors text-lg"
            >
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6 text-green-600 flex items-center justify-between">
            <span>{success}</span>
            <button 
              onClick={() => setSuccess("")}
              className="text-green-600 hover:text-green-500 transition-colors text-lg"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form */}
          <form onSubmit={handleAddAdmin} className="bg-card border border-border rounded-xl p-6 space-y-4 h-fit">
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
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="Enter admin's full name"
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
                className="w-full px-3 py-2 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                placeholder="admin@example.com"
              />
              {formErrors.email && <p className="text-sm text-destructive mt-1">{formErrors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background py-2.5 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin Invitation"
              )}
            </button>
          </form>

          {/* Created Admins List */}
          <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Created Invitations</h2>
              <span className="bg-foreground/10 text-foreground px-2 py-1 rounded text-sm font-medium">
                {admins.length}
              </span>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {admins.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-foreground/5 flex items-center justify-center">
                    <span className="text-lg">👨‍💼</span>
                  </div>
                  <p className="text-sm text-muted-foreground">No admin invitations created yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Invitations will appear here</p>
                </div>
              ) : (
                admins.map((admin, idx) => (
                  <div key={admin.id || idx} className="bg-background border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{admin.name}</p>
                        <p className="text-xs text-muted-foreground">{admin.email}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Expires: {formatDate(admin.expiresAt)}
                        </p>
                      </div>
                    </div>
                    
                    {admin.tempPassword && admin.tempPassword !== "Password not available" && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Temporary Password:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-foreground/5 p-2 rounded font-mono break-all">
                            {admin.tempPassword}
                          </code>
                          <button
                            onClick={() => copyToClipboard(admin.tempPassword!, "Password")}
                            className="px-3 py-1.5 bg-foreground text-background rounded text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {admin.token && admin.token !== "Token not available" && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Invitation Token:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-foreground/5 p-2 rounded font-mono break-all">
                            {admin.token}
                          </code>
                          <button
                            onClick={() => copyToClipboard(admin.token!, "Token")}
                            className="px-3 py-1.5 bg-foreground text-background rounded text-xs font-medium hover:opacity-90 transition-opacity whitespace-nowrap"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">How to Invite Admins</h3>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-semibold">1</span>
              <span>Fill in admin name and email above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-semibold">2</span>
              <span>Click "Create Admin Invitation" to generate credentials</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-semibold">3</span>
              <span>Copy the token and temporary password</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-semibold">4</span>
              <span>Share both with the admin securely</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-foreground text-background rounded-full text-xs flex items-center justify-center font-semibold">5</span>
              <span>
                Admin signs up at{" "}
                <Link href="/signup" className="text-foreground font-medium hover:underline">
                  /signup
                </Link>{" "}
                with the exact same email and changes password
              </span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  )
}
