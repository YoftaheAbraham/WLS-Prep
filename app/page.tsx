import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import Link from "next/link"

export default async function HomePage() {
  const user = await getCurrentUser()

  if (user) {
    if (user.role === "ADMIN") {
      redirect("/admin")
    } else {
      redirect("/student")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-black text-white border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">WLSPrep</h1>
          <div className="flex gap-4">
            <Link href="/login" className="px-4 py-2 hover:opacity-90">
              Login
            </Link>
            <Link href="/signup" className="px-4 py-2 bg-primary-foreground text-primary rounded hover:opacity-90">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Master Your Exams with WLSPrep</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            A comprehensive platform for creating, managing, and taking timed exams. Built for educators and students.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/signup"
              className="bg-primary text-primary-foreground px-8 py-3 rounded font-medium hover:opacity-90"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="border border-border text-foreground px-8 py-3 rounded font-medium hover:bg-muted"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
          <p>WLSPrep - Exam Platform for Modern Education</p>
        </div>
      </footer>
    </div>
  )
}
