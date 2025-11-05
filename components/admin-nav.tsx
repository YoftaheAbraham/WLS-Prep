"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import ThemeToggle from "./theme-toggle"

export default function AdminNav() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="bg-black text-white border-b border-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center flex-wrap gap-4">
        <Link href="/admin" className="text-lg sm:text-xl font-bold hover:opacity-90">
          LiqaPrep Admin
        </Link>
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          <Link href="/admin/exams" className="hover:opacity-80 transition text-sm">
            Exams
          </Link>
          <Link href="/admin/students" className="hover:opacity-80 transition text-sm">
            Students
          </Link>
          <Link href="/admin/admins" className="hover:opacity-80 transition text-sm">
            Admins
          </Link>
          <ThemeToggle />
          <button
            onClick={handleLogout}
            className="px-3 sm:px-4 py-2 bg-white text-black rounded hover:opacity-90 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
