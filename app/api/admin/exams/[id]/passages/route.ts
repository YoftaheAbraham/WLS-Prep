import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getCurrentUser()
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { content } = await request.json()

    const passage = await prisma.passage.create({
      data: {
        examId: params.id,
        content,
      },
    })

    return NextResponse.json({ passage })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create passage" }, { status: 500 })
  }
}
