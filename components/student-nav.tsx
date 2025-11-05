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
    <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <Link href="/student" className="text-lg sm:text-2xl font-bold hover:opacity-90">
            LiqaPrep
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
            <div className="text-xs sm:text-sm border-r border-white/30 pr-2 sm:pr-4">
              <p className="font-medium">{userName}</p>
              <p className="text-white/75">{userEmail}</p>
            </div>
            <Link href="/student/results" className="hover:opacity-80 transition text-sm">
              Results
            </Link>
            <ThemeToggle />
            <form onSubmit={handleLogout}>
              <button
                type="submit"
                className="px-3 sm:px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
