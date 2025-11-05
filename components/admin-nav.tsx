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
    <nav className="bg-primary text-primary-foreground border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link href="/admin" className="text-xl font-bold hover:opacity-90">
          LiqaPrep Admin
        </Link>
        <div className="flex items-center gap-4">
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
            className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  )
}
