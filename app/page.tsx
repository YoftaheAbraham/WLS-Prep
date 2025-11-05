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
      <nav className="bg-primary text-primary-foreground border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">LiqaPrep</h1>
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
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">Master Your Exams with LiqaPrep</h2>
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">For Admins</h3>
            <p className="text-muted-foreground mb-4">
              Create exams with custom passages and questions. Manage students and track their performance in real-time.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Create exams</li>
              <li>✓ Add passages & questions</li>
              <li>✓ Invite students</li>
              <li>✓ View rankings</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">For Students</h3>
            <p className="text-muted-foreground mb-4">
              Take timed exams with a distraction-free interface. View your scores and see how you rank among peers.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Browse exams</li>
              <li>✓ Timed testing</li>
              <li>✓ View scores</li>
              <li>✓ Check rankings</li>
            </ul>
          </div>

          <div className="bg-card border border-border rounded-lg p-8">
            <h3 className="text-lg font-semibold text-foreground mb-3">Intuitive Design</h3>
            <p className="text-muted-foreground mb-4">
              Clean, minimal interface focused on the exam experience. Light and dark theme support for comfort.
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Dark mode</li>
              <li>✓ Responsive design</li>
              <li>✓ Real-time timer</li>
              <li>✓ Auto-submit</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 bg-card border border-border rounded-lg p-12 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-4">Ready to get started?</h3>
          <p className="text-muted-foreground mb-6">Sign up now to create exams or take your first test.</p>
          <Link
            href="/signup"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded font-medium hover:opacity-90"
          >
            Sign Up for Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground border-t border-border mt-20">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-sm">
          <p>LiqaPrep - Exam Platform for Modern Education</p>
        </div>
      </footer>
    </div>
  )
}
