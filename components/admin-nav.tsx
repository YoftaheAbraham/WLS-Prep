"use client"

import { useRouter } from "next/navigation"

export default function AdminNav() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <nav className="bg-primary text-primary-foreground border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">LiqaPrep Admin</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
