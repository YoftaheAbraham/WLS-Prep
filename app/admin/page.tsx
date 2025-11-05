import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import AdminNav from "@/components/admin-nav"
import Link from "next/link"

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== "ADMIN") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-foreground mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Create Exam</h2>
            <p className="text-sm text-muted-foreground mb-4">Add a new exam with questions</p>
            <Link
              href="/admin/exams/new"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Create Exam
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Manage Exams</h2>
            <p className="text-sm text-muted-foreground mb-4">Edit or publish existing exams</p>
            <Link
              href="/admin/exams"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              View Exams
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Add Students</h2>
            <p className="text-sm text-muted-foreground mb-4">Create student invitations</p>
            <Link
              href="/admin/students"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Add Students
            </Link>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Add Admin</h2>
            <p className="text-sm text-muted-foreground mb-4">Create new admin account</p>
            <Link
              href="/admin/admins"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Add Admin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
