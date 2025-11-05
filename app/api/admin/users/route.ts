import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Get all registered users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    })

    // Get statistics
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    })

    const totalStudents = await prisma.user.count({
      where: { role: "STUDENT" },
    })

    // Check if invitation model exists before querying
    if (!prisma.invitation) {
      throw new Error("Invitation model not available in Prisma client")
    }

    const totalPendingInvites = await prisma.invitation.count({
      where: { accepted: false }
    })

    const adminInvites = await prisma.invitation.findMany({
      where: {
        role: "ADMIN",
        accepted: false
      },
      orderBy: { createdAt: "desc" },
    })

    const studentInvites = await prisma.invitation.findMany({
      where: {
        role: "STUDENT",
        accepted: false
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      users,
      stats: {
        totalAdmins,
        totalStudents,
        totalUsers: users.length,
        totalPendingInvites,
      },
      invites: {
        admin: adminInvites,
        student: studentInvites,
      },
    })
  } catch (error: unknown) {
    console.error("Error fetching users:", error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: "Failed to fetch users",
      details: errorMessage
    }, { status: 500 })
  }
}