"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

interface StudentNavProps {
  userName: string
  userEmail: string
}

export default function StudentNav({ userName, userEmail }: StudentNavProps) {
  const router = useRouter()

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="bg-primary text-primary-foreground border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">LiqaPrep Student Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <p className="font-medium">{userName}</p>
            <p className="text-primary-foreground opacity-75 text-xs">{userEmail}</p>
          </div>
          <Link href="/student/results" className="text-primary-foreground hover:underline text-sm">
            All Results
          </Link>
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90 font-medium"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
