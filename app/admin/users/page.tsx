"use client"

import { useEffect, useState } from "react"
import AdminNav from "@/components/admin-nav"
import Link from "next/link"
import { Loader2 } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "ADMIN" | "STUDENT"
  createdAt: string
}

interface Invitation {
  id: string
  name: string
  email: string
  role: "ADMIN" | "STUDENT"
  accepted: boolean
  token: string
  createdAt: string
  expiresAt: string
}

interface Stats {
  totalAdmins: number
  totalStudents: number
  totalUsers: number
  totalPendingInvites: number
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [adminInvites, setAdminInvites] = useState<Invitation[]>([])
  const [studentInvites, setStudentInvites] = useState<Invitation[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState<"users" | "admin-invites" | "student-invites">("users")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/admin/users")
      const data = await res.json()

      console.log(data);
      

      if (!res.ok) {
        setError(data.error || "Failed to fetch data")
        return
      }

      setUsers(data.users)
      setStats(data.stats)
      setAdminInvites(data.invites.admin)
      setStudentInvites(data.invites.student)
    } catch (err) {
      setError("An error occurred while fetching data")
      console.error(" Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "ADMIN":
        return "bg-background border border-foreground/20 text-foreground"
      case "STUDENT":
        return "bg-foreground/5 text-foreground"
      case "PENDING":
        return "bg-foreground/10 text-foreground"
      default:
        return "bg-foreground/5 text-foreground"
    }
  }

  const isInviteExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AdminNav />
        <div className="max-w-7xl mx-auto p-6">
          <Loader2 className="h-3 w-3 animate-spin"/>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminNav />
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-2">Manage users and invitations</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/students"
              className="px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
            >
              Invite Students
            </Link>
            <Link
              href="/admin/admins"
              className="px-4 py-2 border border-foreground/20 text-foreground rounded-lg font-medium hover:bg-foreground/5 transition-colors text-sm"
            >
              Invite Admins
            </Link>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 text-destructive flex items-center justify-between">
            <span>{error}</span>
            <button 
              onClick={() => setError("")}
              className="text-destructive hover:text-destructive/80 transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <span className="text-lg">👤</span>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Total Admins</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalAdmins}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <span className="text-lg">🎓</span>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                  <span className="text-lg">📊</span>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Total Registered</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalUsers}</p>
                </div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-xl p-5 transition-all hover:shadow-sm">
              <div className="flex items-center gap-3">
                {/* <div className="w-10 h-10 rounded-lg bg-foreground/10 flex items-center justify-center">
                  <span className="text-lg">✉️</span>
                </div> */}
                <div>
                  <p className="text-sm text-muted-foreground">Pending Invites</p>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalPendingInvites}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="flex overflow-x-auto border-b border-border">
            <button
              onClick={() => setActiveTab("users")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === "users"
                  ? "text-foreground border-b-2 border-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/2"
              }`}
            >
              Registered Users
              <span className={`px-2 py-1 rounded text-xs ${
                activeTab === "users" ? "bg-foreground/10" : "bg-foreground/5"
              }`}>
                {users.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("admin-invites")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === "admin-invites"
                  ? "text-foreground border-b-2 border-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/2"
              }`}
            >
              Admin Invites
              <span className={`px-2 py-1 rounded text-xs ${
                activeTab === "admin-invites" ? "bg-foreground/10" : "bg-foreground/5"
              }`}>
                {adminInvites.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("student-invites")}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all whitespace-nowrap ${
                activeTab === "student-invites"
                  ? "text-foreground border-b-2 border-foreground bg-foreground/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/2"
              }`}
            >
              Student Invites
              <span className={`px-2 py-1 rounded text-xs ${
                activeTab === "student-invites" ? "bg-foreground/10" : "bg-foreground/5"
              }`}>
                {studentInvites.length}
              </span>
            </button>
          </div>

          <div className="p-6">
            {/* Registered Users Tab */}
            {activeTab === "users" && (
              <div>
                {users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                      <span className="text-2xl">👤</span>
                    </div>
                    <p className="text-muted-foreground mb-2">No registered users yet</p>
                    <p className="text-sm text-muted-foreground">Invite users to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-foreground/2">
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Role</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Registered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-foreground/2 transition-colors">
                            <td className="py-4 px-6 text-foreground font-medium">{user.name}</td>
                            <td className="py-4 px-6 text-foreground">{user.email}</td>
                            <td className="py-4 px-6">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusVariant(user.role)}`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-muted-foreground text-sm">
                              {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Admin Invites Tab */}
            {activeTab === "admin-invites" && (
              <div>
                {adminInvites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                      <span className="text-2xl">✉️</span>
                    </div>
                    <p className="text-muted-foreground mb-2">No pending admin invites</p>
                    <Link
                      href="/admin/admins"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                    >
                      Invite Admins
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-foreground/2">
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Expires</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">token</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {adminInvites.map((invite) => {
                          const expired = isInviteExpired(invite.expiresAt)
                          return (
                            <tr key={invite.id} className="hover:bg-foreground/2 transition-colors">
                              <td className="py-4 px-6 text-foreground font-medium">{invite.name}</td>
                              <td className="py-4 px-6 text-foreground">{invite.email}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                  expired 
                                    ? "bg-foreground/20 text-foreground" 
                                    : getStatusVariant("PENDING")
                                }`}>
                                  {expired ? "Expired" : "Pending"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-muted-foreground text-sm">
                                {new Date(invite.expiresAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-4 px-6 text-foreground">{invite.token}</td>
                              <td className="py-4 px-6 text-muted-foreground text-sm">
                                {new Date(invite.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Student Invites Tab */}
            {activeTab === "student-invites" && (
              <div>
                {studentInvites.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
                      <span className="text-2xl">🎓</span>
                    </div>
                    <p className="text-muted-foreground mb-2">No pending student invites</p>
                    <Link
                      href="/admin/students"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity text-sm"
                    >
                      Invite Students
                    </Link>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border bg-foreground/2">
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Name</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Email</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Status</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Expires</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Token</th>
                          <th className="text-left py-4 px-6 font-semibold text-foreground text-sm">Sent</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {studentInvites.map((invite) => {
                          const expired = isInviteExpired(invite.expiresAt)
                          return (
                            <tr key={invite.id} className="hover:bg-foreground/2 transition-colors">
                              <td className="py-4 px-6 text-foreground font-medium">{invite.name}</td>
                              <td className="py-4 px-6 text-foreground">{invite.email}</td>
                              <td className="py-4 px-6">
                                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                  expired 
                                    ? "bg-foreground/20 text-foreground" 
                                    : getStatusVariant("PENDING")
                                }`}>
                                  {expired ? "Expired" : "Pending"}
                                </span>
                              </td>
                              <td className="py-4 px-6 text-muted-foreground text-sm">
                                {new Date(invite.expiresAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                              <td className="py-4 px-6 text-foreground">{invite.token}</td>
                              <td className="py-4 px-6 text-muted-foreground text-sm">
                                {new Date(invite.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
