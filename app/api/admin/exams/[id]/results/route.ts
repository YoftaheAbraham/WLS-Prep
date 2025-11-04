import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const results = await prisma.result.findMany({
      where: { examId: params.id },
      include: { user: true },
      orderBy: { score: "desc" },
    })

    return NextResponse.json({ results })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
