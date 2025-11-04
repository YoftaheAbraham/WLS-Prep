import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import AdminNav from "@/components/admin-nav"

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Create Exam</h2>
            <p className="text-sm text-muted-foreground mb-4">Add a new exam with questions</p>
            <a
              href="/admin/exams/new"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Create Exam
            </a>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Manage Exams</h2>
            <p className="text-sm text-muted-foreground mb-4">Edit or publish existing exams</p>
            <a
              href="/admin/exams"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              View Exams
            </a>
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">Manage Students</h2>
            <p className="text-sm text-muted-foreground mb-4">Add students with invitations</p>
            <a
              href="/admin/students"
              className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded hover:opacity-90"
            >
              Add Students
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
