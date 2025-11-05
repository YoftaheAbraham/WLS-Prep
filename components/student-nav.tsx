"use client"

import type React from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"
import ThemeToggle from "./theme-toggle"

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
    <nav className="bg-primary text-primary-foreground border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/student" className="text-2xl font-bold hover:opacity-90">
          LiqaPrep Student
        </Link>
        <div className="flex items-center gap-4">
          <div className="text-sm border-r border-primary-foreground/30 pr-4">
            <p className="font-medium">{userName}</p>
            <p className="text-primary-foreground/75 text-xs">{userEmail}</p>
          </div>
          <Link href="/student/results" className="hover:opacity-80 transition text-sm">
            All Results
          </Link>
          <ThemeToggle />
          <form onSubmit={handleLogout}>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90 font-medium text-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
