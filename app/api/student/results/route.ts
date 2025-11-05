import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user || user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await prisma.result.findMany({
      where: { userId: user.id },
      include: { exam: true },
      orderBy: { submittedAt: "desc" },
    })

    return NextResponse.json({ results })
  } catch (error) {
    console.error("[v0] Error fetching results:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
