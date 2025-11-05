"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function SignupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [invitationToken, setInvitationToken] = useState("")
  const [role, setRole] = useState<"ADMIN" | "STUDENT">("STUDENT")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!invitationToken.trim()) {
        setError("Invitation token is required")
        setLoading(false)
        return
      }

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          invitationToken,
          role,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Signup failed")
        return
      }

      // Redirect based on role
      if (data.user.role === "ADMIN") {
        router.push("/admin")
      } else {
        router.push("/student")
      }
    } catch (err: unknown) {
      setError("An error occurred")
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      console.error("Signup error:", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-lg p-8">
        <h1 className="text-2xl font-bold text-foreground mb-2 text-center">Create Account</h1>
        <p className="text-sm text-muted-foreground text-center mb-6">Use your invitation token to sign up</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Account Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="STUDENT"
                  checked={role === "STUDENT"}
                  onChange={(e) => setRole(e.target.value as "STUDENT" | "ADMIN")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Student</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="ADMIN"
                  checked={role === "ADMIN"}
                  onChange={(e) => setRole(e.target.value as "STUDENT" | "ADMIN")}
                  className="w-4 h-4"
                />
                <span className="text-sm text-foreground">Admin</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
              placeholder="Min 6 characters"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Invitation Token</label>
            <input
              type="text"
              value={invitationToken}
              onChange={(e) => setInvitationToken(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-input rounded text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
              placeholder="Paste your token here"
              required
            />
            <p className="text-xs text-muted-foreground mt-1">Check your email or ask your admin for the token</p>
          </div>

          {error && <p className="text-sm text-destructive p-2 rounded">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-2 rounded font-medium hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}
